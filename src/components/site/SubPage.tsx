import { useEffect, type ReactNode } from "react";
import { ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTAGRAM_URL, OWNER_EMAIL, OWNER_WHATSAPP } from "@/lib/site-data";
import { captureAttribution } from "@/lib/tracking";
import { publicPath, useLanguage, type PublicPage } from "@/lib/i18n";
import { Cartouche } from "./Cartouche";
import { CookieConsent } from "./CookieConsent";
import { LanguageSelector } from "./LanguageSelector";
import { NewsletterSignup } from "./NewsletterSignup";

/** Reveal-on-scroll for `.reveal` blocks (same behaviour as the home page). */
export function useReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.setAttribute("data-revealed", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "true");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Header and footer shared by the secondary public pages (guide, investments). */
export function SubPage({ page, children }: { page: PublicPage; children: ReactNode }) {
  const { t, language } = useLanguage();
  useEffect(() => {
    captureAttribution();
  }, []);
  useReveal();
  const home = publicPath(language);
  const link = (target: PublicPage, label: string) => (
    <a
      href={publicPath(language, target)}
      aria-current={target === page ? "page" : undefined}
      className={`nav-link ${target === page ? "text-gold-light" : ""}`}
    >
      {t(label)}
    </a>
  );
  return (
    <>
      <header className="site-header header-solid">
        <div className="site-container flex items-center justify-between gap-3">
          <a href={home} className="brand">
            <Cartouche />
            <span>
              {t("Oasi del Faraone")}
              <small>{t("ESPERIENZE SUL MAR ROSSO")}</small>
            </span>
          </a>
          <nav
            aria-label={t("Navigazione principale")}
            className="hidden items-center gap-5 lg:flex"
          >
            {link("home", "Le stanze")}
            {link("guide", "Guida a Sharm")}
            {link("invest", "Investire")}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSelector page={page} />
            <Button asChild className="nav-book">
              <a href={`${home === "/" ? "" : home}/#book`}>
                {t("PRENOTA")}
                <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>
      </header>
      <main className="subpage">{children}</main>
      <footer className="site-footer">
        <div className="site-container footer-layout">
          <div>
            <a href={home} className="brand">
              <Cartouche className="h-14 w-10" />
              <span>
                {t("Oasi del Faraone")}
                <small>{t("ESPERIENZE SUL MAR ROSSO")}</small>
              </span>
            </a>
            <p className="mt-5 font-display text-xl italic text-muted-foreground">
              {t("Il tuo angolo d’Oriente sul Mar Rosso")}
            </p>
          </div>
          <div>
            <p className="eyebrow">{t("Parliamone")}</p>
            <p className="mt-5 text-sm">{t("Fulvio De Siena")}</p>
            <a
              href={`https://wa.me/${OWNER_WHATSAPP}`}
              className="mt-2 block text-sm text-gold-light"
            >
              {t("+39 334 732 8158")}
            </a>
            <a href={`mailto:${OWNER_EMAIL}`} className="mt-2 block text-sm text-gold-light">
              {OWNER_EMAIL}
            </a>
          </div>
          <div>
            <p className="eyebrow">{t("Restiamo in contatto")}</p>
            <div className="mt-4 flex gap-3">
              <Button asChild variant="outline" size="icon">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("Instagram Oasi del Faraone")}
                >
                  <Instagram />
                </a>
              </Button>
              <Button asChild variant="outline" size="icon">
                <a href={`https://wa.me/${OWNER_WHATSAPP}`} aria-label={t("WhatsApp Fulvio")}>
                  <MessageCircle />
                </a>
              </Button>
            </div>
            <div className="mt-6">
              <p className="eyebrow mb-3">{t("Lettere dall’Oasi")}</p>
              <NewsletterSignup compact />
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom">
          <span>
            {t("©")} {new Date().getFullYear()} {t("Oasi del Faraone")}
          </span>
          <a href={home} className="text-xs text-muted-foreground hover:text-foreground">
            {t("Torna alla home dell’Oasi del Faraone")}
          </a>
          <a
            href={publicPath(language, "privacy")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("Privacy e cookie")}
          </a>
        </div>
      </footer>
      <CookieConsent />
    </>
  );
}
