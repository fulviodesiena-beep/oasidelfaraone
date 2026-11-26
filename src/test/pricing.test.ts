import { describe, it, expect } from "vitest";
import { seasonFor, quote, MAX_GUESTS, transferTotal, CLEANING_FEE } from "@/lib/pricing";
import { ROOM_AMENITIES } from "@/lib/site-data";
const one = (y: number, m: number, d: number) => quote(new Date(y, m, d), new Date(y, m, d + 1)).total;
describe("apartment rules", () => {
 it("limits occupancy to four", () => expect(MAX_GUESTS).toBe(4));
 it("has a balcony rather than a terrace", () => { expect(ROOM_AMENITIES).toContain("Balcone vista piscina"); expect(ROOM_AMENITIES).not.toContain("Terrazza"); });
 it("does not include room Wi-Fi", () => expect(ROOM_AMENITIES.some(a => /wi.?fi/i.test(a))).toBe(false));
 it("does not include a coffee machine", () => expect(ROOM_AMENITIES.some(a => /caff[eè]|coffee/i.test(a))).toBe(false));
 it("does not include spa access", () => expect(ROOM_AMENITIES.some(a => /spa/i.test(a))).toBe(false));
});
describe("seasonal price list", () => {
 it("low season is 80: Jan 7–31, May, June", () => { expect(one(2027,0,7)).toBe(80); expect(one(2027,0,31)).toBe(80); expect(one(2027,4,10)).toBe(80); expect(one(2027,5,10)).toBe(80); });
 it("mid season is 100: Feb, Mar, Jul, Sep, Nov, Dec 1–19", () => { for (const m of [1,2,6,8,10]) expect(one(2027,m,5)).toBe(100); expect(one(2027,11,1)).toBe(100); expect(one(2027,11,19)).toBe(100); });
 it("high season is 120: April, August outside 10–20, October", () => { expect(one(2027,3,20)).toBe(120); expect(one(2027,7,9)).toBe(120); expect(one(2027,7,21)).toBe(120); expect(one(2027,9,10)).toBe(120); });
 it("peak is 150: Dec 20–Jan 6 and Aug 10–20", () => { for (const [m,d] of ([[11,20],[0,6],[7,10],[7,20]] as const)) { expect(seasonFor(new Date(2027,m,d))).toBe("peak"); expect(one(2027,m,d)).toBe(150); } });
 it("Easter week runs Thursday before to Easter Monday, each year", () => {
  // Easter 2027 = 28 March; 2026 = 5 April
  for (const d of [25,26,27,28,29]) expect(seasonFor(new Date(2027,2,d))).toBe("peak");
  expect(seasonFor(new Date(2027,2,24))).toBe("mid"); expect(seasonFor(new Date(2027,2,30))).toBe("mid");
  expect(seasonFor(new Date(2026,3,2))).toBe("peak"); expect(seasonFor(new Date(2026,3,6))).toBe("peak"); expect(seasonFor(new Date(2026,3,7))).toBe("high");
 });
 it("every day of the year has a rate (no on-request months)", () => { for (let i = 0; i < 366; i++) expect(seasonFor(new Date(2028,0,1+i))).not.toBeNull(); });
 it("prices whole apartment by nights, checkout excluded", () => expect(quote(new Date(2027,4,10),new Date(2027,4,13)).total).toBe(240));
 it("cleaning fee is 40 and not in the total", () => { const q = quote(new Date(2027,4,10),new Date(2027,4,13)); expect(CLEANING_FEE).toBe(40); expect(q.cleaningFee).toBe(40); expect(q.total).toBe(240); });
 it("recommends 3 nights minimum, without blocking", () => { const q = quote(new Date(2027,4,10),new Date(2027,4,12)); expect(q.minStayWarning).toBe(3); expect(q.total).toBe(160); expect(quote(new Date(2027,4,10),new Date(2027,4,13)).minStayWarning).toBeNull(); });
 it("recommends 5 nights when the stay touches peak", () => { expect(quote(new Date(2027,7,8),new Date(2027,7,12)).minStayWarning).toBe(5); expect(quote(new Date(2027,7,8),new Date(2027,7,13)).minStayWarning).toBeNull(); });
 it("airport transfer costs 20 one way or 40 round trip, added to the total", () => { expect(transferTotal("oneWay")).toBe(20); expect(transferTotal("roundTrip")).toBe(40); expect(transferTotal(null)).toBe(0); const q=quote(new Date(2027,4,10),new Date(2027,4,13),transferTotal("roundTrip")); expect(q.accommodation).toBe(240); expect(q.total).toBe(280); });
});
