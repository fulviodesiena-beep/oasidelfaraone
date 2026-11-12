import { createFileRoute } from "@tanstack/react-router";

/** Private document link sent to guests: checks the signed, expiring token and redirects to a 60-second storage URL.
 *  The long-lived link never exposes the storage path, and nothing is reachable after the token expires. */
export const Route = createFileRoute("/api/public/d/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { verifyDocumentToken } = await import("@/lib/automations/tokens");
        const id = await verifyDocumentToken(params.token);
        const gone = () =>
          new Response(
            "Link scaduto o non valido. Chiedi un nuovo link a Fulvio: +39 334 732 8158.",
            {
              status: 410,
              headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
            },
          );
        if (!id) return gone();
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        const { data: doc } = await db
          .from("documents")
          .select("file_url")
          .eq("id", id)
          .maybeSingle();
        if (!doc?.file_url) return gone();
        const { data } = await db.storage.from("documents").createSignedUrl(doc.file_url, 60);
        if (!data?.signedUrl) return gone();
        return new Response(null, {
          status: 302,
          headers: {
            Location: data.signedUrl,
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          },
        });
      },
    },
  },
});
