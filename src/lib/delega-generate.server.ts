// Delega generation shared by the admin server function (user client under RLS) and the hourly job (service role).
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { buildDelegaPdf, delegaData, delegaFileName, delegaFingerprint, delegaSetupError, delegaSetupMissing, delegaState, DELEGA_UPLOADER } from "@/lib/delega";

export type DelegaResult = { status: "ready" | "not_eligible" | "unpaid" | "missing_docs"; missing: number; documentId: string | null };

/** Generates (or regenerates when dates/travelers change) the Domina delega and stores it in the private documents bucket.
 *  Every failure is thrown with a readable Italian message so the admin UI and the job log can show it. */
export async function generateDelega(db: SupabaseClient<Database>, bookingId: string, force = false): Promise<DelegaResult> {
    const fail = (step: string, e: unknown): never => {
      const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
      console.error(`[ensureDelega] ${bookingId} ${step}:`, msg);
      throw new Error(`Delega: ${step} non riuscito (${msg})`);
    };
    const [b, t, s, docs] = await Promise.all([
      db.from("bookings").select("*").eq("id", bookingId).single(),
      db.from("travelers").select("*").eq("booking_id", bookingId).order("position"),
      db.from("settings").select("holder_name, holder_passport, unit_number, holder_phone, domina_email").eq("id", 1).single(),
      db.from("documents").select("id, file_url, fingerprint").eq("booking_id", bookingId).eq("kind", "delega"),
    ]);
    const readErr = b.error ?? t.error ?? s.error ?? docs.error;
    if (readErr) fail("lettura dati", readErr);
    // Per-room unit and holder override the global settings when set.
    const { data: room } = await db.from("rooms").select("unit_number, holder_name, holder_passport").eq("id", b.data!.room_id).maybeSingle();
    let settings = s.data!;
    if (room) settings = { ...settings, unit_number: room.unit_number || settings.unit_number, holder_name: room.holder_name || settings.holder_name, holder_passport: room.holder_passport || settings.holder_passport };
    const booking = b.data!, travelers = t.data!, existing = docs.data!;
    const state = delegaState(booking, travelers);
    if (state.kind !== "ready") return { status: state.kind, missing: "missing" in state ? state.missing : 0, documentId: null };
    const fp = delegaFingerprint(booking, travelers, settings);
    const current = existing.find(d => d.fingerprint === fp);
    if (current && !force) return { status: "ready", missing: state.missing, documentId: current.id };

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
}

/** Hourly job (punto C): prepares the delega server-side for paid stays starting within 60 days,
 *  so it is ready even if nobody opens the admin. Unchanged delegas are skipped by their fingerprint. */
export async function prepareDelegas(db: SupabaseClient<Database>, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const until = new Date(now.getTime() + 60 * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await db.from("bookings").select("id").in("status", ["confirmed", "host_collab"]).gte("check_in", today).lte("check_in", until);
  if (error) throw new Error(error.message);
  const out = { checked: data?.length ?? 0, ready: 0, errors: [] as string[] };
  for (const b of data ?? []) {
    try { if ((await generateDelega(db, b.id)).status === "ready") out.ready++; }
    catch (e) { out.errors.push(`${b.id}: ${(e as Error).message}`); }
  }
  return out;
}
