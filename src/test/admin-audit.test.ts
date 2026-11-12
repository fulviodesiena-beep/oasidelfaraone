import { describe, expect, it } from "vitest";
import type { Tables } from "@/integrations/supabase/types";
import { expenseInPeriod, financeStats, nightsInPeriod, occupiedNights } from "@/lib/finance";
import { confirmationIssues, occupancyStats } from "@/lib/admin";
import { hostTotals } from "@/routes/admin.hosts";
import { signDocumentToken, verifyDocumentToken } from "@/lib/automations/tokens";

const b = (o: Partial<Tables<"bookings">>) =>
  ({
    id: "x",
    created_at: "",
    guest_name: "X",
    guest_email: "a@b.it",
    guest_phone: null,
    check_in: "2026-10-31",
    check_out: "2026-11-06",
    adults: 2,
    children: 0,
    extras: [],
    status: "host_collab",
    total_nights: 6,
    price_per_night: 0,
    total_price: 600,
    deposit_paid: 600,
    balance_due: 0,
    notes: null,
    source: "host",
    is_personal_use: false,
    host_id: "h",
    host_amount: 0,
    pipeline_stage: "post_stay",
    channel: "diretto",
    channel_commission: 0,
    fds_share_pct: null,
    net_accommodation: 600,
    fds_amount: 120,
    room_amount: 480,
    owner_cap_per_night: 80,
    fds_min_per_night: 20,
    ...o,
  }) as Tables<"bookings">;
const e = (o: Partial<Tables<"expenses">>) =>
  ({
    id: "e",
    created_at: "",
    date: "2026-01-01",
    category: "condominio",
    amount: 1200,
    currency: "EUR",
    amount_eur: 1200,
    note: null,
    period_month: "2026-01",
    paid_by: "Carmine",
    fx_rate: null,
    fx_date: null,
    amortize_months: 12,
    ...o,
  }) as Tables<"expenses">;

describe("KPI: revenue follows the nights", () => {
  it("a stay from 31 Oct to 6 Nov puts 1 night in October and 5 in November", () => {
    expect(nightsInPeriod(b({}), "2026-10-01", "2026-11-01")).toBe(1);
    expect(nightsInPeriod(b({}), "2026-11-01", "2026-12-01")).toBe(5);
  });
  it("November revenue, stays and ADR agree with the 5 nights sold", () => {
    const s = financeStats([b({})], [], [], { kind: "month", key: "2026-11" });
    expect(s.nightsSold).toBe(5);
    expect(s.revenue).toBe(500);
    expect(s.bookingsCount).toBe(1);
    expect(s.adr).toBe(100);
    expect(s.ownerShare).toBe(400);
    expect(s.fds).toBe(100);
    const oct = financeStats([b({})], [], [], { kind: "month", key: "2026-10" });
    expect(oct.revenue).toBe(100);
  });
});

describe("KPI: commercial vs total occupancy", () => {
  it("owner use and calendar blocks count only in total occupancy", () => {
    const list = [
      b({ check_in: "2026-11-01", check_out: "2026-11-04", total_nights: 3 }),
      b({
        status: "personal",
        is_personal_use: true,
        check_in: "2026-11-10",
        check_out: "2026-11-15",
        total_nights: 5,
        total_price: 0,
      }),
    ];
    const s = financeStats(list, [], [], { kind: "month", key: "2026-11" }, [
      { start_date: "2026-11-20", end_date: "2026-11-22" },
    ]);
    expect(s.nightsSold).toBe(3);
    expect(s.nightsOccupied).toBe(10);
    expect(s.occupancyPct).toBe(10);
    expect(s.occupancyTotalPct).toBe(33.3);
    expect(occupiedNights(list, [], "2026-11-01", "2026-12-01")).toBe(8);
    const o = occupancyStats(list, "2026-11-30");
    expect(o.monthSold).toBe(3);
    expect(o.monthBooked).toBe(8);
  });
});

describe("KPI: expenses spread over months", () => {
  it("a yearly condominium fee weighs 1/12 on each month and in full on the year", () => {
    expect(expenseInPeriod(e({}), "2026-01-01", "2026-02-01")).toBe(100);
    expect(expenseInPeriod(e({}), "2026-07-01", "2026-08-01")).toBe(100);
    expect(expenseInPeriod(e({}), "2026-01-01", "2027-01-01")).toBe(1200);
    expect(expenseInPeriod(e({ amortize_months: 1 }), "2026-02-01", "2026-03-01")).toBe(0);
    const s = financeStats([], [e({})], [], { kind: "month", key: "2026-11" });
    expect(s.ownerExpenses).toBe(100);
    expect(s.ownerNet).toBe(-100);
  });
});

describe("hosts", () => {
  it("shows the value brought and what is still to collect", () => {
    expect(
      hostTotals([
        { total_price: 600, balance_due: 0 },
        { total_price: 500, balance_due: 200 },
      ]),
    ).toEqual({ stays: 2, brought: 1100, open: 200 });
  });
});

describe("confirmation checks", () => {
  const base = {
    status: "confirmed",
    is_personal_use: false,
    total_price: 500,
    deposit_paid: 0,
    guest_email: "a@b.it",
    guest_phone: "",
  };
  it("blocks a confirmation without email or phone", () => {
    expect(confirmationIssues({ ...base, guest_email: "" }).some((i) => i.level === "block")).toBe(
      true,
    );
    expect(
      confirmationIssues({ ...base, guest_email: "", guest_phone: "+39 333 1234567" }),
    ).toEqual([]);
  });
  it("warns on a zero total (complimentary stays need an explicit tick)", () => {
    expect(confirmationIssues({ ...base, total_price: 0 })).toEqual([
      { level: "warn", text: expect.stringContaining("omaggio") },
    ]);
  });
  it("ignores owner use and pending stays", () => {
    expect(
      confirmationIssues({ ...base, is_personal_use: true, guest_email: "", total_price: 0 }),
    ).toEqual([]);
    expect(confirmationIssues({ ...base, status: "pending", guest_email: "" })).toEqual([]);
  });
});

describe("document links", () => {
  const id = "c45d68d1-ee71-45f4-b266-164f4440b2ce";
  it("valid until expiry, then refused; tampering is refused", async () => {
    const t = await signDocumentToken(id, 2_000, "s3cret");
    expect(await verifyDocumentToken(t, 1_000, "s3cret")).toBe(id);
    expect(await verifyDocumentToken(t, 3_000, "s3cret")).toBeNull();
    expect(await verifyDocumentToken(t, 1_000, "other")).toBeNull();
    expect(await verifyDocumentToken(t.slice(0, -2) + "xx", 1_000, "s3cret")).toBeNull();
  });
});
