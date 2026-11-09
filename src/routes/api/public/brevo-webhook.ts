import { createFileRoute } from "@tanstack/react-router";

// Brevo marketing webhook (unsubscribed / spam / hard bounce) → marks the CRM contact as unsubscribed. Auth: signed token in the URL.
export const Route = createFileRoute("/api/public/brevo-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyToken } = await import("@/lib/automations/tokens");
        const t = new URL(request.url).searchParams.get("t") ?? "";
        if ((await verifyToken("brevo-webhook", t)) !== "v1") return new Response("Unauthorized", { status: 401 });
        let body: unknown; try { body = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
        const events = (Array.isArray(body) ? body : [body]) as { event?: string; email?: string }[];
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        for (const e of events.slice(0, 100)) {
          const email = typeof e.email === "string" ? e.email.trim().toLowerCase().slice(0, 254) : "";
          if (!email || !["unsubscribed", "unsubscribe", "spam", "hard_bounce", "hardBounce"].includes(String(e.event))) continue;
          const now = new Date().toISOString();
          await db.from("contacts").update({ unsubscribed_at: now, consent_marketing: false, consent_occasions: false, newsletter_status: "none", updated_at: now }).ilike("email", email);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
