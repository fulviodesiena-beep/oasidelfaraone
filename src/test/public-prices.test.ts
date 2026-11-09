import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { quote } from "@/lib/pricing";

const read = (p: string) => readFileSync(p, "utf8");

describe("prezzi solo nel preventivo", () => {
  it("la home non espone la sezione Tariffe né importi", () => {
    const home = read("src/routes/index.tsx");
    expect(home).not.toMatch(/id="tariffe"|SEASONS|€/);
    expect(home).toContain('["book", "Disponibilità"]');
    expect(home).toContain("Verifica disponibilità");
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
