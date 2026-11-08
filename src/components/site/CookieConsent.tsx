import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { loadMetaPixel, readConsent, trackEvent, writeConsent, type Consent } from "@/lib/tracking";

/** GDPR banner: no tracking script loads until the visitor accepts. Rejecting keeps the site fully usable. */
export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | "unknown">("unknown");
  const [pixelId, setPixelId] = useState<string | null>(null);
  useEffect(() => {
    setConsent(readConsent());
    supabase.rpc("get_public_settings").then(({ data }) => setPixelId(data?.[0]?.meta_pixel_id ?? null), () => {});
  }, []);
  useEffect(() => {
    if (consent !== "accepted" || !pixelId) return;
    loadMetaPixel(pixelId);
    const onClick = (e: MouseEvent) => { if ((e.target as HTMLElement | null)?.closest('a[href*="wa.me"]')) trackEvent("Contact"); };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [consent, pixelId]);
  // Banner only matters when there is something to consent to.
  if (consent !== null || !pixelId) return null;
  const choose = (v: "accepted" | "rejected") => { writeConsent(v); setConsent(v); };
  return <div role="dialog" aria-label="Preferenze cookie" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl border border-border bg-card p-5 text-sm shadow-lg sm:inset-x-6">
    <p>Usiamo cookie di misurazione (Meta Pixel) solo se li accetti, per capire quali annunci portano richieste. Senza consenso il sito funziona comunque. <a href="/privacy" className="underline">Informativa privacy e cookie</a></p>
    <div className="mt-4 flex flex-wrap gap-3"><Button onClick={() => choose("accepted")}>Accetta</Button><Button variant="outline" onClick={() => choose("rejected")}>Rifiuta</Button></div>
  </div>;
}
