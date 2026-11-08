import { createFileRoute } from "@tanstack/react-router";
import { OWNER_EMAIL } from "@/lib/site-data";

const TITLE = "Informativa privacy e cookie | Oasi del Faraone";
const DESC = "Come Oasi del Faraone tratta i dati delle richieste di soggiorno e i cookie di misurazione.";
export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE }, { name: "description", content: DESC },
      { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
      { property: "og:type", content: "article" }, { property: "og:url", content: "https://oasidelfaraone.it/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://oasidelfaraone.it/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return <main className="site-section"><div className="site-container max-w-3xl space-y-5 text-sm leading-relaxed">
    <a href="/" className="text-gold-light">← Torna al sito</a>
    <h1 className="font-display text-5xl">Informativa privacy e cookie</h1>
    <h2 className="font-display text-2xl">Titolare</h2>
    <p>Fulvio De Siena — Oasi del Faraone, Domina Coral Bay, Sharm el-Sheikh. Contatto: <a className="underline" href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>.</p>
    <h2 className="font-display text-2xl">Dati delle richieste</h2>
    <p>Quando invii una richiesta di soggiorno salviamo nome, telefono, email, date, ospiti, extra e messaggio, insieme alla pagina di provenienza e agli eventuali parametri di campagna (utm). Li usiamo solo per rispondere alla richiesta e gestire la prenotazione (base giuridica: misure precontrattuali). Se acconsenti alle comunicazioni promozionali, potremo scriverti offerte; puoi revocare il consenso in qualsiasi momento.</p>
    <h2 className="font-display text-2xl">Cookie</h2>
    <p>Il sito usa solo memorizzazione tecnica necessaria. Il Meta Pixel (Meta Platforms) viene caricato soltanto se accetti dal banner; se rifiuti non viene caricato nessuno script di misurazione. Per cambiare scelta cancella i dati del sito dal browser.</p>
    <h2 className="font-display text-2xl">Diritti</h2>
    <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione o opposizione scrivendo all’email sopra, e proporre reclamo al Garante per la protezione dei dati personali.</p>
  </div></main>;
}
