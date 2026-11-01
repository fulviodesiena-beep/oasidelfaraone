import { describe, expect, it } from "vitest";

import { EXTRAS, SPOTS } from "@/lib/site-data";

// Fulvio asked (November 2026) that every experience card show a photo of that
// exact experience: the transfer card must show a car, not a coastline.
const EXPECTED: Record<string, string> = {
  transfer: "exp-transfer-night.jpg",
  rasmo: "exp-coral-reef.jpg",
  tiran: "boat.jpg",
  safari: "exp-desert-camp.jpg",
  cairo: "exp-pyramids-camel.jpg",
  sinai: "exp-sinai-night.jpg",
};

describe("Experience cards", () => {
  it("shows each experience its own matching photo", () => {
    expect(EXTRAS.map(e => e.id)).toEqual(Object.keys(EXPECTED));
    for (const extra of EXTRAS) {
      expect(extra.image).toMatch(new RegExp(`/${EXPECTED[extra.id]}$`));
    }
  });

  it("never repeats one photo across two experience cards", () => {
    const images = EXTRAS.map(e => e.image);
    expect(new Set(images).size).toBe(images.length);
  });

  it("shows the old market as a souk, not as a boat", () => {
    const oldSharm = SPOTS.find(s => s.name === "Sharm Vecchia");
    expect(oldSharm?.image).toMatch(/\/exp-souk-lanterns\.jpg$/);
  });
});
