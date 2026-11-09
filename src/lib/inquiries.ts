import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/tracking";

export type InquiryInput = {
  guest_name: string; guest_email: string; guest_phone: string;
  check_in: string; check_out: string; adults: number; children: number;
  extras: string[]; message: string;
  consent_privacy: boolean; consent_marketing: boolean;
  special_dates?: string; consent_occasions?: boolean;
};

export const SAVE_TIMEOUT_MS = 2000;

/** Waits for the save at most `ms`; resolves false on timeout so WhatsApp is never blocked. */
export function saveInquiryWithin(i: InquiryInput, ms = SAVE_TIMEOUT_MS): Promise<boolean> {
  return Promise.race([saveInquiry(i), new Promise<boolean>(r => setTimeout(() => r(false), ms))]);
}

/** Saves a website booking request before WhatsApp opens. Never throws: WhatsApp must still open. */
export async function saveInquiry(i: InquiryInput): Promise<boolean> {
  try {
    const { error } = await supabase.from("inquiries").insert({
      guest_name: i.guest_name.trim().slice(0, 200) || "Ospite",
      guest_email: i.guest_email.trim() || null,
      guest_phone: i.guest_phone.trim() || null,
      check_in: i.check_in || null,
      check_out: i.check_out || null,
      adults: i.adults,
      children: i.children,
      extras: i.extras,
      message: i.message.slice(0, 4000),
      status: "new",
      source_url: typeof window !== "undefined" ? window.location.href : null,
      consent_privacy: i.consent_privacy,
      consent_marketing: i.consent_marketing,
      special_dates: i.special_dates?.trim().slice(0, 500) || null,
      consent_occasions: !!i.consent_occasions,
      ...getAttribution(),
    });
    if (error) console.error("Inquiry not saved", error.message);
    return !error;
  } catch (e) {
    console.error("Inquiry not saved", e);
    return false;
  }
}
