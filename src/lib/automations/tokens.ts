// Token firmati HMAC (Web Crypto, compatibile con il runtime edge). Server-only: legge EMAIL_TOKEN_SECRET.
const enc = new TextEncoder();
const b64u = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s: string) => atob(s.replace(/-/g, "+").replace(/_/g, "/"));

async function hmac(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
export type TokenPurpose = "unsub" | "nl-confirm" | "brevo-webhook";

export async function signToken(purpose: TokenPurpose, subject: string, secret = process.env["EMAIL_TOKEN_SECRET"] ?? "") {
  if (!secret) throw new Error("EMAIL_TOKEN_SECRET mancante");
  const payload = b64u(enc.encode(`${purpose}:${subject}`));
  return `${payload}.${await hmac(secret, payload)}`;
}
/** Returns the subject (e.g. contact id) when the signature is valid for that purpose, else null. */
export async function verifyToken(purpose: TokenPurpose, token: string, secret = process.env["EMAIL_TOKEN_SECRET"] ?? "") {
  if (!secret || typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await hmac(secret, payload);
  if (expected.length !== sig.length) return null;
  let diff = 0; for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff) return null;
  try { const [p, ...rest] = fromB64u(payload).split(":"); return p === purpose ? rest.join(":") : null; } catch { return null; }
}
