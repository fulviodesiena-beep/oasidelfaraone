// src/lib/email-templates.ts
// Template email ufficiali Oasi del Faraone — sostituire i placeholder {{...}} con i dati reali prima dell'invio

import { MINA_WHATSAPP } from "@/lib/site-data";

export type EmailBooking = {
  guest_name: string;
  check_in: string;
  check_out: string;
  total_nights?: number | null;
  total_price: number | string;
  deposit_paid: number | string;
  camera?: string;
  servizi?: string;
  delega_url?: string | null;
};

const CAMERA_DEFAULT = "Elisir d'Oriente 65135";
const MINA_DISPLAY = "+39 348 180 4764";
// TODO: sostituisci con il link reale da Google Business → https://business.google.com
const REVIEW_PLACEHOLDER = "https://g.page/r/oasidelfaraone";
// Finché il link resta quello segnaposto, la dashboard admin mostra un avviso giallo.
export const REVIEW_LINK_IS_PLACEHOLDER = REVIEW_PLACEHOLDER.includes("g.page/r/oasidelfaraone");
const COUPON_CODE = "ELISIR10";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const NAVY = "#0D1B2A", GOLD = "#C9922A", GOLD_LIGHT = "#E8C97A", TEXT = "#F0E8D8", MUTED = "#A89070";

function layout(title: string, body: string) {
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;background:${NAVY};font-family:Arial,sans-serif;color:${TEXT}">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY}"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#122030;border:1px solid ${GOLD}55">
<tr><td style="padding:32px 32px 16px;text-align:center;border-bottom:1px solid ${GOLD}33">
<div style="font-size:28px;color:${GOLD_LIGHT};font-style:italic">Oasi del Faraone</div>
<div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${MUTED};margin-top:6px">Elisir d'Oriente · Domina Coral Bay</div>
</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.7">${body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${GOLD}33;font-size:12px;color:${MUTED};text-align:center">
Fulvio · +39 334 732 8158 · prenotazionisharm@gmail.com
</td></tr>
</table></td></tr></table></body></html>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${GOLD};color:${NAVY};text-decoration:none;padding:12px 22px;font-weight:700;font-size:14px">${label}</a>`;

const pre = (text: string) =>
  `<div style="background:#0a1520;border-left:3px solid ${GOLD};padding:16px 20px;margin:16px 0;font-size:14px;line-height:1.75;white-space:pre-wrap">${esc(text)}</div>`;

const sep = () => `<hr style="border:none;border-top:1px solid ${GOLD}33;margin:20px 0">`;

// ─────────────────────────────────────────────
// MSG 1 — Conferma prenotazione
// trigger: booking confermata
// canali: email + whatsapp
// ─────────────────────────────────────────────
export function confirmationEmail(b: EmailBooking) {
  const camera = b.camera || CAMERA_DEFAULT;
  const servizi = b.servizi || "—";
  return layout("Prenotazione confermata", `
<p>Ciao <strong>${esc(b.guest_name)}</strong>! 🎉</p>
<p>La tua prenotazione è confermata. Siamo davvero felici di averti con noi e siamo certi che sarà un soggiorno che ricorderai a lungo! 🌊☀️</p>
${pre(`📅 Check-in: ${b.check_in}\n📅 Check-out: ${b.check_out}\n🌙 Durata: ${b.total_nights ?? "—"} notti\n🎁 Servizi prenotati: ${servizi}`)}
<p>Ti invieremo un secondo messaggio 5 giorni prima della partenza con tutte le istruzioni pratiche per il viaggio, l'aeroporto e l'arrivo in villaggio — così sarai pronto per tutto senza pensieri.</p>
${sep()}
<p><strong>⚠️ Una cosa importante da fare subito:</strong><br>
Controlla i tuoi documenti di viaggio. Se il tuo passaporto o la tua carta d'identità per l'espatrio presentano strappi, danni o segni evidenti di usura, ti consiglio vivamente di rinnovarli il prima possibile. In certi casi i controlli aeroportuali possono essere molto rigidi e un documento malridotto potrebbe impedirti di imbarcarti — e sarebbe davvero un peccato rovinare una vacanza così bella per una cosa che si può risolvere facilmente adesso! 😊</p>
${sep()}
<p>💡 <strong>Vuoi un transfer aeroporto → villaggio, escursioni o un punto di riferimento locale?</strong><br>
Ti presento <strong>Mina</strong>, il nostro referente egiziano di fiducia. È la persona a cui ci rivolgiamo noi stessi quando vogliamo vivere le esperienze più belle: dal Mar Rosso al deserto, dai mercati alle escursioni in jeep. Basta un messaggio e lui si organizza per te.</p>
<p>${btn(`https://wa.me/${MINA_WHATSAPP}`, `WhatsApp Mina · ${MINA_DISPLAY}`)}</p>
${b.delega_url ? `<p style="margin-top:20px">${btn(b.delega_url, "Scarica la delega Domina")}</p>` : ""}
<p style="margin-top:24px">A presto! 🌴<br><em>Fulvio — ${camera}, Domina Coral Bay, Sharm el Sheikh</em></p>`);
}

export const confirmationWhatsApp = (b: EmailBooking) => {
  const camera = b.camera || CAMERA_DEFAULT;
  const servizi = b.servizi || "—";
  return `Ciao ${b.guest_name}! 🎉

La tua prenotazione è confermata. Siamo davvero felici di averti con noi e siamo certi che sarà un soggiorno che ricorderai a lungo! 🌊☀️

📅 Check-in: ${b.check_in}
📅 Check-out: ${b.check_out}
🌙 Durata: ${b.total_nights ?? "—"} notti
🎁 Servizi prenotati: ${servizi}

Ti invieremo un secondo messaggio 5 giorni prima della partenza con tutte le istruzioni pratiche per il viaggio, l'aeroporto e l'arrivo in villaggio — così sarai pronto per tutto senza pensieri.

⚠️ Una cosa importante da fare subito:
Controlla i tuoi documenti di viaggio. Se il tuo passaporto o la tua carta d'identità per l'espatrio presentano strappi, danni o segni evidenti di usura, ti consiglio vivamente di rinnovarli il prima possibile.

💡 Hai bisogno di un transfer aeroporto → villaggio, vuoi organizzare delle escursioni o ti serve un punto di riferimento locale?
Ti presento Mina, il nostro referente egiziano di fiducia 👇
https://wa.me/${MINA_WHATSAPP}

Per qualsiasi cosa sono qui. A presto! 🌴
Fulvio — ${camera}, Domina Coral Bay, Sharm el Sheikh`;
};

// ─────────────────────────────────────────────
// MSG 2 — Info Documenti & Aeroporto (5gg prima)
// trigger: checkin -5 giorni
// canali: email + whatsapp
// allegati: scheda_gialla_it.jpg, scheda_gialla_ar.jpg, modulo_rosa_it.jpg, modulo_rosa_ar.jpg
// ─────────────────────────────────────────────
export function preArrivalEmail(b: EmailBooking) {
  const camera = b.camera || CAMERA_DEFAULT;
  return layout("Info importanti per il tuo arrivo a Sharm", `
<p>Ciao <strong>${esc(b.guest_name)}</strong>! 🏖️</p>
<p>Ci siamo quasi! Mancano 5 giorni e vogliamo che il tuo arrivo a Sharm sia fluido, senza intoppi e con zero stress. Quindi ecco tutto quello che devi sapere 👇</p>
${sep()}
<h2 style="color:${GOLD_LIGHT};font-size:16px">📄 DOCUMENTI ALL'AEROPORTO</h2>
<p>🟡 <strong>Scheda GIALLA — Carta d'identità (senza passaporto)</strong><br>
Se viaggi con la sola carta d'identità (valida per l'espatrio), all'arrivo a Sharm dovrai compilare una scheda di immigrazione di colore GIALLO — è di fatto il tuo visto d'ingresso.<br>
→ Porta con te <strong>1 fototessera</strong> per ogni persona in possesso solo di carta d'identità.<br>
→ Trovi le foto del documento allegate a questa email (fronte in arabo + fronte in italiano).</p>
<p>🟣 <strong>Modulo ROSA — Tutti i viaggiatori</strong><br>
C'è anche un modulo di arrivo di colore ROSA che va compilato da tutti i passeggeri.<br>
Di solito lo distribuiscono le compagnie aeree a bordo, poco prima dell'atterraggio. Se non dovesse arrivare durante il volo, lo trovi ai controlli passaporti.<br>
✏️ <strong>Porta una penna con te</strong> — ti servirà per compilare questi moduli.</p>
${sep()}
<h2 style="color:${GOLD_LIGHT};font-size:16px">⚠️ ATTENZIONE ALL'ARRIVO</h2>
<p>Appena scendi troverai una fila di persone con cartelline, nomi, loghi di tour operator. Creano un po' di caos e di solito ti indicano di seguirli verso destra per compilare i documenti al posto tuo — ovviamente a pagamento, tipo €5 a foglio.</p>
<p>💡 <strong>Il mio consiglio:</strong> ignorali con un sorriso, prosegui dritto e raggiungi i box della polizia locale — riconosci i poliziotti dalla divisa ufficiale. Consegni lì i moduli compilati e ti lasciano il visto. Semplice.</p>
<p>🕐 <strong>Soggiorni superiori a 15 giorni?</strong> Ricordati di acquistare il visto da $30 (circa €28) in uno sportello apposito prima dei box della polizia.</p>
${sep()}
<p><em>📷 Trovi le foto dei due documenti allegate a questa email — guardali prima di partire così non ti trovi impreparato.</em></p>
<p>A tra poco! 🌊<br><em>Fulvio — ${camera}, Domina Coral Bay, Sharm el Sheikh</em></p>`);
}

export const preArrivalWhatsApp = (b: EmailBooking) => {
  const camera = b.camera || CAMERA_DEFAULT;
  return `Ciao ${b.guest_name}! 🏖️

Ci siamo quasi! Mancano 5 giorni e vogliamo che il tuo arrivo a Sharm sia fluido, senza intoppi e con zero stress. Quindi ecco tutto quello che devi sapere 👇

━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTI ALL'AEROPORTO
━━━━━━━━━━━━━━━━━━━

🟡 Scheda GIALLA — Carta d'identità (senza passaporto)
Se viaggi con la sola carta d'identità (valida per l'espatrio), all'arrivo a Sharm dovrai compilare una scheda di immigrazione GIALLA.
→ Porta 1 fototessera per ogni persona con sola carta d'identità.
→ Ti mando qui sotto le foto dei documenti.

🟣 Modulo ROSA — Tutti i viaggiatori
Compilato da tutti. Di solito lo distribuisce la compagnia aerea a bordo.
✏️ Porta una penna con te.

━━━━━━━━━━━━━━━━━━━
⚠️ ATTENZIONE ALL'ARRIVO
━━━━━━━━━━━━━━━━━━━

Troverai persone con cartelline che ti chiederanno di seguirli per compilare documenti a pagamento (~€5 a foglio). Ignorali con un sorriso, prosegui dritto ai box della polizia in divisa ufficiale.

🕐 Soggiorni > 15 giorni: acquista visto da $30 nello sportello apposito prima dei box.

📷 Ti mando subito le foto dei documenti in allegato.

A tra poco! 🌊
Fulvio — ${camera}, Domina Coral Bay, Sharm el Sheikh`;
};

// ─────────────────────────────────────────────
// MSG 3 — Giorno della Partenza & Arrivo in Stanza
// trigger: checkin_day
// canali: whatsapp (solo)
// ─────────────────────────────────────────────
export const departureDayWhatsApp = (b: EmailBooking) => {
  const camera = b.camera || CAMERA_DEFAULT;
  return `Ciao ${b.guest_name}! ✈️

Oggi si parte — buon viaggio! 🎉

Ricordati delle indicazioni di 5 giorni fa per i documenti e l'aeroporto.

━━━━━━━━━━━━━━━━━━━
🏨 ARRIVO AL DOMINA CORAL BAY
━━━━━━━━━━━━━━━━━━━

🧳 Lascia pure le valigie nel piazzale del parcheggio accanto alla grande reception principale — ci pensano i ragazzi a portarle in camera con il taf taf.

Entra nella grande reception: ➡️ Dirigiti verso sinistra, come se andassi verso i bagni — è lì che trovi la reception degli appartamenti dei proprietari.

Chiedi della stanza 65135, dai il tuo nome e cognome e prepara i documenti.

💶 Se non hai già pagato le pulizie finali, ti verrà richiesto il pagamento in quel momento.

━━━━━━━━━━━━━━━━━━━
🏠 LA TUA STANZA — ELISIR 65135
━━━━━━━━━━━━━━━━━━━

Troverai:
✅ TV con telecomando
✅ Aria condizionata (interruttore a muro)
✅ Frigorifero
✅ Piccolo kit di benvenuto

🦟 La zanzariera per ora non c'è — ti consiglio di prendere qualche zampirone al bazar (da mettere fuori sul terrazzo). E tieni le aperture chiuse la sera.

💧 L'acqua: usa il rubinetto solo per lavarti, non per i denti o per berla. L'acqua in bottiglia la trovi in stanza.

━━━━━━━━━━━━━━━━━━━
🌍 IL VILLAGGIO
━━━━━━━━━━━━━━━━━━━

🍽️ 47 ristoranti | 🧖 Elisir Spa | 🎾 D Sports | 🤿 Diving Center | 🎭 Desert Arena | 🎰 Aladin Casinò

🛴 Per scooter elettrici, bici e monopattini: chiedi di MOOVY — la mobilità elettrica del Domina.

━━━━━━━━━━━━━━━━━━━

SEI IN VACANZA. RILASSATI. 🌊☀️

Per qualsiasi cosa sono qui.
Fulvio — ${camera}, Domina Coral Bay`;
};

// ─────────────────────────────────────────────
// MSG 4 — Arrivederci & Recensione (3gg dopo checkout)
// trigger: checkout +3 giorni
// canali: email + whatsapp
// ─────────────────────────────────────────────
export function thankYouEmail(b: EmailBooking) {
  const camera = b.camera || CAMERA_DEFAULT;
  return layout(`Come è andata? — ${camera}`, `
<p>Ciao <strong>${esc(b.guest_name)}</strong>! 👋</p>
<p>Speriamo che questi giorni a Sharm siano stati davvero speciali e che le nostre indicazioni ti abbiano reso tutto più semplice e piacevole.</p>
<p>Grazie di cuore per aver scelto <strong>${esc(camera)}</strong> — per noi non è solo un appartamento, è un posto che vogliamo condividere con persone che sanno apprezzarlo. E tu lo sei stato sicuramente. 🙏</p>
${sep()}
<p>🎁 <strong>Come ringraziamento, ecco un coupon del 10% di sconto sulla tua prossima prenotazione:</strong></p>
${pre(`Codice: ${COUPON_CODE}\nBasta comunicarcelo al momento della prossima prenotazione e lo scaleremo subito dal totale.`)}
${sep()}
<p>⭐ <strong>Un piccolo favore:</strong><br>
Lasciaci una recensione su come è stata la tua esperienza con noi. Non importa che sia lunga o elaborata — anche solo qualche riga sincera ci aiuta enormemente.</p>
<p>${btn(REVIEW_PLACEHOLDER, "Lascia una recensione su Google")}</p>
<p style="margin-top:24px">Grazie davvero. A presto — magari già il prossimo anno! 🌊☀️<br>
<em>Fulvio — ${camera}, Domina Coral Bay, Sharm el Sheikh</em></p>`);
}

export const thankYouWhatsApp = (b: EmailBooking) => {
  const camera = b.camera || CAMERA_DEFAULT;
  return `Ciao ${b.guest_name}! 👋

Speriamo che questi giorni a Sharm siano stati davvero speciali e che le nostre indicazioni ti abbiano reso tutto più semplice e piacevole.

Grazie di cuore per aver scelto ${camera} — per noi non è solo un appartamento, è un posto che vogliamo condividere con persone che sanno apprezzarlo. E tu lo sei stato sicuramente. 🙏

🎁 Come ringraziamento, ecco un coupon del 10% di sconto sulla tua prossima prenotazione:
👉 Codice: ${COUPON_CODE}
Basta comunicarcelo al momento della prossima prenotazione e lo scaleremo subito dal totale.

━━━━━━━━━━━━━━━━━━━
⭐ UN PICCOLO FAVORE
━━━━━━━━━━━━━━━━━━━

Lasciaci una recensione — anche solo qualche riga sincera ci aiuta enormemente:

👉 Clicca sul link qui sotto: si apre la scheda Google dell'Oasi del Faraone.
${REVIEW_PLACEHOLDER}

📝 Lì in alto trovi le stelle: toccale (5 se ti sei trovato bene) e scrivi anche solo due righe di commento. Ci vuole meno di un minuto.

Grazie davvero. A presto — magari già il prossimo anno! 🌊☀️
Fulvio — ${camera}, Domina Coral Bay, Sharm el Sheikh`;
};

// ─────────────────────────────────────────────
// Helper: genera testo WhatsApp per tutti i trigger
// ─────────────────────────────────────────────
export type EmailTrigger = "booking" | "checkin_5" | "checkin_day" | "checkout_3";

export function getWhatsAppText(trigger: EmailTrigger, b: EmailBooking): string {
  switch (trigger) {
    case "booking":     return confirmationWhatsApp(b);
    case "checkin_5":   return preArrivalWhatsApp(b);
    case "checkin_day": return departureDayWhatsApp(b);
    case "checkout_3":  return thankYouWhatsApp(b);
  }
}

// Allegati da inviare con MSG 2 (file da caricare su Supabase Storage)
export const MSG2_ATTACHMENTS = [
  { key: "scheda_gialla_it", label: "Scheda Gialla (italiano)" },
  { key: "scheda_gialla_ar", label: "Scheda Gialla (arabo)" },
  { key: "modulo_rosa_it",   label: "Modulo Rosa (italiano)" },
  { key: "modulo_rosa_ar",   label: "Modulo Rosa (arabo)" },
];
