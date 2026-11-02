import { confirmationEmail, getWhatsAppText, preArrivalEmail, thankYouEmail, type EmailBooking, type EmailTrigger } from "@/lib/email-templates";

export type ScheduledMessage = {
  trigger: EmailTrigger; code: string; name: string; channels: ("email" | "whatsapp")[];
  rule: string; date: string | null; email: ((b: EmailBooking) => string) | null;
};

function shift(d: string, days: number) {
  const x = new Date(`${d.slice(0, 10)}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + days);
  return x.toISOString().slice(0, 10);
}

export function messageSchedule(b: Pick<EmailBooking, "check_in" | "check_out">): ScheduledMessage[] {
  return [
    { trigger: "booking", code: "MSG1", name: "Conferma", channels: ["email", "whatsapp"], rule: "alla conferma", date: null, email: confirmationEmail },
    { trigger: "checkin_5", code: "MSG2", name: "Info Aeroporto (5gg prima)", channels: ["email", "whatsapp"], rule: "check-in −5", date: shift(b.check_in, -5), email: preArrivalEmail },
    { trigger: "checkin_day", code: "MSG3", name: "Giorno partenza", channels: ["whatsapp"], rule: "giorno check-in", date: shift(b.check_in, 0), email: null },
    { trigger: "checkout_3", code: "MSG4", name: "Ringraziamento", channels: ["email", "whatsapp"], rule: "check-out +3", date: shift(b.check_out, 3), email: thankYouEmail },
  ];
}

export function whatsappLink(phone: string | null | undefined, text: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export { getWhatsAppText };
