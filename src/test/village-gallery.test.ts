import { describe, expect, it } from "vitest";

import { VILLAGE_PHOTOS } from "@/lib/site-data";

// Fulvio supplied eighteen real photos of the Domina Coral Bay village (August 2026)
// and asked for all of them in the village carousel, replacing the illustrative images.
describe("Village gallery", () => {
  it("shows all eighteen real photos supplied by the owner", () => {
    expect(VILLAGE_PHOTOS).toHaveLength(18);
    expect(new Set(VILLAGE_PHOTOS.map(p => p.src)).size).toBe(18);
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
