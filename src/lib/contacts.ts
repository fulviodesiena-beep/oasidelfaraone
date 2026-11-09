// Contact dedup helpers (browser- and worker-safe). Mirrors public.normalize_phone / public.upsert_contact.

/** E.164 normalisation: "+" kept, "00" → "+", bare 10-digit Italian mobiles (3xx) get +39. */
export function normalizePhone(p: string | null | undefined): string | null {
  if (!p) return null;
  const plus = p.trim().startsWith("+");
  const d = p.replace(/\D/g, "");
  if (d.length < 6) return null;
  if (plus) return `+${d}`;
  if (d.startsWith("00")) return `+${d.slice(2)}`;
  if (d.length === 10 && d.startsWith("3")) return `+39${d}`;
  return `+${d}`;
}

export const normalizeEmail = (e: string | null | undefined) => (e ?? "").trim().toLowerCase() || null;

/** Same contact when the email matches (case-insensitive) or the E.164 phone matches. */
export function findDuplicate<T extends { email: string | null; phone: string | null }>(contacts: T[], email?: string | null, phone?: string | null): T | undefined {
  const em = normalizeEmail(email), ph = normalizePhone(phone);
  if (!em && !ph) return undefined;
  return contacts.find(c => (em && normalizeEmail(c.email) === em) || (ph && normalizePhone(c.phone) === ph));
}

export const CONTACT_STATUS_LABEL: Record<string, string> = { lead: "Lead", cliente: "Cliente", ex_cliente: "Ex-cliente", iscritto: "Iscritto" };
export const CONTACT_SOURCE_LABEL: Record<string, string> = { sito: "Sito", whatsapp: "WhatsApp", booking: "Booking.com", host: "Host", newsletter: "Newsletter", import: "Import" };

/** Minor at the start of the stay (under 18 on check-in day). */
export function isMinor(birthDate: string | null | undefined, onDate: string): boolean {
  if (!birthDate) return false;
  const [by, bm, bd] = birthDate.split("-").map(Number), [y, m, d] = onDate.split("-").map(Number);
  let age = y! - by!;
  if (m! < bm! || (m === bm && d! < bd!)) age--;
  return age < 18;
}
