import { LanguageProvider, useLanguage, type Language } from "@/lib/i18n";
import { RESTAURANTS, SPOTS } from "@/lib/site-data";
import { PhotoCard } from "./PhotoCard";
import { Section } from "./PublicHome";
import { SubPage } from "./SubPage";
import { GUIDE_TITLE } from "@/lib/page-texts";

/** "Guida a Sharm": things to see and restaurants, moved off the home page (long-tail SEO content). */
export function PublicGuide({ language = "it" }: { language?: Language }) {
  return (
    <LanguageProvider language={language}>
      <Guide />
    </LanguageProvider>
  );
}
function Guide() {
  const { t } = useLanguage();
  return (
    <SubPage page="guide">
      <section className="site-section pb-0">
        <div className="site-container max-w-3xl">
          <p className="eyebrow">{t("Guida a Sharm")}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">{t(GUIDE_TITLE)}</h1>
          <p className="section-intro mt-5">
            {t(
              "Gli indirizzi che condividiamo con chi viene a trovarci al Domina Coral Bay, scelti uno per uno.",
            )}
          </p>
        </div>
      </section>
      <Section
        id="explore"
        eyebrow={t("La Sharm che ci piace")}
        title={
          <>
            {t("Sharm el-Sheikh: cosa vedere")} <em>{t("oltre il resort.")}</em>
          </>
        }
        intro={t(
          "Un tramonto, un profumo, una passeggiata. I luoghi che ti consigliamo di scoprire, un passo alla volta.",
        )}
      >
        <div className="photo-grid">
          {SPOTS.map((s) => (
            <PhotoCard
              key={s.name}
              title={t(s.name)}
              description={t(s.desc)}
              image={s.image}
              photo={t(s.photo)}
            />
          ))}
        </div>
      </Section>
      <Section
        id="restaurants"
        eyebrow={t("I nostri consigli — dove mangiare")}
        title={t("Dove mangiare a Sharm: i più amati dai nostri ospiti")}
        intro={t(
          "Una buona tavola fa parte del viaggio. Questi sono gli indirizzi che condividiamo con chi viene a trovarci.",
        )}
        className="bg-secondary"
      >
        <div className="restaurant-grid">
          {RESTAURANTS.map((r, i) => (
            <article key={r.name} className="reveal restaurant-card">
              <span className="restaurant-number">{String(i + 1).padStart(2, "0")}</span>
              <p className="restaurant-tag">{t(r.tag)}</p>
              <h3>{r.name}</h3>
              <p className="restaurant-desc">{t(r.desc)}</p>
              <p className="restaurant-cuisine">
                {t("Tipo di cucina")} <span>{t(r.cuisine)}</span>
              </p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          {t("Per orari, menu e prenotazioni aggiornati, chiedi a Mina.")}
        </p>
      </Section>
    </SubPage>
  );
}
