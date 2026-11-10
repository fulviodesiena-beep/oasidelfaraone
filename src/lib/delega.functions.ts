import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildDelegaPdf, delegaData, delegaFileName, delegaFingerprint, delegaSetupError, delegaSetupMissing, delegaState, DELEGA_UPLOADER } from "@/lib/delega";

/** Generates (or regenerates when dates/travelers change) the Domina delega and stores it in the private documents bucket.
 *  Every failure is thrown with a readable Italian message so the admin UI can show it. */
export const ensureDelega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { bookingId: string; force?: boolean }) => {
    if (!/^[0-9a-f-]{36}$/i.test(i.bookingId)) throw new Error("Prenotazione non valida");
    return { bookingId: i.bookingId, force: !!i.force };
  })
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const fail = (step: string, e: unknown): never => {
      const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
      console.error(`[ensureDelega] ${data.bookingId} ${step}:`, msg);
      throw new Error(`Delega: ${step} non riuscito (${msg})`);
    };
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Non autorizzato");
    const [b, t, s, docs] = await Promise.all([
      db.from("bookings").select("*").eq("id", data.bookingId).single(),
      db.from("travelers").select("*").eq("booking_id", data.bookingId).order("position"),
      db.from("settings").select("holder_name, holder_passport, unit_number, holder_phone, domina_email").eq("id", 1).single(),
      db.from("documents").select("id, file_url, fingerprint").eq("booking_id", data.bookingId).eq("kind", "delega"),
    ]);
    const readErr = b.error ?? t.error ?? s.error ?? docs.error;
    if (readErr) fail("lettura dati", readErr);
    // Per-room unit and holder override the global settings when set.
    const { data: room } = await db.from("rooms").select("unit_number, holder_name, holder_passport").eq("id", b.data!.room_id).maybeSingle();
    let settings = s.data!;
    if (room) settings = { ...settings, unit_number: room.unit_number || settings.unit_number, holder_name: room.holder_name || settings.holder_name, holder_passport: room.holder_passport || settings.holder_passport };
    const booking = b.data!, travelers = t.data!, existing = docs.data!;
    const state = delegaState(booking, travelers);
    if (state.kind !== "ready") return { status: state.kind, missing: "missing" in state ? state.missing : 0, documentId: null as string | null };
    const fp = delegaFingerprint(booking, travelers, settings);
    const current = existing.find(d => d.fingerprint === fp);
    if (current && !data.force) return { status: "ready", missing: state.missing, documentId: current.id };

    const get = async (path: string) => {
      const r = await db.storage.from("templates").download(path);
      return r.error || !r.data ? null : new Uint8Array(await r.data.arrayBuffer());
    };
    const [header, signature] = await Promise.all([get("header.png"), get("signature.png")]);
    const missing = delegaSetupMissing(settings, { header, signature });
    if (missing.length) throw new Error(delegaSetupError(missing));

    let bytes: Uint8Array;
    try { bytes = await buildDelegaPdf(delegaData(booking, travelers, settings), { header, signature }); } catch (e) { return fail("creazione PDF", e); }
    const name = delegaFileName(travelers, booking.check_in, settings.unit_number);
    const path = `${booking.id}/delega-${Date.now()}.pdf`;
    const up = await db.storage.from("documents").upload(path, bytes, { contentType: "application/pdf" });
    if (up.error) fail("caricamento PDF", up.error);
    const ins = await db.from("documents").insert({ booking_id: booking.id, name, file_url: path, file_type: "application/pdf", uploaded_by: DELEGA_UPLOADER, kind: "delega", fingerprint: fp }).select("id").single();
    if (ins.error) {
      await db.storage.from("documents").remove([path]);
      fail("salvataggio documento", ins.error);
    }
    // Drop previous delegas and any orphan delega files left by earlier failed attempts.
    if (existing.length) await db.from("documents").delete().in("id", existing.map(d => d.id));
    const listed = await db.storage.from("documents").list(booking.id, { limit: 100 });
    const stale = new Set(existing.map(d => d.file_url));
    for (const f of listed.data ?? []) if (f.name.startsWith("delega-")) stale.add(`${booking.id}/${f.name}`);
    stale.delete(path);
    if (stale.size) await db.storage.from("documents").remove([...stale]);
    return { status: "ready", missing: state.missing, documentId: ins.data!.id };
  });
