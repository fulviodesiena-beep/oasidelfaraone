import { describe, expect, it } from "vitest";
import { dayState, doubleBookingConflicts, financeStats, periodRange } from "@/lib/finance";
import type { Tables } from "@/integrations/supabase/types";

const b = (o: Partial<Tables<"bookings">>) => ({ id: "x", created_at: "", guest_name: "X", guest_email: null, guest_phone: null, check_in: "2026-11-10", check_out: "2026-11-15", adults: 2, children: 0, extras: [], status: "confirmed", total_nights: 5, price_per_night: 100, total_price: 500, deposit_paid: 0, balance_due: 500, notes: null, source: "manual", is_personal_use: false, host_id: null, host_amount: 0, pipeline_stage: "lead", channel: "diretto", channel_commission: 0, fds_share_pct: null, net_accommodation: 500, fds_amount: 100, room_amount: 400, owner_cap_per_night: 80, fds_min_per_night: 20, ...o }) as Tables<"bookings">;
const e = (o: Partial<Tables<"expenses">>) => ({ id: "e", created_at: "", date: "2026-11-02", category: "Luce", amount: 50, currency: "EUR", amount_eur: null, note: null, period_month: null, paid_by: "Carmine", ...o }) as Tables<"expenses">;

describe("finance dashboard", () => {
  it("owner net = Carmine share minus expenses paid by Carmine", () => {
    const s = financeStats([b({}), b({ status: "personal", room_amount: 0, fds_amount: 0 })], [e({}), e({ amount: 30, paid_by: "FDS" })], [], { kind: "month", key: "2026-11" });
    expect(s.ownerShare).toBe(400); expect(s.fds).toBe(100); expect(s.ownerExpenses).toBe(50); expect(s.ownerNet).toBe(350);
  });
  it("ADR, RevPAR and occupancy over the 30 nights of November", () => {
    const s = financeStats([b({})], [], [], { kind: "month", key: "2026-11" });
    expect(s.nightsSold).toBe(5); expect(s.nightsAvailable).toBe(30); expect(s.adr).toBe(100); expect(s.revpar).toBe(16.67);
  });
  it("conversion and direct vs OTA share", () => {
    const s = financeStats([b({}), b({ channel: "booking", channel_commission: 75 })], [], [{ created_at: "2026-11-01T10:00:00Z", status: "converted" }, { created_at: "2026-11-03T10:00:00Z", status: "lost" }], { kind: "year", key: "2026" });
    expect(s.conversionPct).toBe(50); expect(s.directPct).toBe(50); expect(s.commissions).toBe(75);
  });
  it("year period has 365 days", () => expect(periodRange({ kind: "year", key: "2026" }).days).toBe(365));
  it("calendar colours a Booking.com block over a direct stay as Booking and flags it as a double booking", () => {
    const blocks = [{ start_date: "2026-11-12", end_date: "2026-11-14", source: "booking", status: "booking" }];
    expect(dayState("2026-11-12", [b({})], blocks)).toBe("booking");
    expect(dayState("2026-11-10", [b({ status: "pending" })], [])).toBe("option");
    expect(dayState("2026-11-15", [b({})], [])).toBe("free");
    expect(doubleBookingConflicts([b({})], blocks)).toHaveLength(1);
    expect(doubleBookingConflicts([b({ status: "cancelled" })], blocks)).toHaveLength(0);
  });
});

import { previewSplit, suggestedCommission } from "@/lib/finance";
describe("booking form split preview", () => {
  it("suggests 15% commission only for Booking.com", () => { expect(suggestedCommission("booking", 1000)).toBe(150); expect(suggestedCommission("diretto", 1000)).toBe(0); });
  it("Carmine capped at 80/night, FDS gets the rest", () => expect(previewSplit(1000, 150, 5, 80, 20)).toEqual({ net: 850, owner: 400, fds: 450 }));
  it("FDS keeps at least 20/night on low nets", () => expect(previewSplit(450, 0, 5, 80, 20)).toEqual({ net: 450, owner: 350, fds: 100 }));
  it("personal use is zero", () => expect(previewSplit(500, 0, 5, 80, 20, true).owner).toBe(0));
});
