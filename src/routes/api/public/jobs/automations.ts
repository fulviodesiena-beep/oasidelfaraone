import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Scheduled hourly: releases expired options (moved here from the 5-minute Booking.com job, now stopped),
// computes due automations, writes email_log and sends only those switched on in settings.
export const Route = createFileRoute("/api/public/jobs/automations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { runAutomations } = await import("@/lib/automations/run.server");
        await supabaseAdmin.rpc("release_expired_options");
        const r = await runAutomations(supabaseAdmin);
        return Response.json({ ok: true, due: r.due, sent: r.sent, tasks: r.tasks, skipped: r.skipped, errors: r.errors });
      },
    },
  },
});
