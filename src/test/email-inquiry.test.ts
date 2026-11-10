import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: () => new Promise(() => {}) }) } }));
import { saveInquiryWithin } from "@/lib/inquiries";
import { reviewLinkMissing, confirmationEmail, thankYouEmail, departureDayWhatsApp, getWhatsAppText, preArrivalEmail, thankYouWhatsApp } from "@/lib/email-templates";
import { messageSchedule, whatsappLink } from "@/lib/communications";

const b = { guest_name: "Anna <b>", check_in: "2026-12-01", check_out: "2026-12-08", total_nights: 7, total_price: 700, deposit_paid: 50 };

describe("inquiry save before WhatsApp", () => {
  it("gives up after 2 seconds when the database does not answer", async () => {
    vi.useFakeTimers();
    const p = saveInquiryWithin({ guest_name: "A", guest_email: "", guest_phone: "", check_in: "", check_out: "", adults: 2, children: 0, extras: [], message: "m", consent_privacy: true, consent_marketing: false });
    await vi.advanceTimersByTimeAsync(2000);
    await expect(p).resolves.toBe(false);
    vi.useRealTimers();
  });
});

describe("email templates", () => {
  it("confirmation escapes the guest name and links Mina", () => {
    const html = confirmationEmail(b);
    expect(html).not.toContain("<b>");
    expect(html).toContain("https://wa.me/393481804764");
  });
  it("pre-arrival explains the yellow card", () => {
    expect(preArrivalEmail(b)).toContain("Scheda GIALLA");
  });
  it("departure day names room 65135 and MOOVY", () => {
    expect(departureDayWhatsApp(b)).toContain("65135");
    expect(departureDayWhatsApp(b)).toContain("MOOVY");
  });
  it("thank-you WhatsApp carries the coupon", () => {
    expect(thankYouWhatsApp(b)).toContain("ELISIR10");
  });
  it("thank-you messages use settings.review_url (Facebook reviews page)", () => {
    const url = "https://www.facebook.com/oasidelfaraone/reviews";
    const t = thankYouWhatsApp({ ...b, review_url: url });
    expect(t).toContain("Lasciaci una recensione");
    expect(t.indexOf("Clicca sul link qui sotto")).toBeLessThan(t.indexOf(url));
    expect(thankYouEmail({ ...b, review_url: url })).toContain(url);
    expect(t).not.toContain("g.page");
  });
  it("without review_url no placeholder link is sent", () => {
    expect(thankYouWhatsApp(b)).not.toMatch(/https?:\/\/(g\.page|www\.facebook)/);
    expect(thankYouEmail(b)).not.toContain("g.page");
  });
  it("admin warning appears only when review_url is empty", () => {
    expect(reviewLinkMissing(null)).toBe(true);
    expect(reviewLinkMissing("  ")).toBe(true);
    expect(reviewLinkMissing("https://www.facebook.com/oasidelfaraone/reviews")).toBe(false);
  });
  it("getWhatsAppText routes checkin_day", () => {
    expect(getWhatsAppText("checkin_day", b)).toContain("65135");
  });
});

describe("communications schedule", () => {
  it("computes trigger dates: check-in -5 and check-out +3", () => {
    const s = messageSchedule(b);
    expect(s.find(m => m.trigger === "checkin_5")?.date).toBe("2026-11-26");
    expect(s.find(m => m.trigger === "checkin_day")?.date).toBe("2026-12-01");
    expect(s.find(m => m.trigger === "checkout_3")?.date).toBe("2026-12-11");
  });
  it("whatsapp link uses guest phone digits", () => {
    expect(whatsappLink("+39 333 123", "ciao")).toBe("https://wa.me/39333123?text=ciao");
  });
});
