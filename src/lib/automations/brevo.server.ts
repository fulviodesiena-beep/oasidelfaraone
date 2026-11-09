// Brevo API v3 (email marketing). Server-only: legge BREVO_API_KEY. Nessun invio di campagne senza azione esplicita.
const BASE = "https://api.brevo.com/v3";
export const BREVO_SENDER = { name: "Oasi del Faraone", email: "prenotazioni@oasidelfaraone.it" };
export const REPLY_TO = "prenotazionisharm@gmail.com";
export const NEWSLETTER_LIST = "Newsletter Oasi";

export const hasBrevo = () => !!process.env["BREVO_API_KEY"];

export async function brevo<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const key = process.env["BREVO_API_KEY"];
  if (!key) throw new Error("Brevo non configurato: manca BREVO_API_KEY");
  const r = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: { "api-key": key, accept: "application/json", "content-type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

/** Finds or creates the "Newsletter Oasi" list. */
export async function ensureList(): Promise<number> {
  const lists = await brevo<{ lists?: { id: number; name: string }[] }>("/contacts/lists?limit=50");
  const found = lists.lists?.find(l => l.name === NEWSLETTER_LIST);
  if (found) return found.id;
  const folders = await brevo<{ folders?: { id: number }[] }>("/contacts/folders?limit=1");
  const folderId = folders.folders?.[0]?.id ?? (await brevo<{ id: number }>("/contacts/folders", { method: "POST", body: { name: "Oasi del Faraone" } })).id;
  return (await brevo<{ id: number }>("/contacts/lists", { method: "POST", body: { name: NEWSLETTER_LIST, folderId } })).id;
}

export type BrevoAttrs = { NOME?: string; LINGUA?: string; ULTIMO_SOGGIORNO?: string };
export async function upsertBrevoContact(email: string, attributes: BrevoAttrs, listIds: number[], unlinkListIds: number[] = []) {
  await brevo("/contacts", { method: "POST", body: { email, attributes, listIds, unlinkListIds, updateEnabled: true } });
}
export async function blacklistBrevo(email: string) {
  try { await brevo(`/contacts/${encodeURIComponent(email)}`, { method: "PUT", body: { emailBlacklisted: true } }); }
  catch (e) { if (!String(e).includes("404")) throw e; }
}
export async function sendBrevoEmail(m: { to: string; name?: string; subject: string; html: string; text: string; tag: string }) {
  const r = await brevo<{ messageId?: string }>("/smtp/email", { method: "POST", body: {
    sender: BREVO_SENDER, replyTo: { email: REPLY_TO }, to: [{ email: m.to, ...(m.name ? { name: m.name } : {}) }],
    subject: m.subject, htmlContent: m.html, textContent: m.text, tags: [m.tag],
  } });
  return r.messageId ?? null;
}
export async function ensureAttributes() {
  for (const name of ["NOME", "LINGUA", "ULTIMO_SOGGIORNO"]) {
    try { await brevo(`/contacts/attributes/normal/${name}`, { method: "POST", body: { type: name === "ULTIMO_SOGGIORNO" ? "date" : "text" } }); }
    catch (e) { if (!/400|already/i.test(String(e))) throw e; }
  }
}
