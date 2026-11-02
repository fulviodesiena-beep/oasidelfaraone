import { describe, expect, it } from "vitest";
import { balanceDue, dashboardStats, nightsFor, type Booking } from "@/lib/admin";

const b = (o: Partial<Booking>): Booking => ({
  id: Math.random().toString(), created_at: "", guest_name: "X", guest_email: null, guest_phone: null,
  check_in: "2026-11-10", check_out: "2026-11-12", adults: 2, children: 0, extras: [], status: "confirmed",
  total_nights: 2, price_per_night: 95, total_price: 190, deposit_paid: 0, balance_due: 190, notes: null, source: "manual", ...o,
});

describe("admin rules", () => {
  it("balance due is total price minus deposit received", () => {
    expect(balanceDue(500, 150)).toBe(350);
  });
  it("counts nights between check-in and check-out", () => {
    expect(nightsFor("2026-11-10", "2026-11-17")).toBe(7);
  });
  it("dashboard shows today's check-ins/outs, month totals without cancelled, new inquiries and next 5 confirmed", () => {
    const today = "2026-11-10";
    const list = [
      b({ check_in: today, total_price: 200 }),
      b({ check_in: "2026-11-05", check_out: today, total_price: 300 }),
      b({ check_in: "2026-11-20", status: "cancelled", total_price: 999 }),
      ...["2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15", "2026-12-01"].map(d => b({ check_in: d, total_price: 100 })),
      b({ check_in: "2026-11-25", status: "pending", total_price: 50 }),
    ];
    const s = dashboardStats(list, [{ status: "new" }, { status: "new" }, { status: "lost" }], today);
    expect(s.checkInsToday).toHaveLength(1);
    expect(s.checkOutsToday).toHaveLength(1);
    expect(s.monthCount).toBe(8);
    expect(s.monthTotal).toBe(200 + 300 + 500 + 50);
    expect(s.newInquiries).toBe(2);
    expect(s.upcoming.map(x => x.check_in)).toEqual([today, "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"]);
  });
});
