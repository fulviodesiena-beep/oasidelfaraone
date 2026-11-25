import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BOOKING_COM_LINKED, parseIcal } from "@/lib/ical";

export type SyncResult = { ok: boolean; imported: number; removed: number; error?: string };

/** Imports the Booking.com iCal feed into availability_blocks (source='booking'). Never touches bookings. */
export async function syncBookingIcal(db: SupabaseClient<Database>): Promise<SyncResult> {
  if (!BOOKING_COM_LINKED) return { ok: true, imported: 0, removed: 0 };
  const now = new Date().toISOString();
  const { data: s, error: se } = await db.from("settings").select("booking_ical_url").eq("id", 1).maybeSingle();
  if (se) return { ok: false, imported: 0, removed: 0, error: se.message };
  const url = s?.booking_ical_url?.trim();
  const fail = async (msg: string) => { await db.from("settings").update({ last_sync_attempt_at: now, last_sync_error: msg }).eq("id", 1); return { ok: false, imported: 0, removed: 0, error: msg }; };
  if (!url) return fail("URL iCal di Booking.com non impostato");
  if (!/^https:\/\//i.test(url)) return fail("L'URL deve iniziare con https://");
  try {
    const res = await fetch(url, { headers: { accept: "text/calendar" }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return fail(`Booking.com ha risposto ${res.status}`);
    const text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) return fail("Il link non restituisce un calendario iCal");
    const events = parseIcal(text);
    if (events.length) {
      const { error } = await db.from("availability_blocks").upsert(
        events.map(e => ({ start_date: e.start, end_date: e.end, status: "booking", source: "booking", external_uid: e.uid, reason: "Booking.com", updated_at: now })),
        { onConflict: "source,external_uid" });
      if (error) return fail(error.message);
    }
    const { data: existing, error: le } = await db.from("availability_blocks").select("id, external_uid").eq("source", "booking");
    if (le) return fail(le.message);
    const keep = new Set(events.map(e => e.uid));
    const gone = (existing ?? []).filter(b => !b.external_uid || !keep.has(b.external_uid)).map(b => b.id);
    if (gone.length) { const { error } = await db.from("availability_blocks").delete().in("id", gone); if (error) return fail(error.message); }
    await db.from("settings").update({ last_sync_attempt_at: now, last_sync_success_at: now, last_sync_error: null }).eq("id", 1);
    return { ok: true, imported: events.length, removed: gone.length };
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Errore di rete");
  }
}
