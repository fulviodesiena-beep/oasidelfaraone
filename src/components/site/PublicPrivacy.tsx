import { OWNER_EMAIL } from "@/lib/site-data";
import { LanguageProvider, useLanguage, publicPath, type Language } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { FloatingActions } from "./FloatingActions";
export function PublicPrivacy({ language = "it" }: { language?: Language }) { return <LanguageProvider language={language}><Privacy /></LanguageProvider>; }
function Privacy() {
 const { t, language } = useLanguage();
  return <main className="site-section"><div className="site-container max-w-3xl space-y-5 text-sm leading-relaxed">
    <a href={publicPath(language)} className="text-gold-light">{t("← Torna al sito")}</a>
    <div className="flex justify-end"><LanguageSelector page="privacy" /></div>
    <h1 className="font-display text-5xl">{t("Informativa privacy e cookie")}</h1>
    <h2 className="font-display text-2xl">{t("Titolare")}</h2>
    <p>{t("Fulvio De Siena — Oasi del Faraone, Domina Coral Bay, Sharm el-Sheikh. Contatto:")} <a className="underline" href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>{t(".")}</p>
    <h2 className="font-display text-2xl">{t("Dati delle richieste")}</h2>
    <p>{t("Quando invii una richiesta di soggiorno salviamo nome, telefono, email, date, ospiti, extra, eventuali date speciali e messaggio, insieme alla pagina di provenienza e agli eventuali parametri di campagna (utm). Conserviamo un’unica scheda contatto per persona, così da non duplicare i tuoi dati.")}</p>
    <h2 className="font-display text-2xl">{t("Finalità e base giuridica")}</h2>
    <ul className="list-disc space-y-2 pl-5">
      <li><strong>{t("Gestione della richiesta e del soggiorno")}</strong> {t("— rispondere, prenotare e preparare la delega di accesso che il resort Domina Coral Bay richiede al titolare dell’unità: per questo comunichiamo al resort nomi, numeri di documento, date e contatti dei viaggiatori. Base giuridica: misure precontrattuali ed esecuzione del contratto.")}</li>
      <li><strong>{t("Marketing")}</strong> {t("— offerte e novità, solo se spunti la casella dedicata. Base giuridica: consenso.")}</li>
      <li><strong>{t("Ricorrenze")}</strong> {t("— offerte personalizzate in occasione di compleanni e anniversari tuoi e dei tuoi compagni di viaggio (date che ci indichi o ricavate dai documenti del soggiorno), solo se spunti la casella dedicata. Base giuridica: consenso.")}</li>
    </ul>
    <p>{t("I consensi sono facoltativi e separati: puoi revocarli in qualsiasi momento scrivendo all’email sopra, senza conseguenze sulla prenotazione.")}</p>
    <h2 className="font-display text-2xl">{t("Newsletter ed email")}</h2>
    <p>{t("Lettere dall’Oasi si riceve solo dopo aver confermato l’iscrizione dal link che ti inviamo (doppio consenso); registriamo data, fonte e indirizzo IP della conferma. Agli ospiti che hanno già soggiornato possiamo inviare, per servizi analoghi, un messaggio un anno dopo il soggiorno, con possibilità di opporsi subito. Le email promozionali sono inviate tramite Brevo (Sendinblue SAS, Francia), che tratta i dati per nostro conto; le email sul soggiorno tramite il servizio email del sito. Ogni email promozionale contiene un link per disiscriversi con un clic.")}</p>
    <h2 className="font-display text-2xl">{t("Cookie")}</h2>
    <p>{t("Il sito usa solo memorizzazione tecnica necessaria. Il Meta Pixel (Meta Platforms) viene caricato soltanto se accetti dal banner; se rifiuti non viene caricato nessuno script di misurazione. Per cambiare scelta cancella i dati del sito dal browser.")}</p>
    <h2 className="font-display text-2xl">{t("Diritti")}</h2>
    <p>{t("Puoi chiedere accesso, rettifica, cancellazione, limitazione o opposizione scrivendo all’email sopra, e proporre reclamo al Garante per la protezione dei dati personali.")}</p>
  </div><FloatingActions /></main>;
}
