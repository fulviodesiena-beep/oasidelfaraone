import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureAttribution } from "@/lib/tracking";
import { publicPath, useLanguage, type PublicPage } from "@/lib/i18n";
import { Cartouche } from "./Cartouche";
import { CookieConsent } from "./CookieConsent";
import { FloatingActions } from "./FloatingActions";
import { LanguageSelector } from "./LanguageSelector";
import { SiteFooter } from "./SiteFooter";

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
  const [menu, setMenu] = useState(false);
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
      <div className="scroll-progress" aria-hidden="true" />
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
            className="hidden items-center gap-6 lg:flex"
          >
            {link("home", "Torna all’Oasi")}
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
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={t(menu ? "Chiudi menu" : "Apri menu")}
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              {menu ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menu && (
          <nav aria-label={t("Navigazione mobile")} className="mobile-menu site-container">
            <a href={home}>{t("Torna all’Oasi")}</a>
            <a href={publicPath(language, "guide")} aria-current={page === "guide" ? "page" : undefined}>{t("Guida a Sharm")}</a>
            <a href={publicPath(language, "invest")} aria-current={page === "invest" ? "page" : undefined}>{t("Investire a Sharm")}</a>
            <a href={`${home === "/" ? "" : home}/#contatti`}>{t("Contatti")}</a>
          </nav>
        )}
      </header>
      <main className="subpage">{children}</main>
      <SiteFooter />
      <FloatingActions />
      <CookieConsent />
    </>
  );
}
