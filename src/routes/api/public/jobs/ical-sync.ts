import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Scheduled every 15 minutes: imports the Booking.com iCal feed into availability blocks.
export const Route = createFileRoute("/api/public/jobs/ical-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { syncBookingIcal } = await import("@/lib/ical-sync.server");
        const r = await syncBookingIcal(supabaseAdmin);
        return Response.json({ ok: r.ok, imported: r.imported, removed: r.removed });
      },
    },
  },
});
