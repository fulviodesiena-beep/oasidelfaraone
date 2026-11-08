import { PRICING_CONFIG } from "./pricing-config";
export type Season = "low" | "mid" | "high" | "peak";
export const SEASON_RATES: Record<Season, number> = { ...PRICING_CONFIG.rates };
export const MAX_GUESTS = PRICING_CONFIG.maxGuests;
export const TRANSFER_PER_PERSON = PRICING_CONFIG.transferPerPerson;
export const CLEANING_FEE = PRICING_CONFIG.cleaningFee;
const R = PRICING_CONFIG.rates;
export const SEASONS = [
  { id: "low", name: "Bassa", period: "7–31 gennaio · Maggio · Giugno", range: String(R.low), rate: R.low },
  { id: "mid", name: "Media", period: "Febbraio · Marzo · Luglio · Settembre · Novembre · 1–19 dicembre", range: String(R.mid), rate: R.mid },
  { id: "high", name: "Alta", period: "Aprile · Agosto (esclusi 10–20) · Ottobre", range: String(R.high), rate: R.high },
  { id: "peak", name: "Picco", period: "20 dicembre – 6 gennaio · Settimana di Pasqua · 10–20 agosto", range: String(R.peak), rate: R.peak },
];
export function easterSunday(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return new Date(year, Math.floor(n / 31) - 1, n % 31 + 1);
}
export function dateKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
/** Easter week: from the Thursday before Easter to Easter Monday, recalculated every year. */
export function isEasterWeek(d: Date) {
  const e = easterSunday(d.getFullYear());
  const from = new Date(e.getFullYear(), e.getMonth(), e.getDate() - 3);
  const to = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1);
  const k = dateKey(d);
  return k >= dateKey(from) && k <= dateKey(to);
}
export function seasonFor(d: Date): Season | null {
  const m = d.getMonth() + 1, day = d.getDate();
  if ((m === 12 && day >= 20) || (m === 1 && day <= 6) || (m === 8 && day >= 10 && day <= 20) || isEasterWeek(d)) return "peak";
  if (m === 1 || m === 5 || m === 6) return "low";
  if ([2, 3, 7, 9, 11, 12].includes(m)) return "mid";
  if ([4, 8, 10].includes(m)) return "high";
  return null;
}
export function nightsBetween(a: Date, b: Date) { return Math.max(0, Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000)); }
export function quote(checkIn: Date, checkOut: Date, extrasTotal = 0) {
  const nightsCount = nightsBetween(checkIn, checkOut);
  const nights = Array.from({ length: nightsCount }, (_, i) => {
    const date = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + i);
    const season = seasonFor(date);
    return { date, season, price: season ? SEASON_RATES[season] : null };
  });
  const onRequest = nights.some(n => n.price === null);
  const accommodation = onRequest ? null : nights.reduce((a, n) => a + (n.price ?? 0), 0);
  const touchesPeak = nights.some(n => n.season === "peak");
  const minNights = touchesPeak ? PRICING_CONFIG.minNightsPeak : PRICING_CONFIG.minNights;
  const minStayWarning = nightsCount > 0 && nightsCount < minNights ? minNights : null;
  return { nights, nightsCount, onRequest, accommodation, extrasTotal, total: accommodation === null ? null : accommodation + extrasTotal, cleaningFee: CLEANING_FEE, touchesPeak, minStayWarning };
}
export function transferTotal(guests: number) { return guests * TRANSFER_PER_PERSON; }
