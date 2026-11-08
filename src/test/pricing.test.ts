import { describe, it, expect } from "vitest";
import { seasonFor, quote, MAX_GUESTS, transferTotal } from "@/lib/pricing";
import { ROOM_AMENITIES } from "@/lib/site-data";
describe("apartment rules", () => {
 it("limits occupancy to four", () => expect(MAX_GUESTS).toBe(4));
 it("has a balcony rather than a terrace", () => { expect(ROOM_AMENITIES).toContain("Balcone vista piscina"); expect(ROOM_AMENITIES).not.toContain("Terrazza"); });
 it("does not include room Wi-Fi", () => expect(ROOM_AMENITIES.some(a => /wi.?fi/i.test(a))).toBe(false));
 it("does not include a coffee machine", () => expect(ROOM_AMENITIES.some(a => /caff[eè]|coffee/i.test(a))).toBe(false));
 it("does not include spa access", () => expect(ROOM_AMENITIES.some(a => /spa/i.test(a))).toBe(false));
});
describe("new seasonal pricing", () => {
 it("May June October cost 75 per apartment-night", () => { for (const m of [4,5,9]) expect(quote(new Date(2027,m,10),new Date(2027,m,11)).total).toBe(75); });
 it("September November March cost 95", () => { for (const m of [8,10,2]) expect(quote(new Date(2027,m,10),new Date(2027,m,11)).total).toBe(95); });
 it("July August April cost 130 outside Easter", () => { for (const m of [6,7,3]) expect(quote(new Date(2027,m,10),new Date(2027,m,11)).total).toBe(130); });
 it("Dec 20 to Jan 6 costs 170", () => { for (const d of [new Date(2026,11,20),new Date(2027,0,6)]) { expect(seasonFor(d)).toBe("peak"); expect(quote(d,new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)).total).toBe(170); } });
 it("Easter and Easter Monday are peak each year", () => { expect(seasonFor(new Date(2027,2,28))).toBe("peak"); expect(seasonFor(new Date(2027,2,29))).toBe("peak"); expect(seasonFor(new Date(2026,3,5))).toBe("peak"); expect(seasonFor(new Date(2026,3,6))).toBe("peak"); });
 it("unspecified dates have no invented rate", () => { for (const d of [new Date(2027,0,7),new Date(2027,1,5),new Date(2027,11,19)]) { expect(seasonFor(d)).toBeNull(); expect(quote(d,new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)).total).toBeNull(); } });
 it("prices whole apartment by nights, with checkout excluded", () => expect(quote(new Date(2027,4,10),new Date(2027,4,13)).total).toBe(225));
 it("airport transfer costs 15 per person", () => { expect(transferTotal(1)).toBe(15); expect(transferTotal(4)).toBe(60); });
 it("adds transfer separately from accommodation", () => { const q=quote(new Date(2027,4,10),new Date(2027,4,13),transferTotal(4)); expect(q.accommodation).toBe(225); expect(q.total).toBe(285); });
});
