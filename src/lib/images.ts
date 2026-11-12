/**
 * Responsive images via the Lovable asset CDN: `/__l5e/assets-v1/...?...w=N` returns a resized
 * image and negotiates AVIF/WebP from the Accept header, so no extra files are needed.
 * Other sources (external URLs, data URIs) get no srcset.
 */
const CDN_PATH = "/__l5e/assets-v1/";
export const isCdnImage = (src: string) => src.includes(CDN_PATH);
export function cdnSrcSet(src: string, widths: number[]): string | undefined {
  if (!isCdnImage(src)) return undefined;
  const sep = src.includes("?") ? "&" : "?";
  return widths.map((w) => `${src}${sep}w=${w} ${w}w`).join(", ");
}
/** Widths for photos shown in cards and carousels (up to ~440px wide on screen, 2x/3x DPR). */
export const CARD_WIDTHS = [480, 960, 1440];
/** Widths for full-bleed hero photos. */
export const HERO_WIDTHS = [960, 1440, 1920];
