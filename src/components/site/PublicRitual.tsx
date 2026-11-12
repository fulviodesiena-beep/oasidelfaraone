import { useEffect } from "react";
import { Feather, Gift, Instagram, RotateCw, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTAGRAM_URL } from "@/lib/site-data";
import { captureAttribution } from "@/lib/tracking";
import { LanguageProvider, publicPath, useLanguage, type Language } from "@/lib/i18n";
import { RITUAL_IMAGE } from "@/lib/public-head";
import { CookieConsent } from "./CookieConsent";
import { FloatingActions } from "./FloatingActions";
import { LanguageSelector } from "./LanguageSelector";
import { NewsletterSignup } from "./NewsletterSignup";
import { Cartouche } from "./Cartouche";

/** Page opened from the in-room QR code (utm_source=qr…): mobile-first, dark for dawn, no prices. */
export function PublicRitual({ language = "it" }: { language?: Language }) {
  return <LanguageProvider language={language}><Ritual /></LanguageProvider>;
}

export const RITUAL_STEPS = [
  { icon: Sunrise, text: "Alla prima alba esci sul balcone." },
  { icon: RotateCw, text: "Tieni lo scarabeo nel palmo, rivolto verso la luce, giralo tre volte in senso orario ed esprimi un desiderio in silenzio." },
  { icon: Feather, text: "Scrivi il desiderio su uno dei bigliettini bianchi, piegalo e appoggialo sotto la statua custode della stanza. Lì resta, e nessuno lo legge." },
  { icon: Gift, text: "Lo scarabeo è tuo: portalo a casa. Si dice che chi lo riporta all’Oasi trovi sempre la stanza libera, e al ritorno c’è un piccolo regalo." },
] as const;

const STORY = "Si racconta che lungo le vie dei mercanti che attraversavano il Sinai, tra le spezie, l’incenso e le stoffe, viaggiasse un’ampolla che nessuno vendeva mai. Conteneva l’Elisir d’Oriente: non un profumo, ma un’abitudine. Fermarsi. Guardare il mare all’alba. Esprimere un desiderio prima che il sole fosse del tutto sorto. Chi lo faceva, dicevano, tornava sempre. Noi l’ampolla non l’abbiamo trovata. Ma abbiamo trovato il posto in cui l’abitudine ha senso: un balcone sulla piscina, a pochi passi dal Mar Rosso, nella zona del villaggio che porta il suo nome.";
const WHY = "Nell’antico Egitto lo scarabeo era il simbolo di Khepri, il sole che sorge ogni mattina: rinascita e nuovi inizi. Era uno dei portafortuna più diffusi.";
const NOTE = "È un piccolo gioco raccontato con un sorriso, non una promessa di fortuna. Per favore non raccogliere sabbia, conchiglie o coralli: in Egitto è vietato e danneggia il mare.";

/** Every visible string on the page (dictionary keys), so tests can check translations and the absence of prices. */
export const RITUAL_TEXTS = [STORY, WHY, NOTE, ...RITUAL_STEPS.map(s => s.text),
  "Il rito della stanza", "Il risveglio dello scarabeo", "Una piccola tradizione dell’Oasi, da vivere sul balcone alla prima luce.",
  "Un racconto dell’Oasi", "La storia",
  "Perché lo scarabeo",
  "Il rito, in quattro passi", "Condividi il tuo risveglio", "Pubblica la tua alba con #RisveglioDelloScarabeo e tagga @oasidelfaraone.", "Apri Instagram",
  "Ogni mese ricondividiamo, con il tuo permesso, le foto più belle.", "Una nota gentile",
  "Torna alla home dell’Oasi del Faraone", "Lettere dall’Oasi", "Privacy e cookie",
] as const;

function Scarab({ className = "size-10" }: { className?: string }) {
  return <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="24" cy="7" r="4" /><path d="M24 11v29" /><ellipse cx="24" cy="27" rx="11" ry="14" />
    <path d="M13 22 5 17M13 28H4M14 34l-7 6M35 22l8-5M35 28h9M34 34l7 6M21 4l-3-3M27 4l3-3" />
  </svg>;
}

function Ritual() {
  const { t, language } = useLanguage();
  useEffect(() => { captureAttribution(); }, []);
  return <>
    <header className="border-b border-border">
      <div className="site-container flex items-center justify-between gap-3 py-3">
        <a href={publicPath(language)} className="brand"><Cartouche className="h-10 w-8" /><span>{t("Oasi del Faraone")}</span></a>
        <LanguageSelector page="ritual" />
      </div>
    </header>
    <main className="ritual-page">
      <section className="site-container max-w-2xl pt-10 pb-8 text-center sm:pt-16">
        <Scarab className="mx-auto size-14 text-gold-light" />
        <p className="eyebrow mt-5">{t("Il rito della stanza")}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
          <span className="block text-gold-light">Elisir d’Oriente</span><span className="sr-only"> · </span>
          <span className="block italic">{t("Il risveglio dello scarabeo")}</span>
        </h1>
        <p className="mt-5 text-base text-muted-foreground">{t("Una piccola tradizione dell’Oasi, da vivere sul balcone alla prima luce.")}</p>
      </section>
      {RITUAL_IMAGE && <figure className="site-container max-w-2xl"><img src={RITUAL_IMAGE.src} alt={t(RITUAL_IMAGE.alt)} width={1200} height={800} className="aspect-[4/3] w-full rounded-sm object-cover" /></figure>}

      <article className="site-container max-w-2xl space-y-12 py-12 text-lg leading-relaxed">
        <section aria-labelledby="ritual-story">
          <p className="eyebrow">{t("Un racconto dell’Oasi")}</p>
          <h2 id="ritual-story" className="mt-3 font-display text-3xl sm:text-4xl">{t("La storia")}</h2>
          <p className="mt-4 font-display text-xl italic leading-relaxed sm:text-2xl">{t(STORY)}</p>
        </section>
        <section aria-labelledby="ritual-why" className="border-t border-border pt-10">
          <h2 id="ritual-why" className="flex items-center gap-3 font-display text-3xl sm:text-4xl"><Scarab className="size-8 shrink-0 text-gold-light" />{t("Perché lo scarabeo")}</h2>
          <p className="mt-4">{t(WHY)}</p>
        </section>
        <section aria-labelledby="ritual-steps" className="border-t border-border pt-10">
          <h2 id="ritual-steps" className="font-display text-3xl sm:text-4xl">{t("Il rito, in quattro passi")}</h2>
          <ol className="mt-6 space-y-6">{RITUAL_STEPS.map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex gap-4">
              <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-full border border-gold/60 text-gold-light"><Icon className="size-5" aria-hidden="true" /></span>
              <p><span className="me-2 font-display text-2xl text-gold-light">{i + 1}.</span>{t(text)}</p>
            </li>))}</ol>
        </section>
        <section aria-labelledby="ritual-share" className="rounded-sm border border-gold/50 bg-card p-6 text-center">
          <h2 id="ritual-share" className="font-display text-3xl">{t("Condividi il tuo risveglio")}</h2>
          <p className="mt-3 font-display text-2xl text-gold-light">#RisveglioDelloScarabeo</p>
          <p className="mt-2 text-base">{t("Pubblica la tua alba con #RisveglioDelloScarabeo e tagga @oasidelfaraone.")}</p>
          <Button asChild size="lg" className="mt-5 min-h-12 w-full sm:w-auto"><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram />{t("Apri Instagram")}</a></Button>
          <p className="mt-4 text-sm text-muted-foreground">{t("Ogni mese ricondividiamo, con il tuo permesso, le foto più belle.")}</p>
        </section>
        <aside aria-labelledby="ritual-note" className="border-s-2 border-gold/60 ps-5 text-base text-muted-foreground">
          <h2 id="ritual-note" className="font-display text-2xl text-foreground">{t("Una nota gentile")}</h2>
          <p className="mt-2">{t(NOTE)}</p>
        </aside>
      </article>

      <footer className="border-t border-border">
        <div className="site-container max-w-2xl space-y-8 py-10">
          <section aria-labelledby="ritual-newsletter">
            <h2 id="ritual-newsletter" className="font-display text-2xl">{t("Lettere dall’Oasi")}</h2>
            <div className="mt-3"><NewsletterSignup /></div>
          </section>
          <p className="flex flex-wrap justify-between gap-3 text-sm">
            <a href={publicPath(language)} className="text-gold-light underline-offset-4 hover:underline">{t("Torna alla home dell’Oasi del Faraone")}</a>
            <a href={publicPath(language, "privacy")} className="text-muted-foreground hover:text-foreground">{t("Privacy e cookie")}</a>
          </p>
        </div>
      </footer>
    </main>
    <FloatingActions />
    <CookieConsent />
  </>;
}
