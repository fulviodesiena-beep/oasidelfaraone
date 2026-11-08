import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** "Sincronizza ora" from the admin settings page; runs as the signed-in admin under RLS. */
export const syncBookingNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Non autorizzato");
    const { syncBookingIcal } = await import("@/lib/ical-sync.server");
    return syncBookingIcal(context.supabase);
  });
