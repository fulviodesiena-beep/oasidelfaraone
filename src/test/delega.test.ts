import { describe, expect, it } from "vitest";
import { delegaLines } from "@/lib/delega";

describe("delega Domina", () => {
  it("includes guest, apartment, stay dates and the on-site delegate passport", () => {
    const text = delegaLines({ guest_name: "Mario Rossi", check_in: "2026-12-01", check_out: "2026-12-08", adults: 2, children: 1 }, "B214").join("\n");
    expect(text).toContain("Mario Rossi");
    expect(text).toContain("n. B214");
    expect(text).toMatch(/01 dic 2026.*08 dic 2026/);
    expect(text).toContain("Carmine Esposito, passaporto YD1421286");
  });
});
