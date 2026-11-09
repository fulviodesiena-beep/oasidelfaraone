import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildDelegaPdf, delegaData, delegaFileName, delegaFingerprint, delegaState } from "@/lib/delega";

/** Generates (or regenerates when dates/travelers change) the Domina delega and stores it in the private documents bucket. */
export const ensureDelega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { bookingId: string; force?: boolean }) => {
    if (!/^[0-9a-f-]{36}$/i.test(i.bookingId)) throw new Error("Prenotazione non valida");
    return { bookingId: i.bookingId, force: !!i.force };
  })
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Non autorizzato");
    const [b, t, s, docs] = await Promise.all([
      db.from("bookings").select("*").eq("id", data.bookingId).single(),
      db.from("travelers").select("*").eq("booking_id", data.bookingId).order("position"),
      db.from("settings").select("holder_name, holder_passport, unit_number, holder_phone, domina_email").eq("id", 1).single(),
      db.from("documents").select("id, file_url, fingerprint").eq("booking_id", data.bookingId).eq("kind", "delega"),
    ]);
    if (b.error || t.error || s.error || docs.error) throw new Error((b.error ?? t.error ?? s.error ?? docs.error)!.message);
    const state = delegaState(b.data, t.data);
    if (state.kind !== "ready") return { status: state.kind, missing: "missing" in state ? state.missing : 0, documentId: null as string | null };
    const fp = delegaFingerprint(b.data, t.data, s.data);
    const current = docs.data.find(d => d.fingerprint === fp);
    if (current && !data.force) return { status: "ready", missing: state.missing, documentId: current.id };

    const get = async (path: string) => {
      const r = await db.storage.from("templates").download(path);
      return r.error || !r.data ? null : new Uint8Array(await r.data.arrayBuffer());
    };
    const [header, signature] = await Promise.all([get("header.png"), get("signature.png")]);
    const bytes = await buildDelegaPdf(delegaData(b.data, t.data, s.data), { header, signature });
    const name = delegaFileName(t.data, b.data.check_in, s.data.unit_number);
    const path = `${b.data.id}/delega-${Date.now()}.pdf`;
    const up = await db.storage.from("documents").upload(path, bytes, { contentType: "application/pdf" });
    if (up.error) throw new Error(up.error.message);
    const ins = await db.from("documents").insert({ booking_id: b.data.id, name, file_url: path, file_type: "application/pdf", uploaded_by: "system", kind: "delega", fingerprint: fp }).select("id").single();
    if (ins.error) throw new Error(ins.error.message);
    if (docs.data.length) {
      await db.storage.from("documents").remove(docs.data.map(d => d.file_url));
      await db.from("documents").delete().in("id", docs.data.map(d => d.id));
    }
    return { status: "ready", missing: state.missing, documentId: ins.data.id };
  });
