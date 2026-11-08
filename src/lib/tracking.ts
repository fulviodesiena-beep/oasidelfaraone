// Attribution (UTM, referrer, landing page) captured on the first visit of the session, plus Meta Pixel helpers.
export type Attribution = { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; referrer: string | null; landing_page: string | null };
const KEY = "odf_attribution";
const CONSENT_KEY = "odf_cookie_consent";
const cut = (v: string | null, n: number) => (v ? v.slice(0, n) : null);

/** Pure: builds the attribution record from a URL and referrer. */
export function attributionFrom(href: string, referrer: string): Attribution {
  const u = new URL(href);
  const p = u.searchParams;
  return {
    utm_source: cut(p.get("utm_source"), 200), utm_medium: cut(p.get("utm_medium"), 200), utm_campaign: cut(p.get("utm_campaign"), 200),
    referrer: cut(referrer || null, 1000), landing_page: cut(u.origin + u.pathname + u.search, 1000),
  };
}
export function captureAttribution() {
  try { if (!sessionStorage.getItem(KEY)) sessionStorage.setItem(KEY, JSON.stringify(attributionFrom(window.location.href, document.referrer))); } catch { /* storage blocked */ }
}
export function getAttribution(): Partial<Attribution> {
  try { return JSON.parse(sessionStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}

export type Consent = "accepted" | "rejected" | null;
export const readConsent = (): Consent => { try { const v = localStorage.getItem(CONSENT_KEY); return v === "accepted" || v === "rejected" ? v : null; } catch { return null; } };
export const writeConsent = (v: "accepted" | "rejected") => { try { localStorage.setItem(CONSENT_KEY, v); } catch { /* ignore */ } };

type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: unknown };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

/** Loads the Meta Pixel only when an ID is configured and the visitor accepted cookies. */
export function loadMetaPixel(pixelId: string) {
  if (!/^\d{5,20}$/.test(pixelId) || window.fbq) return;
  const f = function (...args: unknown[]) { f.callMethod ? f.callMethod(...args) : f.queue.push(args); } as Fbq;
  f.queue = []; f.loaded = true; f.version = "2.0"; f.push = f;
  window.fbq = f; window._fbq = f;
  const s = document.createElement("script"); s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  f("init", pixelId); f("track", "PageView");
}
export function trackEvent(name: "Lead" | "Contact") { try { window.fbq?.("track", name); } catch { /* ignore */ } }
