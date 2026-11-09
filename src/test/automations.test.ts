import { describe, expect, it } from "vitest";
import { computeDue, dedupKey, messageText, pickLang, type ABooking, type AContact, type ALog } from "@/lib/automations/engine";
import { LANGS, MESSAGES } from "@/lib/automations/messages";
import { containsPrice, newsletterSections } from "@/lib/automations/newsletter";
import { signToken, verifyToken } from "@/lib/automations/tokens";

const ALL = { A1: true, A2: true, A3: true, A4: true, A5: true, A6: true, A7: true, A8: true, A9: true, A10: true };
const contact = (p: Partial<AContact> = {}): AContact => ({ id: "c1", first_name: "Maria", email: "m@x.it", phone: "+393331112222", language: "it", status: "cliente", consent_occasions: false, consent_marketing: false, unsubscribed_at: null, newsletter_status: "none", ...p });
const booking = (p: Partial<ABooking> = {}): ABooking => ({ id: "b1", status: "confirmed", check_in: "2026-12-10", check_out: "2026-12-17", total_nights: 7, extras: [], guest_name: "Maria Rossi", guest_email: "m@x.it", guest_phone: null, contact_id: "c1", confirmed_at: null, payment_verified_at: "2026-11-01T10:00:00Z", deposit_paid: 0, total_price: 700, is_personal_use: false, ...p });
const run = (date: string, o: { bookings?: ABooking[]; contacts?: AContact[]; logs?: ALog[]; toggles?: object; inquiries?: any[]; occasions?: any[] } = {}) =>
  computeDue({ now: new Date(`${date}T10:00:00Z`), toggles: o.toggles ?? ALL, bookings: o.bookings ?? [booking()], contacts: o.contacts ?? [contact()], inquiries: o.inquiries ?? [], occasions: o.occasions ?? [], logs: o.logs ?? [] });
const ids = (d: ReturnType<typeof run>) => d.map(x => `${x.automation}${x.step ? ":" + x.step : ""}/${x.channel}`).sort();

describe("automation windows", () => {
  it("all automations stay off by default", () => { expect(run("2026-12-05", { toggles: {} })).toEqual([]); });
  it("A1 fires only for bookings confirmed after the feature (confirmed_at set) and paid", () => {
    expect(ids(run("2026-11-02", { bookings: [booking({ confirmed_at: "2026-11-02T08:00:00Z" })] }))).toEqual(["A1/email", "A1/whatsapp"]);
    expect(run("2026-11-02", { bookings: [booking({ confirmed_at: null })] })).toEqual([]);
    expect(run("2026-11-02", { bookings: [booking({ confirmed_at: "2026-11-02T08:00:00Z", payment_verified_at: null, deposit_paid: 100 })] })).toEqual([]);
  });
  it("A2 five days before check-in, A3 on check-in day, A4 on day two", () => {
    expect(ids(run("2026-12-05"))).toEqual(["A2/email", "A2/whatsapp"]);
    expect(ids(run("2026-12-10"))).toEqual(["A3/whatsapp"]);
    expect(ids(run("2026-12-11"))).toEqual(["A4/whatsapp"]);
    expect(run("2026-12-04")).toEqual([]);
  });
  it("A5 the day after check-out, A6 social three days after", () => {
    expect(ids(run("2026-12-18"))).toEqual(["A5/email", "A5/whatsapp"]);
    expect(ids(run("2026-12-20"))).toEqual(["A6:post/email"]);
  });
  it("A5 reminder only when the first email was sent and its link not clicked", () => {
    const sent: ALog = { dedup_key: dedupKey("A5", "", "email", "b1"), automation: "A5", booking_id: "b1", step: "", channel: "email", status: "sent", clicked_at: null };
    expect(ids(run("2026-12-23", { logs: [sent] }))).toEqual(["A5:promemoria/email"]);
    expect(run("2026-12-23", { logs: [{ ...sent, clicked_at: "2026-12-19T09:00:00Z" }] })).toEqual([]);
  });
  it("old stays never trigger after the grace window", () => { expect(run("2026-12-25")).toEqual([]); });
  it("personal-use and cancelled bookings are ignored", () => {
    expect(run("2026-12-05", { bookings: [booking({ is_personal_use: true })] })).toEqual([]);
    expect(run("2026-12-05", { bookings: [booking({ status: "cancelled" })] })).toEqual([]);
  });
});

describe("dedup", () => {
  it("an automation already logged for the same booking is never due again", () => {
    const logs: ALog[] = ["email", "whatsapp"].map(ch => ({ dedup_key: dedupKey("A2", "", ch, "b1"), automation: "A2", booking_id: "b1", step: "", channel: ch, status: "sent", clicked_at: null }));
    expect(run("2026-12-05", { logs })).toEqual([]);
  });
  it("dedup keys are unique per automation, step, channel and reference", () => {
    const d = run("2026-12-05"); expect(new Set(d.map(x => x.dedupKey)).size).toBe(d.length);
  });
});

describe("consents", () => {
  const occ = [{ id: "o1", contact_id: "c1", kind: "compleanno", day: 10, month: 4 }];
  it("A7 requires the occasions consent and no unsubscribe", () => {
    expect(run("2026-12-11", { occasions: occ, bookings: [] })).toEqual([]);
    expect(ids(run("2026-12-11", { occasions: occ, bookings: [], contacts: [contact({ consent_occasions: true })] }))).toEqual(["A7:d120/brevo"]);
    expect(run("2026-12-11", { occasions: occ, bookings: [], contacts: [contact({ consent_occasions: true, unsubscribed_at: "2026-10-01" })] })).toEqual([]);
  });
  it("A7 reminder 90 days before", () => {
    expect(ids(run("2027-01-10", { occasions: occ, bookings: [], contacts: [contact({ consent_occasions: true })] }))).toEqual(["A7:d90/brevo"]);
  });
  it("A9 soft opt-in: past clients only, stops at once on unsubscribe", () => {
    const b = booking({ check_in: "2026-01-03", check_out: "2026-01-10" });
    expect(ids(run("2026-12-11", { bookings: [b] }))).toEqual(["A9/brevo"]);
    expect(run("2026-12-11", { bookings: [b], contacts: [contact({ status: "lead" })] })).toEqual([]);
    expect(run("2026-12-11", { bookings: [b], contacts: [contact({ unsubscribed_at: "2026-12-01" })] })).toEqual([]);
  });
  it("A8 follows up an unconverted request at 2 and 7 days, then stops", () => {
    const q = { id: "q1", created_at: "2026-12-01T09:00:00Z", guest_name: "Luca", guest_email: "l@x.it", contact_id: "c9", status: "new", language: "en" };
    expect(ids(run("2026-12-03", { bookings: [], inquiries: [q] }))).toEqual(["A8:d2/email"]);
    expect(ids(run("2026-12-08", { bookings: [], inquiries: [q] }))).toEqual(["A8:d7/email"]);
    expect(run("2026-12-12", { bookings: [], inquiries: [q] })).toEqual([]);
    expect(run("2026-12-03", { bookings: [booking({ contact_id: "c9" })], inquiries: [q] }).filter(x => x.automation === "A8")).toEqual([]);
    expect(run("2026-12-03", { bookings: [], inquiries: [q] })[0].lang).toBe("en");
  });
});

describe("language and content", () => {
  it("every message exists in it/en/de", () => { for (const m of Object.values(MESSAGES)) for (const l of LANGS) expect(m[l].body.length).toBeGreaterThan(20); });
  it("template language follows the contact, default Italian", () => {
    expect(pickLang("de")).toBe("de"); expect(pickLang(null)).toBe("it"); expect(pickLang("ru")).toBe("it");
    expect(run("2026-12-05", { contacts: [contact({ language: "de" })] })[0].lang).toBe("de");
    expect(messageText("A1", "de", { nome_ospite: "Anna" }).body).toContain("Hallo Anna");
  });
  it("A2 always ends with the viaggiaresicuri.it check, even when edited", () => {
    expect(messageText("A2", "it", {}).body).toContain("viaggiaresicuri.it");
    expect(messageText("A2", "it", {}, { A2: { it: "Testo nuovo" } }).body).toMatch(/Testo nuovo[\s\S]*viaggiaresicuri\.it/);
  });
  it("MSG3 has the pool-view balcony, never direct pool access", () => {
    for (const l of LANGS) expect(MESSAGES.A3[l].body).not.toMatch(/accesso diretto|direct access|direkter Zugang/i);
    expect(MESSAGES.A3.it.body).toContain("con balcone vista piscina, a pochi passi dalla piscina dell'Elisir");
  });
  it("coupon is not conditional on the review", () => {
    for (const l of LANGS) { const b = MESSAGES.A5[l].body; expect(b.indexOf("ELISIR10")).toBeLessThan(b.search(/recensione|review|Bewertung/i)); }
    expect(MESSAGES.A5.it.body).toContain("a prescindere");
  });
  it("marketing messages (A7, A9, newsletter #1) contain no prices", () => {
    for (const k of ["A7", "A9"] as const) for (const l of LANGS) expect(containsPrice(MESSAGES[k][l].body + MESSAGES[k][l].subject)).toBe(false);
    expect(containsPrice("Elisir d'Oriente: 60 m², balcone vista piscina, un unico prezzo")).toBe(false);
    expect(containsPrice("da 80 € a notte")).toBe(true);
    expect(newsletterSections({ cartolina: "x", firma: "Fulvio" })).toHaveLength(2);
  });
});

describe("unsubscribe tokens", () => {
  it("valid token returns the contact, tampered or wrong purpose is rejected", async () => {
    const t = await signToken("unsub", "c1", "secret-123");
    expect(await verifyToken("unsub", t, "secret-123")).toBe("c1");
    expect(await verifyToken("nl-confirm", t, "secret-123")).toBeNull();
    expect(await verifyToken("unsub", t, "other")).toBeNull();
    expect(await verifyToken("unsub", t.slice(0, -2) + "xx", "secret-123")).toBeNull();
  });
});
