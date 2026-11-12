// Pure finance/occupancy helpers for the admin dashboard (browser-safe, testable). Dates "YYYY-MM-DD".
import type { Tables } from "@/integrations/supabase/types";
import { bookedDaysBetween } from "@/lib/admin";

type Booking = Tables<"bookings">;
type Expense = Tables<"expenses">;
type Block = Pick<Tables<"availability_blocks">, "start_date" | "end_date" | "source" | "status">;

export type Period = { kind: "month" | "year"; key: string }; // "2026-11" | "2026"

export function periodRange(p: Period): { from: string; to: string; days: number } {
  const y = Number(p.key.slice(0, 4));
  const [from, toT] = p.kind === "year"
    ? [`${y}-01-01`, Date.UTC(y + 1, 0, 1)]
    : [`${p.key}-01`, Date.UTC(y, Number(p.key.slice(5, 7)), 1)];
  const to = new Date(toT).toISOString().slice(0, 10);
  return { from, to, days: Math.round((toT - Date.parse(`${from}T00:00:00Z`)) / 86400000) };
}

/** Stays that produce revenue: confirmed bookings and host collaborations. */
export const isSold = (b: Pick<Booking, "status">) => b.status === "confirmed" || b.status === "host_collab";
export const isOta = (b: Pick<Booking, "channel">) => (b.channel || "diretto") !== "diretto";
/** Expenses come off the owner's share unless explicitly paid by someone else. */
export const chargedToOwner = (e: Pick<Expense, "paid_by">) => (e.paid_by ?? "Carmine").trim().toLowerCase() !== "fds";
export const expenseEur = (e: Pick<Expense, "amount" | "amount_eur" | "currency">) =>
  e.amount_eur != null ? Number(e.amount_eur) : e.currency === "EUR" ? Number(e.amount) : 0;

const r2 = (n: number) => Math.round(n * 100) / 100;
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

const dayMs = 86400000;
const utc = (d: string) => Date.parse(`${d.slice(0, 10)}T00:00:00Z`);
/** Nights of a stay that fall inside [from, to). */
export function nightsInPeriod(b: Pick<Booking, "check_in" | "check_out">, from: string, to: string) {
  return Math.max(0, Math.round((Math.min(utc(b.check_out), utc(to)) - Math.max(utc(b.check_in), utc(from))) / dayMs));
}
/** Share of a stay's money that belongs to the period: amounts are spread evenly over its nights. */
export function periodShare(b: Pick<Booking, "check_in" | "check_out" | "total_nights">, from: string, to: string) {
  const total = b.total_nights > 0 ? b.total_nights : nightsInPeriod(b, "0000-01-01", "9999-12-31");
  return total > 0 ? nightsInPeriod(b, from, to) / total : 0;
}
/** Euro amount of an expense that falls inside [from, to): spread evenly over `amortize_months` months from its month. */
export function expenseInPeriod(e: Pick<Expense, "date" | "period_month" | "amount" | "amount_eur" | "currency"> & { amortize_months?: number | null }, from: string, to: string) {
  const months = Math.max(1, Math.min(36, Math.round(Number(e.amortize_months ?? 1))));
  const start = (e.period_month || e.date).slice(0, 7);
  const y = Number(start.slice(0, 4)), m = Number(start.slice(5, 7)) - 1;
  const each = expenseEur(e) / months;
  let sum = 0;
  for (let i = 0; i < months; i++) {
    const key = new Date(Date.UTC(y, m + i, 1)).toISOString().slice(0, 10);
    if (key >= from && key < to) sum += each;
  }
  return sum;
}

/** Occupied nights of any kind: bookings that are not cancelled (incl. owner and host stays) and calendar blocks. */
export function occupiedNights(bookings: Pick<Booking, "status" | "check_in" | "check_out">[], blocks: Pick<Block, "start_date" | "end_date">[], from: string, to: string) {
  const asStay = blocks.map(k => ({ status: "confirmed" as Booking["status"], check_in: k.start_date, check_out: k.end_date }));
  return bookedDaysBetween([...bookings, ...asStay], from, to);
}

export function financeStats(bookings: Booking[], expenses: Expense[], inquiries: Pick<Tables<"inquiries">, "created_at" | "status">[], p: Period, blocks: Pick<Block, "start_date" | "end_date">[] = []) {
  const { from, to, days } = periodRange(p);
  const inP = (d: string) => d.slice(0, 10) >= from && d.slice(0, 10) < to;
  // Revenue follows the nights: a stay across two months is split between them.
  const sold = bookings.filter(b => isSold(b) && nightsInPeriod(b, from, to) > 0);
  const sum = (f: (b: Booking) => number | null) => r2(sold.reduce((s, b) => s + Number(f(b) ?? 0) * periodShare(b, from, to), 0));
  const revenue = sum(b => b.total_price);
  const ownerShare = sum(b => b.room_amount);
  const ownerExpenses = r2(expenses.filter(chargedToOwner).reduce((s, e) => s + expenseInPeriod(e, from, to), 0));
  const unconvertedExpenses = expenses.filter(e => expenseInPeriod({ ...e, amount_eur: 1, currency: "EUR" }, from, to) > 0 && e.amount_eur == null && e.currency !== "EUR").length;
  const nightsSold = bookedDaysBetween(sold, from, to);
  const nightsOccupied = occupiedNights(bookings, blocks, from, to);
  const inq = inquiries.filter(i => inP(i.created_at));
  const ota = sold.filter(isOta).length;
  return {
    revenue, commissions: sum(b => b.channel_commission), ownerShare, fds: sum(b => b.fds_amount),
    ownerExpenses, unconvertedExpenses, ownerNet: r2(ownerShare - ownerExpenses),
    nightsSold, nightsAvailable: days, occupancyPct: pct(nightsSold, days),
    nightsOccupied, occupancyTotalPct: pct(nightsOccupied, days),
    adr: nightsSold ? r2(revenue / nightsSold) : 0, revpar: days ? r2(revenue / days) : 0,
    inquiries: inq.length, conversionPct: pct(inq.filter(i => i.status === "converted").length, inq.length),
    directPct: pct(sold.length - ota, sold.length), otaPct: pct(ota, sold.length), bookingsCount: sold.length,
  };
}

export type DayState = "free" | "option" | "confirmed" | "owner" | "host" | "blocked" | "booking";
export const DAY_STATE_LABEL: Record<DayState, string> = {
  free: "Disponibile", option: "Opzionata", confirmed: "Confermata", owner: "Uso proprietario", host: "Host", blocked: "Bloccata", booking: "Booking.com",
};

/** State of one night (day → day+1). Booking.com blocks win, then manual blocks, then direct bookings. */
export function dayState(day: string, bookings: Pick<Booking, "status" | "check_in" | "check_out">[], blocks: Block[]): DayState {
  const blk = blocks.filter(b => day >= b.start_date && day < b.end_date);
  if (blk.some(b => b.source === "booking")) return "booking";
  if (blk.length) return "blocked";
  const b = bookings.find(x => x.status !== "cancelled" && day >= x.check_in && day < x.check_out);
  if (!b) return "free";
  return ({ pending: "option", confirmed: "confirmed", personal: "owner", host_collab: "host" } as const)[b.status as "pending"] ?? "confirmed";
}

/** Booking.com blocks overlapping a non-cancelled direct booking: possible double booking. */
export function doubleBookingConflicts(bookings: Booking[], blocks: Block[]) {
  return blocks.filter(k => k.source === "booking").flatMap(k =>
    bookings.filter(b => b.status !== "cancelled" && !isOta(b) && b.check_in < k.end_date && b.check_out > k.start_date)
      .map(b => ({ block: k, booking: b })));
}

/** Preview of the DB-generated split (mirrors bookings.room_amount / fds_amount). */
export function previewSplit(totalPrice: number, commission: number, nights: number, capPerNight: number, fdsMinPerNight: number, personal = false) {
  if (personal || nights <= 0) return { net: 0, owner: 0, fds: 0 };
  const net = Math.max(totalPrice - commission, 0);
  const owner = Math.round(nights * Math.min(capPerNight, Math.max(net / nights - fdsMinPerNight, 0)) * 100) / 100;
  return { net, owner, fds: Math.round((net - owner) * 100) / 100 };
}
export const suggestedCommission = (channel: string, total: number) => channel === "booking" ? Math.round(total * 15) / 100 : 0;
