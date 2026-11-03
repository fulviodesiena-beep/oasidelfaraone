import { describe, expect, it } from "vitest";
import { isOccupied, overlaps, rangeHitsOccupied } from "@/lib/availability";

const booked = [{ check_in: "2026-12-10", check_out: "2026-12-14" }];

describe("occupied dates", () => {
  it("blocks check-in and check-out days of a booking", () => {
    expect(isOccupied("2026-12-10", booked)).toBe(true);
    expect(isOccupied("2026-12-14", booked)).toBe(true);
    expect(isOccupied("2026-12-15", booked)).toBe(false);
  });
  it("rejects a stay spanning an occupied range", () => {
    expect(rangeHitsOccupied("2026-12-05", "2026-12-20", booked)).toBe(true);
    expect(rangeHitsOccupied("2026-12-15", "2026-12-20", booked)).toBe(false);
  });
  it("admin overlap allows back-to-back stays", () => {
    expect(overlaps("2026-12-14", "2026-12-18", "2026-12-10", "2026-12-14")).toBe(false);
    expect(overlaps("2026-12-13", "2026-12-18", "2026-12-10", "2026-12-14")).toBe(true);
  });
});
