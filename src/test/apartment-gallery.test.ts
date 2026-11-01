import { describe, expect, it } from "vitest";

import { APARTMENT_PHOTOS } from "@/lib/site-data";

// Fulvio supplied ten real apartment photos and asked for all of them in the
// Elisir d'Oriente carousel, replacing the illustrative stand-ins.
describe("Apartment gallery", () => {
  it("shows all ten real photos supplied by the owner", () => {
    expect(APARTMENT_PHOTOS).toHaveLength(10);
    expect(new Set(APARTMENT_PHOTOS.map(p => p.src)).size).toBe(10);
    for (const photo of APARTMENT_PHOTOS) {
      expect(photo.src).toMatch(/^\/__l5e\/assets-v1\//);
      expect(photo.alt.length).toBeGreaterThan(10);
    }
  });

  it("keeps the apartment carousel free of illustrative or pending placeholders", () => {
    for (const photo of APARTMENT_PHOTOS) {
      expect(photo.alt).not.toMatch(/illustrativ|in arrivo|placeholder/i);
    }
  });
});
