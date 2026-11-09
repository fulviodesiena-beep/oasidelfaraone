// Domina Coral Bay delegation form (official layout, A4). Pure data/rules + pdf-lib builder (browser- and worker-safe).
// The HOLDER (titolare) is the owner in Settings (Carmine Esposito); the DELEGATES are the travelers of the booking.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type PDFForm } from "pdf-lib";

export type DelegaSettings = { holder_name: string; holder_passport: string; unit_number: string; holder_phone: string; domina_email: string };
export type DelegaBooking = {
  id: string; status: string; check_in: string; check_out: string; adults: number; children: number;
  guest_email: string | null; guest_phone: string | null; total_price: number | string; deposit_paid: number | string;
  payment_verified_at: string | null; arrival_time: string | null; departure_time: string | null;
  delegate_email: string | null; delegate_phone: string | null; initial_cleaning: boolean; final_cleaning: boolean;
};
export type DelegaTraveler = { first_name: string; last_name: string; document_number: string | null; position?: number };

export const DELEGA_SUBJECT = (unit: string) => `Delega ${unit} - Elisir d'Oriente`;
export const DOMINA_CC = "ca.espo88@gmail.com";

const dmy = (k: string, sep = "/") => { const [y, m, d] = k.slice(0, 10).split("-"); return `${d}${sep}${m}${sep}${y}`; };
const withDoc = (t: DelegaTraveler[]) => t.filter(x => (x.document_number ?? "").trim());

export type DelegaState =
  | { kind: "not_eligible" } | { kind: "unpaid" }
  | { kind: "missing_docs"; missing: number }
  | { kind: "ready"; missing: number };

/** Rules: confirmed or host_collab, paid (deposit ≥ total or verified), at least one traveler with a document. */
export function delegaState(b: DelegaBooking, travelers: DelegaTraveler[]): DelegaState {
  if (b.status !== "confirmed" && b.status !== "host_collab") return { kind: "not_eligible" };
  const paid = !!b.payment_verified_at || Number(b.deposit_paid) >= Number(b.total_price);
  if (!paid) return { kind: "unpaid" };
  const guests = Math.max(b.adults + b.children, travelers.length);
  const docs = withDoc(travelers).length;
  const missing = Math.max(0, guests - docs);
  return docs === 0 ? { kind: "missing_docs", missing } : { kind: "ready", missing };
}

export function delegaData(b: DelegaBooking, travelers: DelegaTraveler[], s: DelegaSettings, today = new Date()) {
  const list = [...travelers].sort((a, c) => (a.position ?? 0) - (c.position ?? 0)).slice(0, 4);
  const count = travelers.length || b.adults + b.children;
  const t = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return {
    issueDate: dmy(t), unit: s.unit_number, holder: s.holder_name.toUpperCase(), holderPassport: s.holder_passport,
    email: b.guest_email ?? "", phone: b.guest_phone?.trim() || s.holder_phone,
    delegates: list.map(x => `${x.first_name} ${x.last_name}`.trim().toUpperCase()),
    delegatePassports: list.map(x => (x.document_number ?? "").trim().toUpperCase()),
    from: dmy(b.check_in), to: dmy(b.check_out),
    arrival: b.arrival_time ?? "", departure: b.departure_time ?? "",
    delegateEmail: b.delegate_email ?? "", delegatePhone: b.delegate_phone ?? "",
    people: (count >= 4 ? "Piu'" : String(Math.max(1, count))) as "1" | "2" | "3" | "Piu'",
    initialCleaning: b.initial_cleaning, finalCleaning: b.final_cleaning,
  };
}
export type DelegaData = ReturnType<typeof delegaData>;

/** Changes whenever dates, travelers or form inputs change → triggers regeneration. */
export function delegaFingerprint(b: DelegaBooking, travelers: DelegaTraveler[], s: DelegaSettings) {
  const { issueDate: _ignored, ...d } = delegaData(b, travelers, s);
  const str = JSON.stringify(d);
  let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export function delegaFileName(travelers: DelegaTraveler[], checkIn: string, unit = "65135") {
  const first = [...travelers].sort((a, c) => (a.position ?? 0) - (c.position ?? 0))[0];
  return `Delega ${unit} - Elisir d'Oriente - ${(first?.last_name ?? "OSPITE").trim().toUpperCase()} - ${dmy(checkIn, "-")}.pdf`;
}

export function dominaMailto(s: Pick<DelegaSettings, "domina_email" | "unit_number">, fileName: string) {
  const body = `Buongiorno,\n\nin allegato la delega per l'unità ${s.unit_number} (${fileName}).\n\nCordiali saluti\n`;
  return `mailto:${s.domina_email}?cc=${encodeURIComponent(DOMINA_CC)}&subject=${encodeURIComponent(DELEGA_SUBJECT(s.unit_number))}&body=${encodeURIComponent(body)}`;
}

export const DELEGA_RULES = [
  "A seguito della comunicazione inviata il 16/10/2023 gli importi per eventuali interventi di manutenzione, pulizie, lavanderia, etc andranno saldati direttamente in loco dagli occupanti dell'unita' durante il soggiorno;",
  "Se il delegato non paghera' qualunque importo relativo ai servizi forniti, il titolare dell'unita' si impegna a coprire l'eventuale spesa;",
  "A seguito della comunicazione inviata il 29.01.2023 si ricorda che i consumi di acqua ed energia elettrica verranno addebitati mensilmente ai titolari delle unita';",
  "In caso di accordi privati per versamenti di denaro, Domina Coral Bay non si assume alcuna responsabilita' qualora il delegato non provveda al pagamento della somma pattuita al titolare dell'unita'.",
  "In caso di presenza di Private House Keepers, gli eventuali importi per il servizio lavanderia dovranno essere saldati in contanti alla riconsegna dei capi.",
];

/** Rows of the official table, top to bottom (labels exactly as on the Domina form). */
export function delegaRows(d: DelegaData) {
  return [
    { label: "Data di emissione", kind: "pair" as const, a: d.issueDate, label2: "N. dell'Unita'", b: d.unit },
    { label: "Nome del titolare/i dell'unita'", kind: "text" as const, lines: [d.holder] },
    { label: "N. passaporto", kind: "text" as const, lines: [d.holderPassport] },
    { label: "Contatti", kind: "pair" as const, a: d.email, label2: "Cellulare", b: d.phone, prefixA: "E-mail" },
    { label: "Nome/i del/i delegato/i (specificare tutti i nominativi)", kind: "text" as const, lines: d.delegates.length ? d.delegates : [""] },
    { label: "Dal", kind: "text" as const, lines: [d.from] },
    { label: "Al", kind: "text" as const, lines: [d.to] },
    { label: "Orario indicativo di arrivo", kind: "text" as const, lines: [d.arrival] },
    { label: "Orario indicativo di partenza", kind: "text" as const, lines: [d.departure] },
    { label: "N. passaporto del delegato/i", kind: "text" as const, lines: d.delegatePassports.length ? d.delegatePassports : [""] },
    { label: "Contatti Delegato", kind: "pair" as const, a: d.delegateEmail, label2: "Cellulare", b: d.delegatePhone, prefixA: "E-mail" },
    { label: "N. di persone", kind: "boxes" as const, options: ["1", "2", "3", "Piu'"], selected: d.people },
    { label: "Spese di manutenzione", kind: "static" as const, lines: ["Da saldarsi in loco a carico del delegato"] },
    { label: "Richiesta di pulizie iniziali", kind: "boxes" as const, options: ["no", "si (da saldarsi all'arrivo da parte del delegato)"], selected: d.initialCleaning ? "si (da saldarsi all'arrivo da parte del delegato)" : "no" },
    { label: "Richiesta di pulizie finali", kind: "boxes" as const, options: ["no", "si (da saldarsi all'arrivo da parte del delegato)"], selected: d.finalCleaning ? "si (da saldarsi all'arrivo da parte del delegato)" : "no" },
  ];
}

const MM = 72 / 25.4;
const BLACK = rgb(0, 0, 0), YELLOW = rgb(1, 0xe0 / 255, 0x33 / 255);

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const out: string[] = []; let line = "";
  for (const w of text.split(" ")) { const t = line ? `${line} ${w}` : w; if (font.widthOfTextAtSize(t, size) > width && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}

export async function buildDelegaPdf(d: DelegaData, images: { header?: Uint8Array | null; signature?: Uint8Array | null } = {}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(DELEGA_SUBJECT(d.unit));
  const page = pdf.addPage([210 * MM, 297 * MM]);
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const form = pdf.getForm();
  const H = 297 * MM, L = 12 * MM, R = 198 * MM, LBL = 58 * MM, ROW = 8.5 * MM;
  let y = H - 8 * MM;

  // Header
  if (images.header) {
    const img = await pdf.embedPng(images.header);
    page.drawImage(img, { x: 0, y: y - 28 * MM, width: 210 * MM, height: 28 * MM });
  } else {
    page.drawText("DOMINA CORAL BAY", { x: L, y: y - 18 * MM, size: 22, font: bold, color: BLACK });
  }
  y -= 28 * MM + 5 * MM;

  let n = 0;
  const field = (p: PDFPage, f: PDFForm, value: string, x: number, yy: number, w: number) => {
    const tf = f.createTextField(`f${n++}`); tf.setText(value);
    tf.addToPage(p, { x, y: yy, width: w, height: 5.6 * MM, font, borderWidth: 0 });
    tf.setFontSize(8.5);
  };
  const box = (x: number, yy: number, label: string, on: boolean) => {
    const w = Math.max(12 * MM, font.widthOfTextAtSize(label, 7.6) + 9 * MM);
    page.drawRectangle({ x, y: yy, width: w, height: 5.6 * MM, borderColor: BLACK, borderWidth: 0.6, ...(on ? { color: YELLOW } : {}) });
    const cb = form.createCheckBox(`c${n++}`);
    cb.addToPage(page, { x: x + 1.2 * MM, y: yy + 1.2 * MM, width: 3.2 * MM, height: 3.2 * MM, borderWidth: 0.5, borderColor: BLACK });
    if (on) cb.check();
    page.drawText(label, { x: x + 5.5 * MM, y: yy + 1.8 * MM, size: 7.6, font, color: BLACK });
    return w;
  };

  for (const r of delegaRows(d)) {
    const lines = r.kind === "text" || r.kind === "static" ? r.lines : [""];
    const labelLines = wrap(r.label, bold, 7.8, LBL - 3 * MM);
    const h = Math.max(ROW, lines.length * 5.8 * MM + 2.6 * MM, labelLines.length * 3.4 * MM + 3 * MM);
    page.drawRectangle({ x: L, y: y - h, width: R - L, height: h, borderColor: BLACK, borderWidth: 0.8 });
    page.drawLine({ start: { x: L + LBL, y }, end: { x: L + LBL, y: y - h }, thickness: 0.8, color: BLACK });
    labelLines.forEach((t, i) => page.drawText(t, { x: L + 1.5 * MM, y: y - 4.5 * MM - i * 3.4 * MM, size: 7.8, font: bold, color: BLACK }));
    const vx = L + LBL + 1.5 * MM, vw = R - L - LBL - 3 * MM, vy = y - h / 2 - 2.8 * MM;
    if (r.kind === "text") lines.forEach((t, i) => field(page, form, t, vx, y - 1.3 * MM - (i + 1) * 5.8 * MM, vw));
    else if (r.kind === "static") page.drawText(lines[0]!, { x: vx, y: vy + 1.8 * MM, size: 8.5, font, color: BLACK });
    else if (r.kind === "pair") {
      const half = (R - L - LBL) / 2, midX = L + LBL + half;
      page.drawLine({ start: { x: midX, y }, end: { x: midX, y: y - h }, thickness: 0.8, color: BLACK });
      let ax = vx;
      if (r.prefixA) { page.drawText(r.prefixA, { x: vx, y: vy + 1.8 * MM, size: 7.8, font: bold, color: BLACK }); ax += bold.widthOfTextAtSize(r.prefixA, 7.8) + 2 * MM; }
      field(page, form, r.a, ax, vy, midX - ax - 1.5 * MM);
      page.drawText(r.label2, { x: midX + 1.5 * MM, y: vy + 1.8 * MM, size: 7.8, font: bold, color: BLACK });
      const bx = midX + 3 * MM + bold.widthOfTextAtSize(r.label2, 7.8);
      field(page, form, r.b, bx, vy, R - bx - 1.5 * MM);
    } else {
      let bx = vx;
      for (const o of r.options) bx += box(bx, vy, o, o === r.selected) + 3 * MM;
    }
    y -= h;
  }

  // Legal text
  y -= 7 * MM;
  const intro = `Con la sottoscrizione della presente, il titolare dell'unita' __${d.unit}__ si dichiara inoltre a conoscenza delle sottostanti procedure e si impegna al loro rispetto:`;
  for (const t of wrap(intro, bold, 7.8, R - L)) { page.drawText(t, { x: L, y, size: 7.8, font: bold, color: BLACK }); y -= 3.8 * MM; }
  y -= 1.5 * MM;
  for (const rule of DELEGA_RULES) {
    const ls = wrap(rule, font, 7.4, R - L - 5 * MM);
    page.drawText("•", { x: L + 1 * MM, y, size: 7.4, font, color: BLACK });
    for (const t of ls) { page.drawText(t, { x: L + 5 * MM, y, size: 7.4, font, color: BLACK }); y -= 3.5 * MM; }
    y -= 1 * MM;
  }

  // Signature
  y -= 14 * MM;
  page.drawText("Firma:", { x: L, y, size: 9, font: bold, color: BLACK });
  page.drawLine({ start: { x: L + 14 * MM, y: y - 1 * MM }, end: { x: L + 90 * MM, y: y - 1 * MM }, thickness: 0.7, color: BLACK });
  if (images.signature) {
    const sig = await pdf.embedPng(images.signature);
    const w = 60 * MM, hh = Math.min(22 * MM, (sig.height / sig.width) * w);
    page.drawImage(sig, { x: L + 20 * MM, y: y - 4 * MM, width: w, height: hh });
  }
  return pdf.save();
}
