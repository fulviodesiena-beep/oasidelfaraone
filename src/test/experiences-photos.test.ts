import { describe, expect, it } from "vitest";

import { EXTRAS, SPOTS } from "@/lib/site-data";

// Fulvio asked (November 2026) that every card show a photo of that exact
// experience or place: the transfer card must show a car, not a coastline.
const EXPECTED_EXTRA: Record<string, string> = {
  transfer: "exp-transfer-night.jpg",
  rasmo: "exp-coral-reef.jpg",
  tiran: "boat.jpg",
  safari: "exp-desert-camp.jpg",
  cairo: "exp-pyramids-camel.jpg",
  sinai: "exp-sinai-night.jpg",
};

const EXPECTED_SPOT: Record<string, string> = {
  "Caffè Farsha": "spot-farsha-lanterns.jpg",
  "Baia di Naama": "spot-naama-bay.jpg",
  "Vecchio Mercato": "lanterns-market.jpg",
  "Piazza Soho": "spot-soho-fountain.jpg",
  "Blue Hole, Dahab": "dahab-reef.jpg",
  "Sharm Vecchia": "exp-souk-lanterns.jpg",
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
