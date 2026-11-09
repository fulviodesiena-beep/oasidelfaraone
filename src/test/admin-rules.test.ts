import { describe, expect, it } from "vitest";
import { balanceDue, dashboardStats, nightsFor, type Booking } from "@/lib/admin";

const b = (o: Partial<Booking>): Booking => ({
  id: Math.random().toString(), created_at: "", guest_name: "X", guest_email: null, guest_phone: null,
  check_in: "2026-11-10", check_out: "2026-11-12", adults: 2, children: 0, extras: [], status: "confirmed",
  total_nights: 2, price_per_night: 95, total_price: 190, deposit_paid: 0, balance_due: 190, notes: null, source: "manual", is_personal_use: false, host_id: null, host_amount: 0, pipeline_stage: "lead", channel: "diretto", channel_commission: 0, fds_share_pct: null, net_accommodation: null, fds_amount: null, room_amount: null, owner_cap_per_night: null, fds_min_per_night: null, option_expires_at: null, ota_closed_at: null, payment_verified_at: null, contact_id: null, arrival_time: null, departure_time: null, delegate_email: null, delegate_phone: null, initial_cleaning: false, final_cleaning: true, room_id: "r1", confirmed_at: null, ...o,
});

describe("admin rules", () => {
  it("amount to collect sums balance due on confirmed bookings only", () => {
    const s = dashboardStats([b({ balance_due: 300 }), b({ balance_due: 120 }), b({ status: "pending", balance_due: 999 }), b({ status: "personal", balance_due: 0 })], [], "2026-11-01");
    expect(s.toCollect).toBe(420);
  });
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

import { bookedDaysBetween, occupancyBand, occupancyStats } from "@/lib/admin";
describe("occupancy stats", () => {
  it("counts only nights inside the month and ignores cancelled", () => {
    const list = [b({ check_in: "2026-10-29", check_out: "2026-11-03" }), b({ check_in: "2026-11-28", check_out: "2026-12-04" }), b({ check_in: "2026-11-10", check_out: "2026-11-15", status: "cancelled" })];
    expect(bookedDaysBetween(list, "2026-11-01", "2026-12-01")).toBe(5);
    const s = occupancyStats(list, "2026-11-10");
    expect(s.monthDays).toBe(30);
    expect(s.monthPct).toBeCloseTo(16.7);
  });
  it("year occupancy divides by days elapsed since 1 January including today", () => {
    const s = occupancyStats([b({ check_in: "2026-01-01", check_out: "2026-01-06" })], "2026-01-10");
    expect(s.yearElapsed).toBe(10);
    expect(s.yearPct).toBe(50);
  });
  it("colour bands: >70 green, 40-70 yellow, <40 red", () => {
    expect(occupancyBand(71)).toBe("high"); expect(occupancyBand(70)).toBe("mid"); expect(occupancyBand(40)).toBe("mid"); expect(occupancyBand(39.9)).toBe("low");
  });
});
