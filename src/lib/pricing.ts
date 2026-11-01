export type Season = "low" | "mid" | "high" | "peak";
export const SEASON_RATES: Record<Season, number> = { low: 75, mid: 95, high: 130, peak: 170 };
export const MAX_GUESTS = 4;
export const TRANSFER_PER_PERSON = 15;
export const SEASONS = [
  { id: "low", name: "Bassa", period: "Maggio · Giugno · Ottobre", range: "70–80", rate: 75 },
  { id: "mid", name: "Media", period: "Settembre · Novembre · Marzo", range: "90–100", rate: 95 },
  { id: "high", name: "Alta", period: "Luglio · Agosto · Aprile", range: "120–140", rate: 130 },
  { id: "peak", name: "Picco", period: "20 dicembre – 6 gennaio · Pasqua", range: "160–180", rate: 170 },
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
export function seasonFor(d: Date): Season | null {
  const m = d.getMonth() + 1, day = d.getDate();
  if ((m === 12 && day >= 20) || (m === 1 && day <= 6)) return "peak";
  const easter = easterSunday(d.getFullYear());
  const monday = new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + 1);
  if ([dateKey(easter), dateKey(monday)].includes(dateKey(d))) return "peak";
  if ([5, 6, 10].includes(m)) return "low";
  if ([9, 11, 3].includes(m)) return "mid";
  if ([7, 8, 4].includes(m)) return "high";
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
  return { nights, nightsCount, onRequest, accommodation, extrasTotal, total: accommodation === null ? null : accommodation + extrasTotal };
}
export function transferTotal(guests: number) { return guests * TRANSFER_PER_PERSON; }
