import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** How long a document link sent to a guest stays valid. */
export const SHARE_HOURS = 72;

/** Admin-only: returns a short-lived link (/api/public/d/<token>) for one booking document. */
export const documentShareLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { documentId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(i.documentId)) throw new Error("Documento non valido");
    return { documentId: i.documentId };
  })
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: isAdmin } = await db.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Non autorizzato");
    const { data: doc, error } = await db
      .from("documents")
      .select("id")
      .eq("id", data.documentId)
      .maybeSingle();
    if (error || !doc) throw new Error("Documento non trovato");
    const { signDocumentToken } = await import("@/lib/automations/tokens");
    const { SITE } = await import("@/lib/automations/run.server");
    const token = await signDocumentToken(doc.id, Date.now() + SHARE_HOURS * 3600_000);
    return { url: `${SITE}/api/public/d/${token}`, hours: SHARE_HOURS };
  });
