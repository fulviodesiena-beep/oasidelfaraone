import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicPath, useLanguage } from "@/lib/i18n";
import { INSTAGRAM_URL, OWNER_EMAIL, OWNER_WHATSAPP, ROOMS_ANCHOR } from "@/lib/site-data";
import { Cartouche } from "./Cartouche";
import { NewsletterSignup } from "./NewsletterSignup";

/** Sections of the home reachable from the footer (and from the menus). */
export const HOME_SECTIONS = [[ROOMS_ANCHOR, "Le stanze"], ["rito", "Il rito"], ["resort", "Villaggio"], ["mina", "Mina"], ["book", "Disponibilità"], ["faq", "Domande frequenti"]] as const;

/**
 * One footer for every public page: a contact call-to-action (WhatsApp / email, section #contatti),
 * then brand, site map, pages and newsletter. On secondary pages the home anchors get the home path.
 */
export function SiteFooter({ onHome = false }: { onHome?: boolean }) {
  const { t, language } = useLanguage();
  const home = publicPath(language);
  const anchor = (id: string) => (onHome ? `#${id}` : `${home === "/" ? "" : home}/#${id}`);
  return <footer className="site-footer">
    <section id="contatti" className="site-container footer-cta" aria-labelledby="footer-cta-title">
      <div className="reveal">
        <p className="eyebrow">{t("Contatti")}</p>
        <h2 id="footer-cta-title">{t("Parliamone.")} <em>{t("Come preferisci.")}</em></h2>
        <p className="section-intro">{t("Per informazioni, prenotazioni o investimenti: scrivi direttamente a Fulvio. Risponde di persona, su WhatsApp o via email.")}</p>
      </div>
      <div className="reveal contact-buttons">
        <Button asChild className="contact-btn contact-whatsapp"><a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle />{t("Scrivici su WhatsApp")}</a></Button>
        <Button asChild variant="outline" className="contact-btn contact-email"><a href={`mailto:${OWNER_EMAIL}`}><Mail />{t("Scrivici via email")}</a></Button>
      </div>
    </section>
    <div className="site-container footer-grid">
      <div className="footer-brand">
        <a href={onHome ? "#top" : home} className="brand"><Cartouche className="h-14 w-10" /><span>{t("Oasi del Faraone")}<small>{t("ESPERIENZE SUL MAR ROSSO")}</small></span></a>
        <p className="mt-5 font-display text-xl italic text-muted-foreground">{t("Il tuo angolo d’Oriente sul Mar Rosso")}</p>
        <div className="mt-5 flex gap-3">
          <Button asChild variant="outline" size="icon"><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label={t("Instagram Oasi del Faraone")} title={t("Instagram @oasidelfaraone")}><Instagram /></a></Button>
          <Button asChild variant="outline" size="icon"><a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer" aria-label={t("WhatsApp Fulvio")} title={t("WhatsApp Fulvio")}><MessageCircle /></a></Button>
        </div>
      </div>
      <nav aria-label={t("Esplora")} className="footer-links">
        <p className="eyebrow">{t("Esplora")}</p>
        <ul>{HOME_SECTIONS.map(([id, label]) => <li key={id}><a href={anchor(id)}>{t(label)}</a></li>)}</ul>
      </nav>
      <nav aria-label={t("Approfondisci")} className="footer-links">
        <p className="eyebrow">{t("Approfondisci")}</p>
        <ul>
          <li><a href={publicPath(language, "guide")}>{t("Guida a Sharm")}</a></li>
          <li><a href={publicPath(language, "invest")}>{t("Investire a Sharm")}</a></li>
          <li><a href={publicPath(language, "privacy")}>{t("Privacy e cookie")}</a></li>
        </ul>
        <p className="eyebrow mt-8">{t("Parliamone")}</p>
        <p className="mt-3 text-sm">{t("Fulvio De Siena")}</p>
        <a href={`https://wa.me/${OWNER_WHATSAPP}`} className="mt-1 block text-sm text-gold-light">{t("+39 334 732 8158")}</a>
        <a href={`mailto:${OWNER_EMAIL}`} className="mt-1 block break-all text-sm text-gold-light">{OWNER_EMAIL}</a>
      </nav>
      <div className="footer-newsletter">
        <p className="eyebrow mb-3">{t("Lettere dall’Oasi")}</p>
        <NewsletterSignup compact />
      </div>
    </div>
    <div className="site-container footer-bottom">
      <span>{t("©")} {new Date().getFullYear()} {t("Oasi del Faraone")}</span>
      <span>{t("Domina Coral Bay")} · {t("Sharm el-Sheikh, Egitto")}</span>
      <span>{t("Un piccolo angolo d’Egitto. Un grande ricordo.")}</span>
    </div>
  </footer>;
}
