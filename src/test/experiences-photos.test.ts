import { describe, expect, it } from "vitest";

import { EXTRAS, SPOTS } from "@/lib/site-data";

// Fulvio asked (November 2026) that every card show a photo of that exact
// experience or place: the transfer card must show a car, not a coastline.
const EXPECTED_EXTRA: Record<string, string> = {
  transfer: "exp-transfer-owner.jpg",
  rasmo: "exp-rasmo-owner.webp",
  tiran: "exp-tiran-owner.jpg",
  safari: "exp-safari-owner.jpg",
  cairo: "exp-pyramids-camel.jpg",
  sinai: "exp-sinai-night.jpg",
};

const EXPECTED_SPOT: Record<string, string> = {
  "Caffè Farsha": "spot-farsha-owner.jpg",
  "Baia di Naama": "spot-naama-bay.jpg",
  "Vecchio Mercato": "spot-market-owner.jpg",
  "Soho Square": "spot-soho-owner.jpg",
  "Blue Hole, Dahab": "dahab-reef.jpg",
  "Old Sharm": "spot-oldsharm-owner.webp",
};

describe("Experience cards", () => {
  it("shows each experience its own matching photo", () => {
    expect(EXTRAS.map(e => e.id)).toEqual(Object.keys(EXPECTED_EXTRA));
    for (const extra of EXTRAS) {
      expect(extra.image).toMatch(new RegExp(`/${EXPECTED_EXTRA[extra.id]}$`));
    }
  });

  it("never repeats one photo across two experience cards", () => {
    const images = EXTRAS.map(e => e.image);
    expect(new Set(images).size).toBe(images.length);
  });

  it("crops the transfer photo so the guest with luggage stays in frame", () => {
    // The guest stands at the far left of the photo; a centred crop cut him off.
    const focus = EXTRAS.find(e => e.id === "transfer")?.focus;
    expect(typeof focus).toBe("string");
    const pct = Number.parseInt((focus ?? "").split(" ")[0] ?? "0", 10);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(10);
  });
});

describe("Place cards", () => {
  it("shows each place its own matching photo", () => {
    expect(SPOTS.map(s => s.name)).toEqual(Object.keys(EXPECTED_SPOT));
    for (const spot of SPOTS) {
      expect(spot.image).toMatch(new RegExp(`/${EXPECTED_SPOT[spot.name]}$`));
    }
  });

  it("never repeats one photo across two place cards", () => {
    const images = SPOTS.map(s => s.image);
    expect(new Set(images).size).toBe(images.length);
  });
});
