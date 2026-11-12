import { Bike, Check, MessageCircle } from "lucide-react";
import moovyLogo from "@/assets/moovy-logo.png.asset.json";
import moovyBoy from "@/assets/moovy-boy.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage, type Language } from "@/lib/i18n";
import { OWNER_WHATSAPP, wa } from "@/lib/site-data";
import { SubPage } from "./SubPage";

const INVEST_TEXT = "Ciao Fulvio, vorrei informazioni sulle opportunità di investimento a Sharm";

/** Investment page: different audience and intent from guests, so it lives off the booking page (with MOOVY). */
export function PublicInvest({ language = "it" }: { language?: Language }) {
  return (
    <LanguageProvider language={language}>
      <Invest />
    </LanguageProvider>
  );
}
function Invest() {
  const { t } = useLanguage();
  return (
    <SubPage page="invest">
      <section id="investire" className="site-section invest-section">
        <div className="site-container invest-layout">
          <div className="reveal">
            <p className="eyebrow">{t("OPPORTUNITÀ")}</p>
            <h1 className="font-display text-5xl leading-tight sm:text-6xl">
              {t("Investire a")}
              <br />
              <em>{t("Sharm el-Sheikh")}</em>
            </h1>
            <p className="section-intro">
              {t(
                "Sharm interessa a chi investe per la domanda turistica tutto l’anno, il clima mite anche in inverno e i voli diretti dall’Italia. Valutiamo insieme numeri reali, caso per caso.",
              )}
            </p>
          </div>
          <div className="reveal">
            <p className="eyebrow">{t("Cosa offriamo")}</p>
            <ul className="mt-6 space-y-3">
              {[
                "Affiancamento nella ricerca di unità al Domina Coral Bay e a Sharm",
                "Valutazione del potenziale di affitto breve",
                "Gestione e messa a reddito con il modello Oasi del Faraone",
                "Una rete locale di fiducia sul posto",
              ].map((text) => (
                <li key={text} className="flex gap-3 text-sm">
                  <Check size={16} className="text-gold shrink-0" />
                  {t(text)}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 h-12">
              <a href={wa(OWNER_WHATSAPP, t(INVEST_TEXT))} target="_blank" rel="noreferrer">
                <MessageCircle />
                {t("Parliamone su WhatsApp")}
              </a>
            </Button>
          </div>
        </div>
      </section>
      <section id="moovy" className="moovy-section site-section">
        <div className="site-container moovy-layout">
          <div className="reveal">
            <p className="eyebrow text-moovy">{t("MOBILITÀ, CON UN’ENERGIA NUOVA")}</p>
            <img
              className="moovy-logo"
              src={moovyLogo.url}
              alt={t("MOOVY — Join the Movement. Join MOOVY.")}
              loading="lazy"
              width={1492}
              height={1023}
            />
            <p className="moovy-soon">{t("Coming Soon")}</p>
            <p className="section-intro">
              {t("Il progetto di mobilità elettrica di Domina Coral Bay arriva presto.")}
            </p>
            <div className="mt-8 flex items-center gap-3 text-moovy">
              <Bike size={25} />
              <span className="text-sm">{t("Elettrico. Leggero. Libero.")}</span>
            </div>
          </div>
          <figure className="reveal moovy-photo">
            <img
              src={moovyBoy.url}
              alt={t("Bambino di spalle con sacca MOOVY, affacciato sul resort e sul mare")}
              loading="lazy"
              width={1440}
              height={1920}
            />
          </figure>
        </div>
      </section>
    </SubPage>
  );
}
