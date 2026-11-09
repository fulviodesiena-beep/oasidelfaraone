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
    <p>Quando invii una richiesta di soggiorno salviamo nome, telefono, email, date, ospiti, extra, eventuali date speciali e messaggio, insieme alla pagina di provenienza e agli eventuali parametri di campagna (utm). Conserviamo un’unica scheda contatto per persona, così da non duplicare i tuoi dati.</p>
    <h2 className="font-display text-2xl">Finalità e base giuridica</h2>
    <ul className="list-disc space-y-2 pl-5">
      <li><strong>Gestione della richiesta e del soggiorno</strong> — rispondere, prenotare e preparare la delega di accesso che il resort Domina Coral Bay richiede al titolare dell’unità: per questo comunichiamo al resort nomi, numeri di documento, date e contatti dei viaggiatori. Base giuridica: misure precontrattuali ed esecuzione del contratto.</li>
      <li><strong>Marketing</strong> — offerte e novità, solo se spunti la casella dedicata. Base giuridica: consenso.</li>
      <li><strong>Ricorrenze</strong> — offerte personalizzate in occasione di compleanni e anniversari tuoi e dei tuoi compagni di viaggio (date che ci indichi o ricavate dai documenti del soggiorno), solo se spunti la casella dedicata. Base giuridica: consenso.</li>
    </ul>
    <p>I consensi sono facoltativi e separati: puoi revocarli in qualsiasi momento scrivendo all’email sopra, senza conseguenze sulla prenotazione.</p>
    <h2 className="font-display text-2xl">Cookie</h2>
    <p>Il sito usa solo memorizzazione tecnica necessaria. Il Meta Pixel (Meta Platforms) viene caricato soltanto se accetti dal banner; se rifiuti non viene caricato nessuno script di misurazione. Per cambiare scelta cancella i dati del sito dal browser.</p>
    <h2 className="font-display text-2xl">Diritti</h2>
    <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione o opposizione scrivendo all’email sopra, e proporre reclamo al Garante per la protezione dei dati personali.</p>
  </div></main>;
}
