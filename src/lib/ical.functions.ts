import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!isAdmin) throw new Error("Non autorizzato");
}

/** "Sincronizza ora" from the admin settings page; runs as the signed-in admin under RLS. */
export const syncBookingNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { syncBookingIcal } = await import("@/lib/ical-sync.server");
    return syncBookingIcal(context.supabase);
  });

/** Opening dashboard/calendar/booking form: sync only if the last attempt is older than 1 minute. */
export const syncBookingIfStale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data: s } = await context.supabase.from("settings").select("last_sync_attempt_at, booking_ical_url").eq("id", 1).maybeSingle();
    const { isSyncStale } = await import("@/lib/ical");
    if (!s?.booking_ical_url || !isSyncStale(s.last_sync_attempt_at, new Date())) return { skipped: true, ok: true, imported: 0, removed: 0 };
    const { syncBookingIcal } = await import("@/lib/ical-sync.server");
    return { skipped: false, ...(await syncBookingIcal(context.supabase)) };
  });

/** Before saving confirmed/option: real-time Booking.com sync, then overlap check against blocks and active bookings. */
export const checkAvailabilityLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { checkIn: string; checkOut: string; excludeId?: string | null }) => {
    const re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(i.checkIn) || !re.test(i.checkOut)) throw new Error("Date non valide");
    if (i.excludeId && !/^[0-9a-f-]{36}$/i.test(i.excludeId)) throw new Error("Id non valido");
    return i;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = context.supabase;
    const { data: s } = await db.from("settings").select("booking_ical_url").eq("id", 1).maybeSingle();
    let syncError: string | null = null;
    if (s?.booking_ical_url) {
      const { syncBookingIcal } = await import("@/lib/ical-sync.server");
      const r = await syncBookingIcal(db);
      if (!r.ok) syncError = r.error ?? "Sincronizzazione non riuscita";
    }
    const [blocks, bks] = await Promise.all([
      db.from("availability_blocks").select("start_date, end_date, reason, source").lt("start_date", data.checkOut).gt("end_date", data.checkIn),
      db.from("bookings").select("id, guest_name, check_in, check_out, status, option_expires_at").not("status", "in", "(cancelled,pending)")
        .lt("check_in", data.checkOut).gt("check_out", data.checkIn),
    ]);
    if (blocks.error || bks.error) throw new Error((blocks.error ?? bks.error)!.message);
    const now = Date.now();
    const conflicts = [
      ...blocks.data.map(b => `${b.source === "booking" ? "Booking.com" : b.reason || "Blocco"} ${b.start_date} → ${b.end_date}`),
      ...bks.data.filter(b => b.id !== data.excludeId && !(b.status === "option" && b.option_expires_at && Date.parse(b.option_expires_at) < now))
        .map(b => `${b.guest_name} ${b.check_in} → ${b.check_out}`),
    ];
    return { conflicts, syncError };
  });

/** Marks that the dates of a direct booking were closed on Booking.com. */
export const markClosedOnBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { bookingId: string }) => { if (!/^[0-9a-f-]{36}$/i.test(i.bookingId)) throw new Error("Id non valido"); return i; })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("bookings").update({ ota_closed_at: new Date().toISOString() }).eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
