import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildDelegaPdf, delegaData, delegaFileName, delegaFingerprint, delegaRows, delegaState, dominaMailto, type DelegaBooking } from "@/lib/delega";

const settings = { holder_name: "Carmine Esposito", holder_passport: "YD1421286", unit_number: "65135", holder_phone: "+39 334 732 8158", domina_email: "reservation-ks@dominacoralbay.com" };
const booking: DelegaBooking = {
  id: "b1", status: "confirmed", check_in: "2026-12-01", check_out: "2026-12-08", adults: 2, children: 0,
  guest_email: "mario@example.com", guest_phone: null, total_price: 700, deposit_paid: 700, payment_verified_at: null,
  arrival_time: null, departure_time: null, delegate_email: null, delegate_phone: null, initial_cleaning: false, final_cleaning: true,
};
const travelers = [
  { first_name: "Mario", last_name: "Rossi", document_number: "ya1234567", position: 0 },
  { first_name: "Anna", last_name: "Bianchi", document_number: "YB7654321", position: 1 },
];

describe("delega Domina — campi", () => {
  const d = delegaData(booking, travelers, settings, new Date(2026, 10, 9));
  it("holder is the owner (Carmine), delegates are the travelers — not inverted", () => {
    expect(d.holder).toBe("CARMINE ESPOSITO");
    expect(d.holderPassport).toBe("YD1421286");
    expect(d.delegates).toEqual(["MARIO ROSSI", "ANNA BIANCHI"]);
    expect(d.delegatePassports).toEqual(["YA1234567", "YB7654321"]);
  });
  it("fills issue date, unit 65135, client email and default phone", () => {
    expect(d.issueDate).toBe("09/11/2026");
    expect(d.unit).toBe("65135");
    expect(d.email).toBe("mario@example.com");
    expect(d.phone).toBe("+39 334 732 8158");
    expect([d.from, d.to]).toEqual(["01/12/2026", "08/12/2026"]);
  });
  it("selects people box and cleaning defaults (initial no, final si)", () => {
    const rows = delegaRows(d);
    expect(rows.find(r => r.label === "N. di persone")).toMatchObject({ selected: "2" });
    expect(rows.find(r => r.label === "Richiesta di pulizie iniziali")).toMatchObject({ selected: "no" });
    expect(rows.find(r => r.label === "Richiesta di pulizie finali")).toMatchObject({ selected: "si (da saldarsi all'arrivo da parte del delegato)" });
    expect(delegaData({ ...booking, adults: 4 }, [], settings).people).toBe("Piu'");
  });
  it("file name and Domina email", () => {
    expect(delegaFileName(travelers, booking.check_in)).toBe("Delega 65135 - Elisir d'Oriente - ROSSI - 01-12-2026.pdf");
    const m = dominaMailto(settings, "x.pdf");
    expect(m.startsWith("mailto:reservation-ks@dominacoralbay.com?")).toBe(true);
    expect(decodeURIComponent(m)).toContain("subject=Delega 65135 - Elisir d'Oriente");
  });
  it("builds a fillable A4 PDF", async () => {
    const pdf = await PDFDocument.load(await buildDelegaPdf(d));
    const [w, h] = [pdf.getPage(0).getWidth(), pdf.getPage(0).getHeight()];
    expect(Math.round(w)).toBe(595); expect(Math.round(h)).toBe(842);
    const texts = pdf.getForm().getFields().map(f => ("getText" in f ? (f as { getText: () => string | undefined }).getText() : undefined));
    expect(texts).toContain("CARMINE ESPOSITO");
    expect(texts).toContain("MARIO ROSSI");
  });
});

describe("delega Domina — regole di generazione", () => {
  it("not for pending bookings", () => expect(delegaState({ ...booking, status: "pending" }, travelers).kind).toBe("not_eligible"));
  it("waits for payment unless verified", () => {
    expect(delegaState({ ...booking, deposit_paid: 200 }, travelers).kind).toBe("unpaid");
    expect(delegaState({ ...booking, deposit_paid: 200, payment_verified_at: "2026-11-01T10:00:00Z" }, travelers).kind).toBe("ready");
  });
  it("needs at least one traveler with a document, counts missing ones", () => {
    expect(delegaState(booking, [])).toEqual({ kind: "missing_docs", missing: 2 });
    expect(delegaState(booking, [travelers[0]!, { ...travelers[1]!, document_number: null }])).toEqual({ kind: "ready", missing: 1 });
    expect(delegaState({ ...booking, status: "host_collab" }, travelers).kind).toBe("ready");
  });
  it("fingerprint changes with dates or travelers (regeneration)", () => {
    const fp = delegaFingerprint(booking, travelers, settings);
    expect(delegaFingerprint({ ...booking, check_out: "2026-12-09" }, travelers, settings)).not.toBe(fp);
    expect(delegaFingerprint(booking, travelers.slice(0, 1), settings)).not.toBe(fp);
    expect(delegaFingerprint(booking, travelers, settings)).toBe(fp);
  });
});
