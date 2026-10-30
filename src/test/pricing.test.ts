import { describe, it, expect } from "vitest";
import { seasonFor, quote } from "@/lib/pricing";

describe("pricing seasons", () => {
  it("July is high season", () => expect(seasonFor(new Date(2026, 6, 15))).toBe("high"));
  it("Christmas is peak", () => expect(seasonFor(new Date(2026, 11, 25))).toBe("peak"));
  it("February is low", () => expect(seasonFor(new Date(2027, 1, 10))).toBe("low"));
  it("May is mid", () => expect(seasonFor(new Date(2026, 4, 10))).toBe("mid"));
  it("quote = nights x rate + extras", () => {
    const q = quote(new Date(2027, 1, 1), new Date(2027, 1, 4), 15);
    expect(q.nightsCount).toBe(3);
    expect(q.total).toBe(3 * 90 + 15);
  });
});
