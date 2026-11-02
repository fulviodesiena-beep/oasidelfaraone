import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: () => new Promise(() => {}) }) } }));
import { saveInquiryWithin } from "@/lib/inquiries";
import { checkInReminderEmail, confirmationEmail, depositDue, thankYouEmail } from "@/lib/email-templates";

const b = { guest_name: "Anna <b>", check_in: "2026-12-01", check_out: "2026-12-08", total_nights: 7, total_price: 700, deposit_paid: 50 };

describe("inquiry save before WhatsApp", () => {
  it("gives up after 2 seconds when the database does not answer", async () => {
    vi.useFakeTimers();
    const p = saveInquiryWithin({ guest_name: "A", guest_email: "", guest_phone: "", check_in: "", check_out: "", adults: 2, children: 0, extras: [], message: "m" });
    await vi.advanceTimersByTimeAsync(2000);
    await expect(p).resolves.toBe(false);
    vi.useRealTimers();
  });
});

describe("email templates", () => {
  it("confirmation shows total and remaining deposit", () => {
    expect(depositDue(b)).toBe(160);
    const html = confirmationEmail(b);
    expect(html).toContain("700,00");
    expect(html).toContain("160,00");
    expect(html).not.toContain("<b>");
  });
  it("reminder links Mina's WhatsApp", () => {
    expect(checkInReminderEmail(b)).toContain("https://wa.me/393481804764");
    expect(checkInReminderEmail(b)).toContain("+39 348 180 4764");
  });
  it("thank-you invites a Google review", () => {
    expect(thankYouEmail(b)).toContain("recensione su Google");
  });
});
