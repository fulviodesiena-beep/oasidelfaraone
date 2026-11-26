import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Booking.com iCal import. Its 5-minute schedule was paused on 25/11/2026 (link suspended, BOOKING_COM_LINKED = false):
// to reconnect, set the constant to true and reactivate the paused cron job (see docs/db/2026-11-25-booking-off.sql).
export const Route = createFileRoute("/api/public/jobs/ical-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { syncBookingIcal } = await import("@/lib/ical-sync.server");
        await supabaseAdmin.rpc("release_expired_options");
        const r = await syncBookingIcal(supabaseAdmin);
        return Response.json({ ok: r.ok, imported: r.imported, removed: r.removed });
      },
    },
  },
});
