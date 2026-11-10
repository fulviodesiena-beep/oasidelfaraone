import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: () => Promise.resolve({ error: null }) }) } }));
import { DELEGA_UPLOADER, delegaSetupError, delegaSetupMissing } from "@/lib/delega";
import { delegaErrorMessage } from "@/components/admin/BookingTravelers";
import { requestNewsletterIfConsented } from "@/lib/inquiries";

const settings = { holder_name: "Carmine Esposito", holder_passport: "YD1421286", unit_number: "65135", holder_phone: "+39", domina_email: "x@y.it" };
const img = new Uint8Array([1]);

describe("delega Domina — salvataggio", () => {
  it("uses an uploader accepted by documents.uploaded_by (owner|guest), not 'system'", () => {
    expect(["owner", "guest"]).toContain(DELEGA_UPLOADER);
  });
  it("nothing missing when holder, unit, header and signature are set", () => {
    expect(delegaSetupMissing(settings, { header: img, signature: img })).toEqual([]);
  });
  it("names the missing header/signature/holder so the admin sees a clear error", () => {
    const m = delegaSetupMissing({ ...settings, holder_passport: " " }, { header: null, signature: img });
    expect(m).toEqual(["passaporto del titolare", "header Domina (header.png)"]);
    expect(delegaSetupError(m)).toContain("Impostazioni");
  });
  it("never shows an empty error message", () => {
    expect(delegaErrorMessage(new Error("Delega: salvataggio documento non riuscito (x)"))).toBe("Delega: salvataggio documento non riuscito (x)");
    expect(delegaErrorMessage({})).toMatch(/Errore sconosciuto/);
    expect(delegaErrorMessage(new Error(""))).toMatch(/Errore sconosciuto/);
  });
});

describe("modulo prenotazione — offerte e novità", () => {
  it("checked box starts the newsletter double opt-in with the guest language", () => {
    const subscribe = vi.fn().mockResolvedValue({ ok: true });
    expect(requestNewsletterIfConsented({ consent_marketing: true, guest_email: " anna@example.com ", language: "de" }, subscribe)).toBe(true);
    expect(subscribe).toHaveBeenCalledWith({ data: { email: "anna@example.com", lang: "de", consent: true } });
  });
  it("unchecked box sends nothing", () => {
    const subscribe = vi.fn().mockResolvedValue({ ok: true });
    expect(requestNewsletterIfConsented({ consent_marketing: false, guest_email: "anna@example.com" }, subscribe)).toBe(false);
    expect(subscribe).not.toHaveBeenCalled();
  });
  it("a failing subscription never throws (WhatsApp must still open)", async () => {
    const subscribe = vi.fn().mockRejectedValue(new Error("down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => requestNewsletterIfConsented({ consent_marketing: true, guest_email: "a@b.it" }, subscribe)).not.toThrow();
    await new Promise(r => setTimeout(r, 0));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
