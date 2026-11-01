import { describe, expect, it } from "vitest";

import { VILLAGE_PHOTOS } from "@/lib/site-data";

// Fulvio supplied ten real photos of the Domina Coral Bay village (August 2026)
// and asked for them to replace the illustrative images in the village carousel.
describe("Village gallery", () => {
  it("shows all ten real photos supplied by the owner", () => {
    expect(VILLAGE_PHOTOS).toHaveLength(10);
    expect(new Set(VILLAGE_PHOTOS.map(p => p.src)).size).toBe(10);
    for (const photo of VILLAGE_PHOTOS) {
      expect(photo.src).toMatch(/^\/__l5e\/assets-v1\//);
      expect(photo.alt.length).toBeGreaterThan(10);
    }
  });

  it("keeps the village carousel free of illustrative or pending placeholders", () => {
    for (const photo of VILLAGE_PHOTOS) {
      expect(photo.alt).not.toMatch(/illustrativ|in arrivo|placeholder/i);
    }
  });
});
