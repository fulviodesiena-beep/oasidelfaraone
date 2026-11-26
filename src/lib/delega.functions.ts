import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Generates (or regenerates when dates/travelers change) the Domina delega and stores it in the private documents bucket.
 *  Every failure is thrown with a readable Italian message so the admin UI can show it. */
export const ensureDelega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { bookingId: string; force?: boolean }) => {
    if (!/^[0-9a-f-]{36}$/i.test(i.bookingId)) throw new Error("Prenotazione non valida");
    return { bookingId: i.bookingId, force: !!i.force };
  })
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Non autorizzato");
    const { generateDelega } = await import("@/lib/delega-generate.server");
    return generateDelega(db, data.bookingId, data.force);
  });
