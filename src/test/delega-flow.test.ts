import { describe, expect, it } from "vitest";
import { buildMime, canSendDelega, delegaEmail, delegaWarning, encodeHeader, missingDocuments, normaliseExtracted, DELEGA_SENDER, DOMINA_RECIPIENTS } from "@/lib/delega-flow";
import { signUploadToken, uploadExpiry, verifyUploadToken, signDocumentToken } from "@/lib/automations/tokens";
import { computeDue, AUTOMATIONS } from "@/lib/automations/engine";
import { MESSAGES } from "@/lib/automations/messages";
import type { DelegaBooking, DelegaTraveler } from "@/lib/delega";

const booking: DelegaBooking = {
  id: "11111111-1111-1111-1111-111111111111", status: "confirmed", check_in: "2026-12-01", check_out: "2026-12-08", adults: 2, children: 0,
  guest_email: "g@x.it", guest_phone: "+39333", total_price: 700, deposit_paid: 700, payment_verified_at: null,
  arrival_time: null, departure_time: null, delegate_email: null, delegate_phone: null, initial_cleaning: false, final_cleaning: true,
};
const two: DelegaTraveler[] = [{ first_name: "Mario", last_name: "Rossi", document_number: "YA1234567" }, { first_name: "Anna", last_name: "Bianchi", document_number: "CA00000AA" }];

describe("delega email (old app text)", () => {
  it("uses subject 'Delega <unit>' and the check-in/out dates", () => {
    const m = delegaEmail("65135", "2026-12-01", "2026-12-08");
    expect(m.subject).toBe("Delega 65135");
    expect(m.text).toContain("invio in allegato delega per l'unità 65135");
    expect(m.text).toContain("Check-in: 01/12/2026");
    expect(m.text).toContain("Check-out: 08/12/2026");
    expect(m.text).toContain("Resto in attesa di un vostro feedback.");
  });
  it("goes from prenotazionisharm to the Domina with the owner in CC", () => {
    expect(DELEGA_SENDER).toBe("prenotazionisharm@gmail.com");
    expect(DOMINA_RECIPIENTS("reservation-ks@dominacoralbay.com")).toEqual({ to: "reservation-ks@dominacoralbay.com", cc: ["ca.espo88@gmail.com"] });
  });
});

describe("send rules (punto E)", () => {
  const delega = { fingerprint: "abc" };
  it("sends when paid, every traveler has a document, the delega exists and photos are attached", () => {
    expect(canSendDelega({ booking, travelers: two, delega, files: 2, sentFingerprints: [] })).toEqual({ ok: true });
  });
  it("blocks an unpaid booking", () => {
    const r = canSendDelega({ booking: { ...booking, deposit_paid: 100 }, travelers: two, delega, files: 2, sentFingerprints: [] });
    expect(r.ok).toBe(false); if (!r.ok) expect(r.blockers).toContain("unpaid");
  });
  it("blocks when a traveler document is missing", () => {
    const r = canSendDelega({ booking, travelers: [two[0]!, { ...two[1]!, document_number: null }], delega, files: 2, sentFingerprints: [] });
    expect(r.ok).toBe(false); if (!r.ok) expect(r.blockers).toContain("missing_docs");
    const r2 = canSendDelega({ booking: { ...booking, adults: 3 }, travelers: two, delega, files: 2, sentFingerprints: [] });
    expect(r2.ok).toBe(false);
  });
  it("blocks without delega or attachments, and does not resend the same delega unless forced", () => {
    const r = canSendDelega({ booking, travelers: two, delega: null, files: 0, sentFingerprints: [] });
    expect(r.ok).toBe(false); if (!r.ok) expect(r.blockers).toEqual(expect.arrayContaining(["no_delega", "no_files"]));
    expect(canSendDelega({ booking, travelers: two, delega, files: 2, sentFingerprints: ["abc"] }).ok).toBe(false);
    expect(canSendDelega({ booking, travelers: two, delega, files: 2, sentFingerprints: ["abc"], force: true }).ok).toBe(true);
  });
});

describe("dashboard warning and missing documents", () => {
  it("warns when arrival is under 7 days away and the delega was not sent", () => {
    expect(delegaWarning(booking, false, "2026-11-26")).toBe(5);
    expect(delegaWarning(booking, true, "2026-11-26")).toBeNull();
    expect(delegaWarning(booking, false, "2026-11-20")).toBeNull();
    expect(delegaWarning({ ...booking, status: "pending" }, false, "2026-11-28")).toBeNull();
  });
  it("counts the guests still without a document", () => {
    expect(missingDocuments({ adults: 2, children: 1 }, 1, 2)).toBe(1);
    expect(missingDocuments({ adults: 2, children: 0 }, 2, 0)).toBe(0);
  });
});

describe("MIME for the Gmail API", () => {
  it("builds multipart/mixed with base64 text and attachments", () => {
    const mime = buildMime({ from: DELEGA_SENDER, to: "a@b.it", cc: ["c@d.it"], subject: "Delega 65135", text: "Ciao è", boundary: "B", attachments: [{ filename: "Delega 65135.pdf", contentType: "application/pdf", data: new Uint8Array([37, 80, 68, 70]) }] });
    expect(mime).toContain("From: Oasi del Faraone <prenotazionisharm@gmail.com>");
    expect(mime).toContain("To: a@b.it\r\nCc: c@d.it\r\nSubject: Delega 65135");
    expect(mime).toContain('Content-Type: multipart/mixed; boundary="B"');
    expect(mime).toContain('Content-Disposition: attachment; filename="Delega 65135.pdf"');
    expect(mime).toContain("JVBERg=="); // %PDF
    expect(mime.trimEnd().endsWith("--B--")).toBe(true);
    expect(atob(mime.split("Content-Transfer-Encoding: base64\r\n\r\n")[1]!.split("\r\n--B")[0]!.replace(/\r\n/g, ""))).toBe(String.fromCharCode(...new TextEncoder().encode("Ciao è")));
  });
  it("encodes non-ASCII headers", () => {
    expect(encodeHeader("Delega 65135")).toBe("Delega 65135");
    expect(encodeHeader("Unità")).toMatch(/^=\?UTF-8\?B\?.+\?=$/);
  });
});

describe("guest upload link", () => {
  const secret = "test-secret";
  it("verifies only an unexpired upload token for the same purpose", async () => {
    const t = await signUploadToken(booking.id, Date.now() + 60_000, secret);
    expect(await verifyUploadToken(t, Date.now(), secret)).toBe(booking.id);
    expect(await verifyUploadToken(t, Date.now() + 120_000, secret)).toBeNull();
    expect(await verifyUploadToken(await signDocumentToken(booking.id, Date.now() + 60_000, secret), Date.now(), secret)).toBeNull();
    expect(await verifyUploadToken(`${t}x`, Date.now(), secret)).toBeNull();
  });
  it("stays valid until two days after check-out, at least a week", () => {
    const now = Date.parse("2026-11-26T10:00:00Z");
    expect(uploadExpiry("2026-12-08", now)).toBe(Date.parse("2026-12-10T00:00:00Z"));
    expect(uploadExpiry("2026-11-27", now)).toBe(now + 7 * 86400_000);
  });
});

describe("A11 reminder (-10 days, documents missing)", () => {
  const ab = { ...booking, total_nights: 7, extras: [], guest_name: "Mario Rossi", contact_id: null, confirmed_at: "2026-11-01T10:00:00Z", is_personal_use: false };
  const base = { toggles: { A11: true }, bookings: [ab], contacts: [], inquiries: [], occasions: [], logs: [] };
  it("is listed with the other automations and translated", () => {
    expect(AUTOMATIONS.some(a => a.id === "A11")).toBe(true);
    for (const l of ["it", "en", "de"] as const) expect(MESSAGES.A11[l].body).toContain("{{nome_ospite}}");
  });
  it("fires 10 days before check-in only when documents are missing", () => {
    const now = new Date("2026-11-21T09:00:00Z");
    expect(computeDue({ ...base, now, missingDocs: new Set([booking.id]) }).map(d => `${d.automation}:${d.channel}`)).toEqual(["A11:email", "A11:whatsapp"]);
    expect(computeDue({ ...base, now, missingDocs: new Set() })).toEqual([]);
    expect(computeDue({ ...base, now: new Date("2026-11-15T09:00:00Z"), missingDocs: new Set([booking.id]) })).toEqual([]);
  });
});

describe("AI document reading", () => {
  it("normalises the model output and refuses incomplete data", () => {
    expect(normaliseExtracted({ first_name: " Mario ", last_name: "Rossi", document_number: "ya 123 4567", document_type: "Passport", birth_date: "1980-05-02", nationality: "ITA", confidence: "alta" }))
      .toEqual({ first_name: "Mario", last_name: "Rossi", document_number: "YA1234567", document_type: "passaporto", birth_date: "1980-05-02", nationality: "ITA", confidence: "alta" });
    expect(normaliseExtracted({ first_name: "Anna", last_name: "Bianchi", document_number: "CA00000AA", document_type: "carta d'identità", birth_date: "02/05/1980" })?.document_type).toBe("carta_identita");
    expect(normaliseExtracted({ first_name: "Anna", last_name: "", document_number: "X" })).toBeNull();
    expect(normaliseExtracted("nope")).toBeNull();
  });
});
