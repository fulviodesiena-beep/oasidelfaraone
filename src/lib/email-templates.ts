// Italian HTML email templates (inline styles for email clients). Sending via Resend is configured later.
import { MINA_WHATSAPP } from "@/lib/site-data";

export type EmailBooking = {
  guest_name: string; check_in: string; check_out: string;
  total_nights?: number | null; total_price: number | string; deposit_paid: number | string;
  delega_url?: string | null;
};

export const DEPOSIT_RATE = 0.3; // suggested deposit share when nothing has been paid yet
const NAVY = "#0D1B2A", NAVY2 = "#122030", GOLD = "#C9922A", GOLD_LIGHT = "#E8C97A", TEXT = "#F0E8D8", MUTED = "#A89070";
const MINA_DISPLAY = "+39 348 180 4764";
const REVIEW_URL = "https://www.google.com/search?q=Oasi+del+Faraone+Elisir+d%27Oriente+recensioni";

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const eur = (n: number | string) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(n));
const day = (s: string) => new Date(`${s.slice(0, 10)}T12:00:00`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Deposit still to pay: 30% of total minus what was already received, never below 0. */
export function depositDue(b: Pick<EmailBooking, "total_price" | "deposit_paid">) {
  return Math.max(0, Math.round((Number(b.total_price) * DEPOSIT_RATE - Number(b.deposit_paid)) * 100) / 100);
}

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${GOLD};color:${NAVY};text-decoration:none;padding:12px 22px;font-family:Inter,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:.04em">${label}</a>`;
const row = (k: string, v: string) =>
  `<tr><td style="padding:8px 0;color:${MUTED};font-size:13px">${k}</td><td style="padding:8px 0;text-align:right;color:${TEXT};font-size:14px">${v}</td></tr>`;

function layout(title: string, body: string) {
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:${NAVY};font-family:Inter,Arial,sans-serif;color:${TEXT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${NAVY2};border:1px solid ${GOLD}55">
<tr><td style="padding:32px 32px 16px;text-align:center;border-bottom:1px solid ${GOLD}33">
<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;color:${GOLD_LIGHT}">Oasi del Faraone</div>
<div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${MUTED};margin-top:6px">Elisir d'Oriente · Domina Coral Bay</div></td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.65">${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${GOLD}33;font-size:12px;color:${MUTED};text-align:center">Fulvio De Siena · +39 334 732 8158 · prenotazionisharm@gmail.com</td></tr>
</table></td></tr></table></body></html>`;
}

const h1 = (t: string) => `<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:28px;color:${TEXT};margin:0 0 16px">${t}</h1>`;

export function confirmationEmail(b: EmailBooking) {
  const name = esc(b.guest_name);
  const due = depositDue(b);
  return layout("Prenotazione confermata", `${h1(`Benvenuto, ${name}`)}
<p>La tua prenotazione all'Oasi del Faraone è confermata. Ecco il riepilogo:</p>
<table role="presentation" width="100%" style="border-collapse:collapse;margin:16px 0">
${row("Arrivo", `${day(b.check_in)} · dalle 15:00`)}${row("Partenza", `${day(b.check_out)} · entro le 11:00`)}
${b.total_nights ? row("Notti", String(b.total_nights)) : ""}${row("Importo totale", eur(b.total_price))}
${row("Caparra ricevuta", eur(b.deposit_paid))}${row("Caparra da versare", `<strong style="color:${GOLD_LIGHT}">${eur(due)}</strong>`)}</table>
<h2 style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:${GOLD_LIGHT};margin:24px 0 8px">Regole dell'appartamento</h2>
<ul style="padding-left:18px;margin:0;color:${TEXT}"><li>Massimo 4 ospiti.</li><li>Check-in dalle 15:00, check-out entro le 11:00.</li>
<li>Formula senza all-inclusive; SPA e casinò a pagamento (SPA non accessibile ai bambini).</li><li>Si prega di rispettare la quiete degli altri ospiti del villaggio.</li></ul>
${b.delega_url ? `<p style="margin-top:20px">${button(b.delega_url, "Scarica la delega Domina")}</p>` : `<p style="color:${MUTED};font-size:13px">La delega per la reception Domina ti verrà inviata prima dell'arrivo.</p>`}
<p style="margin-top:24px">Per escursioni ed esperienze scrivi a Mina, il nostro fidato amico sul posto:</p>
<p>${button(`https://wa.me/${MINA_WHATSAPP}`, `WhatsApp Mina · ${MINA_DISPLAY}`)}</p>`);
}

export function checkInReminderEmail(b: EmailBooking) {
  return layout("Il tuo arrivo è vicino", `${h1(`Tra due giorni sei qui, ${esc(b.guest_name)}`)}
<p>Ti aspettiamo <strong>${day(b.check_in)}</strong>. Qualche indicazione per arrivare sereno:</p>
<table role="presentation" width="100%" style="border-collapse:collapse;margin:16px 0">
${row("Check-in", "dalle 15:00")}${row("Check-out", `${day(b.check_out)} entro le 11:00`)}</table>
<h2 style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:${GOLD_LIGHT};margin:24px 0 8px">Accesso</h2>
<p>Presentati alla reception del Domina Coral Bay con un documento d'identità e la delega che ti abbiamo inviato. Lo staff ti indicherà l'appartamento Elisir d'Oriente.</p>
<p>Per transfer, escursioni o qualsiasi necessità sul posto contatta Mina su WhatsApp:</p>
<p>${button(`https://wa.me/${MINA_WHATSAPP}`, `WhatsApp Mina · ${MINA_DISPLAY}`)}</p>`);
}

export function thankYouEmail(b: EmailBooking) {
  return layout("Grazie per il tuo soggiorno", `${h1(`Grazie, ${esc(b.guest_name)}`)}
<p>È stato un piacere ospitarti all'Oasi del Faraone. Speriamo che il Mar Rosso ti abbia lasciato ricordi luminosi.</p>
<p>Se ti sei trovato bene, una tua recensione su Google ci aiuta tantissimo: bastano due minuti.</p>
<p style="margin:24px 0">${button(REVIEW_URL, "Lascia una recensione su Google")}</p>
<p style="color:${MUTED}">Ti aspettiamo di nuovo: per il prossimo soggiorno scrivici direttamente, senza intermediari.</p>`);
}
