// Browser-safe helpers for the admin panel (pure, testable).
import type { Tables } from "@/integrations/supabase/types";

export type Booking = Tables<"bookings">;
export type Inquiry = Tables<"inquiries">;
export type Guest = Tables<"guests">;
export type Host = Tables<"hosts">;
export type DocumentRow = Tables<"documents">;
export type Traveler = Tables<"travelers">;
export type Contact = Tables<"contacts">;

export const DOCUMENT_TYPES = ["Documento identità", "Contratto", "Delega Domina", "Altro"] as const;

export const BOOKING_STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "In attesa",
  option: "Opzionata",
  confirmed: "Confermata",
  cancelled: "Annullata",
  personal: "Uso personale",
  host_collab: "Collab. host",
};
export const PIPELINE_LABEL: Record<Booking["pipeline_stage"], string> = {
  lead: "Lead", quoted: "Preventivo inviato", follow_up: "Follow-up", confirmed: "Confermato",
  pre_stay: "Pre-soggiorno", staying: "In soggiorno", post_stay: "Post-soggiorno", loyal: "Cliente fedele",
};
export const INQUIRY_STATUS_LABEL: Record<Inquiry["status"], string> = {
  new: "Nuova",
  contacted: "Contattata",
  converted: "Convertita",
  lost: "Persa",
};
export const SOURCE_LABEL: Record<string, string> = { whatsapp: "WhatsApp", direct: "Diretta", manual: "Manuale", personal: "Personale", host: "Host" };

export const eur = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(Number(n ?? 0));

export const fmtDate = (s: string | null | undefined) =>
  s ? new Date(`${s.slice(0, 10)}T12:00:00`).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function nightsFor(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const a = Date.parse(`${checkIn}T00:00:00Z`), b = Date.parse(`${checkOut}T00:00:00Z`);
  return Math.max(0, Math.round((b - a) / 86400000));
}

export const balanceDue = (total: number, deposit: number) => Math.round((total - deposit) * 100) / 100;

/** "YYYY-MM" of a date string. */
export const monthOf = (s: string) => s.slice(0, 7);

export function extrasList(extras: unknown): string[] {
  return Array.isArray(extras) ? extras.map(String) : [];
}

export function dashboardStats(bookings: Booking[], inquiries: Pick<Inquiry, "status">[], today: string) {
  const active = bookings.filter(b => b.status !== "cancelled");
  const month = monthOf(today);
  const thisMonth = active.filter(b => monthOf(b.check_in) === month);
  return {
    checkInsToday: active.filter(b => b.check_in === today),
    checkOutsToday: active.filter(b => b.check_out === today),
    monthCount: thisMonth.length,
    monthTotal: thisMonth.reduce((s, b) => s + Number(b.total_price), 0),
    toCollect: bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + Number(b.balance_due ?? 0), 0),
    newInquiries: inquiries.filter(i => i.status === "new").length,
    upcoming: bookings
      .filter(b => b.status === "confirmed" && b.check_in >= today)
      .sort((a, b) => a.check_in.localeCompare(b.check_in))
      .slice(0, 5),
  };
}

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const dayMs = 86400000;
const toUtc = (s: string) => Date.parse(`${s.slice(0, 10)}T00:00:00Z`);
const keyOf = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Nights occupied by non-cancelled bookings inside [from, to) (YYYY-MM-DD). */
export function bookedDaysBetween(bookings: Pick<Booking, "status" | "check_in" | "check_out">[], from: string, to: string) {
  const a = toUtc(from), b = toUtc(to);
  const days = new Set<number>();
  for (const bk of bookings) {
    if (bk.status === "cancelled") continue;
    const s = Math.max(a, toUtc(bk.check_in)), e = Math.min(b, toUtc(bk.check_out));
    for (let t = s; t < e; t += dayMs) days.add(t);
  }
  return days.size;
}

export function occupancyStats(bookings: Booking[], today: string) {
  const y = Number(today.slice(0, 4)), m = Number(today.slice(5, 7));
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const nextMonth = keyOf(Date.UTC(y, m, 1));
  const yearStart = `${y}-01-01`;
  const tomorrow = keyOf(toUtc(today) + dayMs);
  const yearElapsed = Math.round((toUtc(tomorrow) - toUtc(yearStart)) / dayMs);
  const monthBooked = bookedDaysBetween(bookings, monthStart, nextMonth);
  const yearBooked = bookedDaysBetween(bookings, yearStart, tomorrow);
  const inYear = bookings.filter(b => b.check_in.slice(0, 4) === String(y));
  const confirmedYear = inYear.filter(b => b.status === "confirmed");
  const revenueYear = inYear
    .filter(b => b.status === "confirmed" || b.pipeline_stage === "post_stay" || b.pipeline_stage === "loyal")
    .filter(b => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total_price), 0);
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
  return {
    monthBooked, monthDays, monthPct: pct(monthBooked, monthDays),
    yearBooked, yearElapsed, yearPct: pct(yearBooked, yearElapsed),
    confirmedYearCount: confirmedYear.length,
    avgNights: confirmedYear.length ? Math.round((confirmedYear.reduce((s, b) => s + b.total_nights, 0) / confirmedYear.length) * 10) / 10 : 0,
    revenueYear,
  };
}

/** Bar colour band: green >70, yellow 40–70, red <40. */
export const occupancyBand = (pct: number) => (pct > 70 ? "high" : pct >= 40 ? "mid" : "low");
