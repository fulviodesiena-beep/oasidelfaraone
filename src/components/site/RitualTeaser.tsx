import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { cdnSrcSet, HERO_WIDTHS } from "@/lib/images";

/**
 * Home teaser for the room ritual. It only hints: the full ritual is revealed only in the room,
 * so the home builds curiosity and leads to the booking form.
 * Each clue opens on hover and through a real toggle button, so phones reach the same content.
 */
export const RITUAL_CLUES = [
  { numeral: "I", front: "Uno scarabeo", back: "Ti aspetta in camera, il giorno del tuo arrivo. Cosa farne lo scoprirai lì." },
  { numeral: "II", front: "La prima luce", back: "Il rito comincia sul balcone, prima che il sole sia sorto del tutto." },
  { numeral: "III", front: "Un desiderio", back: "Lo scriverai tu. Resterà nella stanza, e nessuno lo leggerà mai." },
] as const;

export const RITUAL_TEASER_TEXTS = [
  "02 / Il rito dell’Oasi", "C’è un rito che si compie", "solo in questa stanza.",
  "Non lo troverai in nessun’altra camera di Sharm. Comincia all’alba, sul balcone, e finisce con un desiderio. Il resto si svela soltanto a chi dorme all’Oasi.",
  "Tocca per svelare l’indizio", "Prenota e vivi il rito", "Scopri le date libere",
  ...RITUAL_CLUES.flatMap(c => [c.front, c.back]),
] as const;

export function RitualTeaser({ backdrop }: { backdrop?: string | undefined }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  return <section id="rito" className="ritual-teaser site-section" aria-labelledby="ritual-teaser-title">
    {backdrop && <div className="ritual-teaser-backdrop" aria-hidden="true"><img src={backdrop} srcSet={cdnSrcSet(backdrop, HERO_WIDTHS)} sizes="100vw" alt="" loading="lazy" decoding="async" width={1920} height={1080} /></div>}
    <div className="ritual-teaser-dust" aria-hidden="true" />
    <div className="site-container ritual-teaser-inner">
      <div className="reveal ritual-teaser-mark"><Scarab className="ritual-scarab" /></div>
      <p className="reveal eyebrow">{t("02 / Il rito dell’Oasi")}</p>
      <h2 id="ritual-teaser-title" className="reveal">{t("C’è un rito che si compie")}<br /><em>{t("solo in questa stanza.")}</em></h2>
      <p className="reveal ritual-teaser-intro">{t("Non lo troverai in nessun’altra camera di Sharm. Comincia all’alba, sul balcone, e finisce con un desiderio. Il resto si svela soltanto a chi dorme all’Oasi.")}</p>
      <ol className="ritual-clues">{RITUAL_CLUES.map((c, i) => {
        const isOpen = open === i;
        return <li key={c.numeral} className="reveal ritual-clue" data-open={isOpen || undefined} style={{ transitionDelay: `${i * 0.12}s` }}>
          <button type="button" className="ritual-clue-card" aria-expanded={isOpen} aria-controls={`ritual-clue-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
            <span className="ritual-clue-face ritual-clue-front"><span className="ritual-clue-numeral" aria-hidden="true">{c.numeral}</span><span className="ritual-clue-title">{t(c.front)}</span><span className="ritual-clue-hint">{t("Tocca per svelare l’indizio")}</span></span>
            <span id={`ritual-clue-${i}`} className="ritual-clue-face ritual-clue-back">{t(c.back)}</span>
          </button>
        </li>;
      })}</ol>
      <div className="reveal ritual-teaser-actions">
        <Button asChild className="luxury-cta h-12"><a href="#book">{t("Prenota e vivi il rito")}<ArrowUpRight /></a></Button>
        <a href="#book" className="ritual-teaser-link">{t("Scopri le date libere")}</a>
      </div>
    </div>
  </section>;
}

function Scarab({ className = "size-10" }: { className?: string }) {
  return <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="24" cy="7" r="4" /><path d="M24 11v29" /><ellipse cx="24" cy="27" rx="11" ry="14" />
    <path d="M13 22 5 17M13 28H4M14 34l-7 6M35 22l8-5M35 28h9M34 34l7 6M21 4l-3-3M27 4l3-3" />
  </svg>;
}
