// Builds the Domina Coral Bay delegation PDF in the browser.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { fmtDate, type Booking } from "@/lib/admin";

export const DELEGA = {
  owner: "Fulvio De Siena",
  delegate: "Carmine Esposito",
  delegatePassport: "YD1421286",
  to: "reservation-ks@dominacoralbay.com",
  cc: "ca.espo88@gmail.com",
  /** Domina rules: Fulvio will paste the official text here. */
  rules: [
    "Regole Domina Coral Bay: testo da inserire dal proprietario.",
  ],
};

export function delegaLines(b: Pick<Booking, "guest_name" | "check_in" | "check_out" | "adults" | "children">, apartment: string) {
  return [
    `Spett.le Domina Coral Bay — Reservation (${DELEGA.to})`,
    "",
    `Il sottoscritto ${DELEGA.owner}, proprietario dell'appartamento n. ${apartment || "____"},`,
    `con la presente autorizza l'ospite ${b.guest_name}`,
    `(${b.adults} adulti, ${b.children} bambini) a soggiornare nell'appartamento`,
    `dal ${fmtDate(b.check_in)} al ${fmtDate(b.check_out)}.`,
    "",
    `Delegato in loco: ${DELEGA.delegate}, passaporto ${DELEGA.delegatePassport}.`,
    "",
    ...DELEGA.rules,
  ];
}

export async function buildDelegaPdf(b: Booking, apartment: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.05, 0.1, 0.16);
  page.drawText("DELEGA SOGGIORNO", { x: 60, y: 770, size: 18, font: bold, color: ink });
  let y = 730;
  for (const line of delegaLines(b, apartment)) {
    page.drawText(line, { x: 60, y, size: 11, font, color: ink, maxWidth: 475 });
    y -= 18;
  }
  y -= 40;
  page.drawText(`Data: ${new Date().toLocaleDateString("it-IT")}`, { x: 60, y, size: 11, font, color: ink });
  page.drawText("Firma del proprietario", { x: 360, y, size: 10, font, color: ink });
  page.drawLine({ start: { x: 360, y: y - 30 }, end: { x: 535, y: y - 30 }, thickness: 0.6, color: ink });
  page.drawText(DELEGA.owner, { x: 360, y: y - 45, size: 11, font: bold, color: ink });
  return pdf.save();
}
