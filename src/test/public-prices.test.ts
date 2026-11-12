import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { quote } from "@/lib/pricing";

const read = (p: string) => readFileSync(p, "utf8");

describe("prezzi solo nel preventivo", () => {
  it("la home non espone la sezione Tariffe né importi", () => {
    const home = read("src/components/site/PublicHome.tsx");
    expect(home).not.toMatch(/id="tariffe"|SEASONS|€/);
  });
  it("llms.txt non contiene importi", () => {
    expect(read("public/llms.txt")).not.toMatch(/€|\b(80|100|120|150)\s?(€|EUR)/);
  });
  it("il preventivo calcola ancora notti e totale con pulizia esclusa", () => {
    const q = quote(new Date(2027, 4, 10), new Date(2027, 4, 13));
    expect(q.nights.map(n => n.price)).toEqual([80, 80, 80]);
    expect(q.total).toBe(240);
    expect(q.cleaningFee).toBe(40);
  });
});

describe("prezzo 'da' in evidenza", () => {
  it("mostra la tariffa minima stagionale con le avvertenze su stagione e all inclusive", async () => {
    const { FROM_PRICE, SEASON_RATES } = await import("@/lib/pricing");
    expect(FROM_PRICE).toBe(Math.min(...Object.values(SEASON_RATES)));
    const home = read("src/components/site/PublicHome.tsx");
    expect(home).toContain("Da {price} a notte · appartamento intero fino a 4 ospiti");
    expect(home).toContain("Tariffa in base alla stagione. Solo alloggio: pasti e formula all inclusive del resort non compresi.");
  });
});
