// Admin actions of the delega flow: guest upload link and "Invia al Domina" (Gmail API from prenotazionisharm).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DELEGA_LOG, DELEGA_SENDER, DOMINA_RECIPIENTS, GUEST_DOC_KIND, buildMime, canSendDelega, delegaEmail, BLOCKER_TEXT, type MailAttachment } from "./delega-flow";

const uuid = (v: unknown) => { if (typeof v !== "string" || !/^[0-9a-f-]{36}$/i.test(v)) throw new Error("Prenotazione non valida"); return v; };

/** Private link for the guest page /documenti/<token>, valid until two days after check-out. */
export const guestUploadLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { bookingId: string }) => ({ bookingId: uuid(i.bookingId) }))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Non autorizzato");
    const { data: b } = await db.from("bookings").select("check_out").eq("id", data.bookingId).single();
    if (!b) throw new Error("Prenotazione non trovata");
    const { signUploadToken, uploadExpiry } = await import("./automations/tokens");
    const { SITE } = await import("./automations/run.server");
    return { url: `${SITE}/documenti/${await signUploadToken(data.bookingId, uploadExpiry(b.check_out))}` };
  });

/** Sends delega + travelers' documents to the Domina from prenotazionisharm@gmail.com and logs it in email_log. */
export const sendDelegaToDomina = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { bookingId: string; force?: boolean }) => ({ bookingId: uuid(i.bookingId), force: !!i.force }))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Non autorizzato");
    const { hasGmail, sendGmail } = await import("./gmail.server");
    if (!hasGmail()) throw new Error("Invio non configurato: servono GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET e GMAIL_REFRESH_TOKEN in Cloud → Secrets.");
    // Make sure the delega reflects the latest data before deciding.
    const { generateDelega } = await import("./delega-generate.server");
    await generateDelega(db, data.bookingId, false);
    const [b, t, s, docs, logs] = await Promise.all([
      db.from("bookings").select("*").eq("id", data.bookingId).single(),
      db.from("travelers").select("*").eq("booking_id", data.bookingId).order("position"),
      db.from("settings").select("unit_number, domina_email").eq("id", 1).single(),
      db.from("documents").select("id, name, file_url, file_type, kind, fingerprint, created_at").eq("booking_id", data.bookingId).in("kind", ["delega", GUEST_DOC_KIND]),
      db.from("email_log").select("step").eq("booking_id", data.bookingId).eq("automation", DELEGA_LOG).eq("status", "sent"),
    ]);
    const err = b.error ?? t.error ?? s.error ?? docs.error ?? logs.error;
    if (err) throw new Error(err.message);
    const { data: room } = await db.from("rooms").select("unit_number").eq("id", b.data!.room_id).maybeSingle();
    const unit = room?.unit_number || s.data!.unit_number;
    const delega = (docs.data ?? []).filter(d => d.kind === "delega").sort((x, y) => y.created_at.localeCompare(x.created_at))[0] ?? null;
    const files = (docs.data ?? []).filter(d => d.kind === GUEST_DOC_KIND);
    const check = canSendDelega({ booking: b.data!, travelers: t.data!, delega, files: files.length, sentFingerprints: (logs.data ?? []).map(l => l.step), force: data.force });
    if (!check.ok) throw new Error(`Delega non inviata: ${check.blockers.map(x => BLOCKER_TEXT[x]).join("; ")}.`);

    const attachments: MailAttachment[] = [];
    for (const d of [delega!, ...files]) {
      const r = await db.storage.from("documents").download(d.file_url);
      if (r.error || !r.data) throw new Error(`Allegato non leggibile: ${d.name}`);
      const ext = d.file_url.split(".").pop() ?? "pdf";
      attachments.push({ filename: d.kind === "delega" ? d.name : `${d.name}.${ext}`, contentType: d.file_type || "application/octet-stream", data: new Uint8Array(await r.data.arrayBuffer()) });
    }
    const size = attachments.reduce((n, a) => n + a.data.length, 0);
    if (size > 24 * 1024 * 1024) throw new Error("Allegati troppo pesanti (oltre 24 MB): chiedi all'ospite foto più leggere.");
    const { subject, text } = delegaEmail(unit, b.data!.check_in, b.data!.check_out);
    const rcpt = DOMINA_RECIPIENTS(s.data!.domina_email);
    const fp = delega!.fingerprint ?? "manuale";
    // Reserve the log row first (unique dedup key): a double click never sends twice.
    const { data: row, error } = await db.from("email_log").insert({
      automation: DELEGA_LOG, step: fp, channel: "email", booking_id: data.bookingId, contact_id: b.data!.contact_id, language: "it",
      recipient: [rcpt.to, ...rcpt.cc].join(", "), subject, status: "queued",
      dedup_key: `${DELEGA_LOG}|${fp}|email|${data.bookingId}${data.force ? `|${Date.now()}` : ""}`,
      body: `${text}\nAllegati: ${attachments.map(a => a.filename).join(", ")}`,
    }).select("id").single();
    if (error) throw new Error(error.code === "23505" ? "Questa delega è già stata inviata." : error.message);
    try {
      const id = await sendGmail(buildMime({ from: DELEGA_SENDER, to: rcpt.to, cc: rcpt.cc, subject, text, attachments }));
      const sentAt = new Date().toISOString();
      await db.from("email_log").update({ status: "sent", sent_at: sentAt, provider_message_id: id }).eq("id", row.id);
      return { sentAt, to: rcpt.to, cc: rcpt.cc, attachments: attachments.map(a => a.filename) };
    } catch (e) {
      await db.from("email_log").update({ status: "error", reason: String((e as Error).message).slice(0, 500) }).eq("id", row.id);
      throw e;
    }
  });
