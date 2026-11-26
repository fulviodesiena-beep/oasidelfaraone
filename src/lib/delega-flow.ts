// Domina delega flow (capitolo 2 delle consegne): pure rules, email text and MIME builder.
// Browser- and worker-safe: no secrets, no I/O. Server parts live in *.server.ts files.
import { DOMINA_CC, delegaState, type DelegaBooking, type DelegaTraveler } from "./delega";

/** Sender the Domina recognises: delegas must leave from this mailbox, never from the site's transactional sender. */
export const DELEGA_SENDER = "prenotazionisharm@gmail.com";
/** email_log automation id for a delega sent to the Domina (one row per send, shown as "Delega inviata il…"). */
export const DELEGA_LOG = "DELEGA";
/** Guest documents uploaded from the private page are stored as documents.kind = GUEST_DOC_KIND. */
export const GUEST_DOC_KIND = "guest_id";
/** Days before check-in under which a missing delega raises a dashboard warning. */
export const DELEGA_WARNING_DAYS = 7;
/** Max size of one uploaded document photo (bytes) and accepted types. */
export const GUEST_DOC_MAX_BYTES = 12 * 1024 * 1024;
export const GUEST_DOC_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"] as const;

const dmy = (k: string) => { const [y, m, d] = k.slice(0, 10).split("-"); return `${d}/${m}/${y}`; };

/** Subject and body of the delega email, from the old app (Elisir 65135) that sent 12 delegas in 2026. */
export function delegaEmail(unit: string, checkIn: string, checkOut: string) {
  return {
    subject: `Delega ${unit}`,
    text: `Buongiorno,\n\ninvio in allegato delega per l'unità ${unit} relativa alle seguenti date:\n\nCheck-in: ${dmy(checkIn)}\nCheck-out: ${dmy(checkOut)}\n\nIn allegato i documenti.\n\nResto in attesa di un vostro feedback.\n\nGrazie e buon lavoro.\n`,
  };
}

export type SendBlocker = "not_eligible" | "unpaid" | "missing_docs" | "no_delega" | "no_files" | "already_sent";
export const BLOCKER_TEXT: Record<SendBlocker, string> = {
  not_eligible: "la prenotazione non è confermata",
  unpaid: "il pagamento non è verificato",
  missing_docs: "mancano i documenti di uno o più viaggiatori",
  no_delega: "la delega non è ancora stata generata",
  no_files: "non ci sono foto dei documenti da allegare",
  already_sent: "la delega aggiornata è già stata inviata",
};

/**
 * Rule E: never send when a document is missing or the booking is not paid.
 * Every traveler (adults + children) must have a document number, the delega must exist,
 * and at least one photo of the documents must be attached. `sentFingerprints` blocks resending the same delega.
 */
export function canSendDelega(input: {
  booking: DelegaBooking; travelers: DelegaTraveler[]; delega: { fingerprint: string | null } | null;
  files: number; sentFingerprints: string[]; force?: boolean;
}): { ok: true } | { ok: false; blockers: SendBlocker[] } {
  const state = delegaState(input.booking, input.travelers);
  const blockers: SendBlocker[] = [];
  if (state.kind === "not_eligible") blockers.push("not_eligible");
  else if (state.kind === "unpaid") blockers.push("unpaid");
  else if (state.kind === "missing_docs" || state.missing > 0) blockers.push("missing_docs");
  if (!input.delega) blockers.push("no_delega");
  if (input.files === 0) blockers.push("no_files");
  if (!input.force && input.delega?.fingerprint && input.sentFingerprints.includes(input.delega.fingerprint)) blockers.push("already_sent");
  return blockers.length ? { ok: false, blockers } : { ok: true };
}

/** Dashboard warning: confirmed stay starting within DELEGA_WARNING_DAYS and no delega sent yet. */
export function delegaWarning(b: { status: string; check_in: string; is_personal_use?: boolean }, sent: boolean, today: string) {
  if (sent || b.is_personal_use || (b.status !== "confirmed" && b.status !== "host_collab")) return null;
  const days = Math.round((Date.parse(`${b.check_in}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
  return days >= 0 && days < DELEGA_WARNING_DAYS ? days : null;
}

/** Guests still missing a document: drives the -10 days reminder and the upload page. */
export function missingDocuments(b: { adults: number; children: number }, travelersWithDoc: number, uploads: number) {
  const guests = b.adults + b.children;
  return Math.max(0, guests - Math.max(travelersWithDoc, uploads));
}

// ── MIME (RFC 5322 / 2045) for the Gmail API: multipart/mixed with base64 attachments ──
export type MailAttachment = { filename: string; contentType: string; data: Uint8Array };
const b64 = (bytes: Uint8Array) => {
  let s = ""; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
};
const wrap = (s: string) => s.replace(/.{1,76}/g, "$&\r\n").trimEnd();
/** RFC 2047 encoded-word for non-ASCII headers (subject, filenames). */
export const encodeHeader = (v: string) => (/^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${b64(new TextEncoder().encode(v))}?=`);
const safeName = (n: string) => n.replace(/["\\\r\n]/g, "_");

export function buildMime(m: { from: string; to: string; cc?: string[]; subject: string; text: string; attachments: MailAttachment[]; boundary?: string }) {
  const boundary = m.boundary ?? `oasi-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const head = [
    `From: Oasi del Faraone <${m.from}>`, `To: ${m.to}`, ...(m.cc?.length ? [`Cc: ${m.cc.join(", ")}`] : []),
    `Subject: ${encodeHeader(m.subject)}`, "MIME-Version: 1.0", `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ];
  const parts = [
    [`--${boundary}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrap(b64(new TextEncoder().encode(m.text)))].join("\r\n"),
    ...m.attachments.map(a => [
      `--${boundary}`, `Content-Type: ${a.contentType}; name="${encodeHeader(safeName(a.filename))}"`, "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${encodeHeader(safeName(a.filename))}"`, "", wrap(b64(a.data)),
    ].join("\r\n")),
  ];
  return `${head.join("\r\n")}\r\n\r\n${parts.join("\r\n")}\r\n--${boundary}--\r\n`;
}

export const DOMINA_RECIPIENTS = (dominaEmail: string) => ({ to: dominaEmail, cc: [DOMINA_CC] });

// ── Document reading (AI) result, normalised before it can prefill a traveler ──
export type ExtractedDocument = {
  first_name: string; last_name: string; document_number: string; document_type: "passaporto" | "carta_identita";
  birth_date: string | null; nationality: string | null; confidence: "alta" | "media" | "bassa";
};
/** Accepts the model's JSON loosely and returns a clean record, or null when the essentials are missing. */
export function normaliseExtracted(raw: unknown): ExtractedDocument | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (k: string) => (typeof r[k] === "string" ? (r[k] as string).trim() : "");
  const first = str("first_name"), last = str("last_name"), num = str("document_number").replace(/\s+/g, "").toUpperCase();
  if (!first || !last || !num) return null;
  const type = /carta|ident|id.?card/i.test(str("document_type")) ? "carta_identita" : "passaporto";
  const bd = str("birth_date");
  const birth = /^\d{4}-\d{2}-\d{2}$/.test(bd) && !Number.isNaN(Date.parse(bd)) ? bd : null;
  const conf = str("confidence");
  return {
    first_name: first.replace(/\s+/g, " "), last_name: last.replace(/\s+/g, " "), document_number: num, document_type: type,
    birth_date: birth, nationality: str("nationality") || null, confidence: conf === "alta" || conf === "bassa" ? conf : "media",
  };
}
