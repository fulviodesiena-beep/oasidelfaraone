import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Scheduled hourly: releases expired options (moved here from the 5-minute Booking.com job, now stopped),
// computes due automations, writes email_log and sends only those switched on in settings,
// then prepares the Domina delegas for the next 60 days.
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
        // Delega prepared server-side too (consegne cap. 2, punto C); a failure here never blocks the automations.
        const { prepareDelegas } = await import("@/lib/delega-generate.server");
        const d = await prepareDelegas(supabaseAdmin).catch((e: Error) => ({ checked: 0, ready: 0, errors: [e.message] }));
        if (d.errors.length) console.error("[jobs/automations] delega:", d.errors.join(" | "));
        return Response.json({ ok: true, due: r.due, sent: r.sent, tasks: r.tasks, skipped: r.skipped, errors: r.errors, delega: { checked: d.checked, ready: d.ready, errors: d.errors.length } });
      },
    },
  },
});
