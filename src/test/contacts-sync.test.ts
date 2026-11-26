import { describe, expect, it } from "vitest";
import { findDuplicate, isMinor, normalizePhone } from "@/lib/contacts";
import { isSyncStale, needsBookingClosure } from "@/lib/ical";

describe("dedup contatti", () => {
  it("normalises phones to E.164", () => {
    expect(normalizePhone("+39 334 732 8158")).toBe("+393347328158");
    expect(normalizePhone("0039 334 7328158")).toBe("+393347328158");
    expect(normalizePhone("334 732 8158")).toBe("+393347328158");
    expect(normalizePhone("+20 150 120 2025")).toBe("+201501202025");
    expect(normalizePhone("+39 ")).toBeNull();
  });
  const list = [{ id: 1, email: "Mario@Example.com", phone: "+393347328158" }, { id: 2, email: null, phone: "+201501202025" }];
  it("matches by email (case-insensitive) or by phone", () => {
    expect(findDuplicate(list, "mario@example.com ", null)?.id).toBe(1);
    expect(findDuplicate(list, null, "0020 150 120 2025")?.id).toBe(2);
    expect(findDuplicate(list, "new@x.it", "334 732 8158")?.id).toBe(1);
    expect(findDuplicate(list, "new@x.it", "+44 7700 900000")).toBeUndefined();
  });
  it("minor is computed on the check-in day", () => {
    expect(isMinor("2008-12-02", "2026-12-01")).toBe(true);
    expect(isMinor("2008-12-01", "2026-12-01")).toBe(false);
  });
});

describe("sync Booking.com", () => {
  const now = new Date("2026-11-09T10:00:00Z");
  it("on-open sync at most once per minute", () => {
    expect(isSyncStale(null, now)).toBe(true);
    expect(isSyncStale("2026-11-09T09:59:30Z", now)).toBe(false);
    expect(isSyncStale("2026-11-09T09:59:00Z", now)).toBe(true);
  });
  it("while linked, direct confirmed bookings and options must be closed on Booking.com until 'Fatto'", () => {
    const b = { status: "confirmed", channel: "diretto", ota_closed_at: null, check_out: "2026-12-08" };
    expect(needsBookingClosure(b, "2026-11-09", true)).toBe(true);
    expect(needsBookingClosure({ ...b, status: "option" }, "2026-11-09", true)).toBe(true);
    expect(needsBookingClosure({ ...b, ota_closed_at: "2026-11-09T10:00:00Z" }, "2026-11-09", true)).toBe(false);
    expect(needsBookingClosure({ ...b, channel: "booking" }, "2026-11-09", true)).toBe(false);
    expect(needsBookingClosure({ ...b, status: "pending" }, "2026-11-09", true)).toBe(false);
  });
  it("with Booking.com unlinked, no closure reminder is ever asked", () => {
    expect(needsBookingClosure({ status: "confirmed", channel: "diretto", ota_closed_at: null, check_out: "2026-12-08" }, "2026-11-09")).toBe(false);
  });
});
