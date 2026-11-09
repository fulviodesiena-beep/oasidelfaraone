// Motore delle automazioni: funzioni pure (testabili) che decidono cosa è dovuto oggi.
import { LANGS, MESSAGES, VISA_NOTE, type Lang, type MessageKey } from "./messages";

export type AutomationId = "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8" | "A9" | "A10";
export const AUTOMATIONS: { id: AutomationId; name: string; rule: string; channels: string }[] = [
  { id: "A1", name: "Conferma prenotazione", rule: "alla conferma (confermata + pagata)", channels: "email + WhatsApp" },
  { id: "A2", name: "Info documenti e aeroporto", rule: "5 giorni prima del check-in", channels: "email + WhatsApp" },
  { id: "A3", name: "Giorno della partenza", rule: "giorno del check-in", channels: "WhatsApp" },
  { id: "A4", name: "Va tutto bene?", rule: "2° giorno di soggiorno", channels: "WhatsApp" },
  { id: "A5", name: "Grazie e recensione", rule: "check-out +1, promemoria +6 se il link non è stato aperto", channels: "email + WhatsApp" },
  { id: "A6", name: "Social", rule: "conferma +1 e check-out +3", channels: "email" },
  { id: "A7", name: "Ricorrenze", rule: "120 e 90 giorni prima, solo con consenso ricorrenze", channels: "Brevo" },
  { id: "A8", name: "Richiesta non convertita", rule: "richiesta +2 e +7 giorni senza prenotazione", channels: "email" },
  { id: "A9", name: "Un anno fa eri a Sharm", rule: "11 mesi dopo il soggiorno, soft opt-in", channels: "Brevo" },
  { id: "A10", name: "Newsletter Lettere dall'Oasi", rule: "ogni 2 settimane, solo doppia conferma", channels: "Brevo" },
];

export type Toggles = Partial<Record<AutomationId, boolean>>;
export type ABooking = {
  id: string; status: string; check_in: string; check_out: string; total_nights: number; extras: unknown;
  guest_name: string; guest_email: string | null; guest_phone: string | null; contact_id: string | null;
  confirmed_at: string | null; payment_verified_at: string | null; deposit_paid: number | string; total_price: number | string;
  is_personal_use: boolean;
};
export type AContact = {
  id: string; first_name: string | null; email: string | null; phone: string | null; language: string | null; status: string;
  consent_occasions: boolean; consent_marketing: boolean; unsubscribed_at: string | null; newsletter_status: string;
};
export type AInquiry = { id: string; created_at: string; guest_name: string; guest_email: string | null; contact_id: string | null; status: string; language: string | null };
export type AOccasion = { id: string; contact_id: string | null; kind: string; day: number | null; month: number | null };
export type ALog = { dedup_key: string | null; automation: string; booking_id: string | null; step: string; channel: string; status: string; clicked_at: string | null };

export type Channel = "email" | "whatsapp" | "brevo";
export type DueItem = {
  automation: AutomationId; step: string; channel: Channel; msgKey: MessageKey; dedupKey: string;
  bookingId?: string | undefined; contactId?: string | undefined; inquiryId?: string | undefined; lang: Lang; to: string | null; name: string; occasion?: string | undefined;
};

const DAY = 86_400_000;
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => isoDay(new Date(Date.parse(`${d.slice(0, 10)}T12:00:00Z`) + n * DAY));
const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to.slice(0, 10)}T12:00:00Z`) - Date.parse(`${from.slice(0, 10)}T12:00:00Z`)) / DAY);
/** Due when today is in [due, due + grace]: missed jobs catch up briefly, old stays never fire. */
export const inWindow = (today: string, due: string, grace = 1) => { const d = daysBetween(due, today); return d >= 0 && d <= grace; };

export const pickLang = (l: string | null | undefined): Lang => (LANGS as string[]).includes(l ?? "") ? (l as Lang) : "it";
export const dedupKey = (a: string, step: string, channel: string, ref: string) => `${a}|${step}|${channel}|${ref}`;
export const isPaid = (b: ABooking) => !!b.payment_verified_at || (Number(b.total_price) > 0 && Number(b.deposit_paid) >= Number(b.total_price));
export const canMarket = (c: AContact | undefined) => !!c && !c.unsubscribed_at;
export const canNewsletter = (c: AContact | undefined) => canMarket(c) && c!.consent_marketing && c!.newsletter_status === "confirmed";
export const canOccasions = (c: AContact | undefined) => canMarket(c) && c!.consent_occasions;
export const canSoftOptIn = (c: AContact | undefined) => canMarket(c) && (c!.status === "cliente" || c!.status === "ex_cliente");

/** Next yearly occurrence (ISO date) of day/month on or after `today`. */
export function nextOccurrence(today: string, day: number, month: number) {
  const y = Number(today.slice(0, 4));
  const mk = (yy: number) => `${yy}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return mk(y) >= today ? mk(y) : mk(y + 1);
}

export function computeDue(input: {
  now: Date; toggles: Toggles; bookings: ABooking[]; contacts: AContact[]; inquiries: AInquiry[]; occasions: AOccasion[]; logs: ALog[];
}): DueItem[] {
  const today = isoDay(input.now);
  const on = (a: AutomationId) => input.toggles[a] === true;
  const contacts = new Map(input.contacts.map(c => [c.id, c]));
  const done = new Set(input.logs.map(l => l.dedup_key).filter(Boolean) as string[]);
  const out: DueItem[] = [];
  const push = (i: DueItem) => { if (!done.has(i.dedupKey)) { done.add(i.dedupKey); out.push(i); } };

  for (const b of input.bookings) {
    if (b.status !== "confirmed" || b.is_personal_use) continue;
    const c = b.contact_id ? contacts.get(b.contact_id) : undefined;
    const lang = pickLang(c?.language);
    const name = (c?.first_name || b.guest_name || "").split(" ")[0] ?? "";
    const email = c?.email || b.guest_email; const phone = c?.phone || b.guest_phone;
    const base = { bookingId: b.id, contactId: c?.id, lang, name };
    const both = (a: AutomationId, step: string, msgKey: MessageKey, chans: Channel[]) =>
      chans.forEach(ch => push({ ...base, automation: a, step, channel: ch, msgKey, to: ch === "whatsapp" ? phone : email, dedupKey: dedupKey(a, step, ch, b.id) }));
    const confirmedDay = b.confirmed_at?.slice(0, 10);
    if (on("A1") && confirmedDay && isPaid(b) && inWindow(today, confirmedDay, 3) && today <= b.check_in) both("A1", "", "A1", ["email", "whatsapp"]);
    if (on("A2") && inWindow(today, addDays(b.check_in, -5))) both("A2", "", "A2", ["email", "whatsapp"]);
    if (on("A3") && inWindow(today, b.check_in, 0)) both("A3", "", "A3", ["whatsapp"]);
    if (on("A4") && inWindow(today, addDays(b.check_in, 1), 0) && today < b.check_out) both("A4", "", "A4", ["whatsapp"]);
    if (on("A5") && inWindow(today, addDays(b.check_out, 1))) both("A5", "", "A5", ["email", "whatsapp"]);
    if (on("A5") && inWindow(today, addDays(b.check_out, 6))) {
      const first = input.logs.find(l => l.dedup_key === dedupKey("A5", "", "email", b.id));
      if (first && first.status === "sent" && !first.clicked_at) both("A5", "promemoria", "A5r", ["email"]);
    }
    if (on("A6") && confirmedDay && inWindow(today, addDays(confirmedDay, 1)) && today < b.check_in) both("A6", "pre", "A6a", ["email"]);
    if (on("A6") && inWindow(today, addDays(b.check_out, 3))) both("A6", "post", "A6b", ["email"]);
    if (on("A9") && canSoftOptIn(c) && inWindow(today, addDays(b.check_out, 335), 7))
      push({ ...base, automation: "A9", step: "", channel: "brevo", msgKey: "A9", to: email, dedupKey: dedupKey("A9", "", "brevo", b.id) });
  }

  if (on("A8")) for (const q of input.inquiries) {
    if (q.status === "converted" || q.status === "lost" || !q.guest_email) continue;
    const hasBooking = q.contact_id && input.bookings.some(b => b.contact_id === q.contact_id && b.status !== "cancelled");
    if (hasBooking) continue;
    const c = q.contact_id ? contacts.get(q.contact_id) : undefined;
    const lang = pickLang(q.language ?? c?.language);
    for (const [step, d, key] of [["d2", 2, "A8a"], ["d7", 7, "A8b"]] as const)
      if (inWindow(today, addDays(q.created_at, d)))
        push({ automation: "A8", step, channel: "email", msgKey: key, inquiryId: q.id, contactId: c?.id, lang, to: q.guest_email, name: q.guest_name.split(" ")[0] ?? "", dedupKey: dedupKey("A8", step, "email", q.id) });
  }

  if (on("A7")) for (const o of input.occasions) {
    const c = o.contact_id ? contacts.get(o.contact_id) : undefined;
    if (!canOccasions(c) || !o.day || !o.month) continue;
    const date = nextOccurrence(today, o.day, o.month);
    for (const [step, d] of [["d120", 120], ["d90", 90]] as const)
      if (inWindow(today, addDays(date, -d), 2))
        push({ automation: "A7", step, channel: "brevo", msgKey: "A7", contactId: c!.id, lang: pickLang(c!.language), to: c!.email, name: c!.first_name ?? "", occasion: `${o.kind} ${o.day}/${o.month}`, dedupKey: dedupKey("A7", `${step}-${date.slice(0, 4)}`, "brevo", o.id) });
  }
  return out;
}

export type Vars = Record<string, string>;
export function fill(text: string, vars: Vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}
/** Body text with owner overrides (A2 editable in admin) and the mandatory visa note. */
export function messageText(key: MessageKey, lang: Lang, vars: Vars, overrides?: Record<string, Partial<Record<Lang, string>>>) {
  const m = MESSAGES[key][lang] ?? MESSAGES[key].it;
  let body = overrides?.[key]?.[lang]?.trim() || m.body;
  if (key === "A2" && !body.includes("viaggiaresicuri")) body += `\n\n${VISA_NOTE[lang]}`;
  return { subject: fill(m.subject, vars), body: fill(body, vars) };
}

const DATE_LOCALE: Record<Lang, string> = { it: "it-IT", en: "en-GB", de: "de-DE" };
export function bookingVars(b: Pick<ABooking, "check_in" | "check_out" | "total_nights" | "extras">, name: string, lang: Lang, room: { name: string; unit: string }): Vars {
  const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(DATE_LOCALE[lang], { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const extras = Array.isArray(b.extras) ? (b.extras as unknown[]).map(e => typeof e === "string" ? e : (e as { name?: string; label?: string })?.name ?? (e as { label?: string })?.label ?? "").filter(Boolean) : [];
  const none = { it: "nessuno", en: "none", de: "keine" }[lang];
  return { nome_ospite: name || "", camera: room.name, numero_stanza: room.unit, checkin: fmt(b.check_in), checkout: fmt(b.check_out), notti: String(b.total_nights || daysBetween(b.check_in, b.check_out)), servizi: extras.join(", ") || none };
}

export const whatsappUrl = (phone: string | null | undefined, text: string) => `https://wa.me/${(phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
