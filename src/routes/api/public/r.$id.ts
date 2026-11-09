import { createFileRoute } from "@tanstack/react-router";

// Review link tracking: records the first click, then redirects to the configured review page.
export const Route = createFileRoute("/api/public/r/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        const { data: s } = await db.from("settings").select("review_url").eq("id", 1).single();
        const target = s?.review_url || "https://oasidelfaraone.it/";
        if (/^[0-9a-f-]{36}$/i.test(params.id)) {
          const { data: log } = await db.from("email_log").select("id, booking_id, automation").eq("id", params.id).maybeSingle();
          if (log?.automation === "A5" && log.booking_id) await db.from("email_log").update({ clicked_at: new Date().toISOString() }).eq("booking_id", log.booking_id).eq("automation", "A5").is("clicked_at", null);
        }
        return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store" } });
      },
    },
  },
});
