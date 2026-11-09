import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** ECB reference rate (via Frankfurter) for the expense date; returns the ECB publication date actually used. */
export const ecbRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { date: string; from: string }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(i.date) || !/^[A-Z]{3}$/.test(i.from)) throw new Error("Parametri non validi");
    return i;
  })
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/${data.date}?from=${data.from}&to=EUR`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return { rate: null, date: null, error: `Servizio cambi: ${res.status}` };
      const j = (await res.json()) as { date: string; rates: { EUR?: number } };
      return j.rates.EUR ? { rate: j.rates.EUR, date: j.date, error: null } : { rate: null, date: null, error: "Valuta non disponibile presso la BCE" };
    } catch {
      return { rate: null, date: null, error: "Servizio cambi non raggiungibile" };
    }
  });
