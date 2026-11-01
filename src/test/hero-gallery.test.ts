import { describe, expect, it } from "vitest";

import { HERO_PHOTOS } from "@/lib/site-data";

// Fulvio supplied three real photos for the opening slider (November 2026) and
// asked for them in the exact order he sent them: hero-2, hero-1, hero-3.
describe("Hero slider", () => {
  it("shows the three real photos supplied by the owner, in his order", () => {
    expect(HERO_PHOTOS).toHaveLength(3);
    expect(HERO_PHOTOS.map(p => p.src)).toEqual([
      "/__l5e/assets-v1/57b0c14a-b553-4421-b645-cd88bccc2310/hero-2.jpg",
      "/__l5e/assets-v1/f32236ac-38ae-416e-91ee-673b2b6e448c/hero-1.jpg",
      "/__l5e/assets-v1/40bcb620-8397-4f2f-a5e9-5e07e4b4378b/hero-3.jpg",
    ]);
    for (const photo of HERO_PHOTOS) {
      expect(photo.alt.length).toBeGreaterThan(10);
    }
  });

  it("keeps the hero free of illustrative or pending placeholders", () => {
    for (const photo of HERO_PHOTOS) {
      expect(photo.alt).not.toMatch(/illustrativ|in arrivo|placeholder/i);
    }
  });
});
