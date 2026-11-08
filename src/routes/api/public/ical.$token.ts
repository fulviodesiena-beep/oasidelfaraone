import { createFileRoute } from "@tanstack/react-router";
import { buildIcal } from "@/lib/ical";

// Public iCal export for Booking.com: /api/public/ical/<token>.ics — only generic "Occupato" events.
export const Route = createFileRoute("/api/public/ical/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token.replace(/\.ics$/i, "");
        if (!/^[a-f0-9]{32,128}$/i.test(token)) return new Response("Not found", { status: 404 });
        const base = process.env["SUPABASE_URL"], key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!base || !key) return new Response("Server configuration error", { status: 500 });
        const res = await fetch(`${base}/rest/v1/rpc/ical_export_ranges`, {
          method: "POST", headers: { apikey: key, "content-type": "application/json" }, body: JSON.stringify({ _token: token }),
        });
        if (!res.ok) return new Response("Calendar unavailable", { status: 502 });
        const rows = (await res.json()) as { uid: string; start_date: string; end_date: string }[];
        return new Response(buildIcal(rows.map(r => ({ uid: r.uid, start: r.start_date, end: r.end_date }))), {
          headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
