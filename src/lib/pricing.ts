export type Season = "low" | "mid" | "high" | "peak";

export const SEASON_RATES: Record<Season, number> = { low: 90, mid: 120, high: 165, peak: 225 };
export const MAX_GUESTS = 5;

/** Season for a given night (local date). */
export function seasonFor(d: Date): Season {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  // Peak: Christmas / New Year (20 Dec – 6 Jan) and Easter window (approx. mid April)
  if ((m === 12 && day >= 20) || (m === 1 && day <= 6)) return "peak";
  if (m === 4 && day >= 10 && day <= 25) return "peak";
  if (m === 7 || m === 8) return "high";
  if ([4, 5, 6, 9, 10].includes(m)) return "mid";
  return "low";
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  const ms = new Date(checkOut.toDateString()).getTime() - new Date(checkIn.toDateString()).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export function quote(checkIn: Date, checkOut: Date, extrasTotal = 0) {
  const n = nightsBetween(checkIn, checkOut);
  const nights: { date: Date; season: Season; price: number }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + i);
    const s = seasonFor(d);
    nights.push({ date: d, season: s, price: SEASON_RATES[s] });
  }
  const accommodation = nights.reduce((a, b) => a + b.price, 0);
  return { nights, nightsCount: n, accommodation, extrasTotal, total: accommodation + extrasTotal };
}
