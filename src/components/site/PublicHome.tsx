import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Check, Menu, X, MessageCircle, Waves, Umbrella, Theater, Sparkles, Diamond, Flower2, Fish, Bike, Volleyball, ChevronLeft, ChevronRight } from "lucide-react";
import moovyLogo from "@/assets/moovy-logo.png.asset.json";
import moovyBoy from "@/assets/moovy-boy.jpg.asset.json";
import minaPortrait from "@/assets/mina-portrait.png.asset.json";
import { Button } from "@/components/ui/button";
import { Booking } from "@/components/site/Booking";
import { cdnSrcSet, CARD_WIDTHS } from "@/lib/images";
import { FROM_PRICE } from "@/lib/pricing";
import { APARTMENT_PHOTOS, HERO_PHOTOS, HERO_VIDEO, MINA_TOURS_URL, MINA_WHATSAPP, ROOM_AMENITIES, ROOMS, ROOMS_ANCHOR, VILLAGE_PHOTOS } from "@/lib/site-data";
import { RitualTeaser } from "./RitualTeaser";
import { CookieConsent } from "@/components/site/CookieConsent";
import { captureAttribution } from "@/lib/tracking";
import { LanguageProvider, useLanguage, publicPath, type Language } from "@/lib/i18n";
import { localizedFaqs } from "@/lib/public-head";
import { LanguageSelector } from "./LanguageSelector";
import { SiteFooter } from "./SiteFooter";
import { FloatingActions } from "./FloatingActions";
export { Cartouche } from "./Cartouche";
import { Cartouche } from "./Cartouche";
export function Section({ id, eyebrow, title, intro, children, className = "" }: { id?: string; eyebrow: string; title: ReactNode; intro?: string; children: ReactNode; className?: string }) { return <section id={id} className={`site-section ${className}`}><div className="site-container"><div className="reveal section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}</div>{children}</div></section>; }
function Racket({ size = 27, strokeWidth = 1.2 }: { size?: number; strokeWidth?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true"><ellipse cx="14" cy="9" rx="6.5" ry="7" /><path d="M9.5 14 4 21.5M3 20.5l1.5 1.5" /><circle cx="12" cy="7" r=".6" /><circle cx="15.5" cy="7" r=".6" /><circle cx="13.5" cy="10.5" r=".6" /></svg>; }
type Slide = { src: string; alt: string };

function Carousel({ slides, label, portrait = false }: { slides: Slide[]; label: string; portrait?: boolean }) {
 const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * .8, behavior: "smooth" });
  return <div className={`reveal carousel ${portrait ? "carousel-portrait" : ""}`}><div ref={ref} className="carousel-track" role="region" aria-label={label} tabIndex={0}>{slides.map((s, i) => <figure key={i} className="carousel-slide"><img src={s.src} srcSet={cdnSrcSet(s.src, CARD_WIDTHS)} sizes="(min-width: 1024px) 440px, 80vw" alt={t(s.alt)} loading="lazy" decoding="async" width={portrait ? 1080 : 1200} height={portrait ? 1350 : 800} /></figure>)}</div><div className="carousel-controls"><Button variant="outline" size="icon" aria-label={t("Foto precedente")} onClick={() => go(-1)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label={t("Foto successiva")} onClick={() => go(1)}><ChevronRight /></Button></div></div>;
}
const NAV = [[ROOMS_ANCHOR, "Le stanze"], ["rito", "Il rito"], ["resort", "Villaggio"], ["mina", "Mina"]] as const;
const FACILITIES = [
 { name: "Spiagge private", icon: Umbrella, description: "Le spiagge del resort sul Mar Rosso, incluse senza costi aggiuntivi.", note: "Accesso incluso" },
 { name: "Piscine", icon: Waves, description: "Più piscine nel villaggio, ognuna con il suo ritmo.", note: "Accesso incluso" },
 { name: "Padel", icon: Racket, description: "Campi da padel per una partita al fresco del mattino o al tramonto.", note: "Nel villaggio" },
 { name: "Beach volley", icon: Volleyball, description: "Sabbia, sole e una sfida tra amici a pochi passi dal mare.", note: "Nel villaggio" },
 { name: "Teatro", icon: Theater, description: "Spettacoli e serate da vivere dopo una giornata di mare.", note: "Programmi serali" },
 { name: "Animazione", icon: Sparkles, description: "Attività quotidiane e intrattenimento per tutte le età.", note: "Nel villaggio" },
 { name: "Casinò", icon: Diamond, description: "Il casinò del resort, per chi cerca una serata diversa.", note: "A pagamento · solo adulti" },
 { name: "Spa Thalasso", icon: Flower2, description: "Benessere e trattamenti da prenotare separatamente.", note: "A pagamento · bambini non ammessi" },
 { name: "Centro diving", icon: Fish, description: "Direttamente sul mare, per esplorare i fondali con professionisti.", note: "Attività a pagamento" },
];
/** Autoplay can be refused (or missing, as in tests): the poster then simply stays on screen. */
/** Seconds of video shown alone before the menu and texts appear; hard cap if the video is slow to load. */
const INTRO_SECONDS = 5.5, INTRO_MAX_MS = 8000, INTRO_KEY = "odf_intro_seen";
function tryPlay(video: HTMLVideoElement) { try { const p = video.play() as Promise<void> | undefined; p?.catch(() => {}); } catch { /* ignore */ } }
export function PublicHome({ language = "it" }: { language?: Language }) { return <LanguageProvider language={language}><HomeContent /></LanguageProvider>; }
function HomeContent() {
  const { t, language, money } = useLanguage();
  const FAQS = localizedFaqs(language);
  const [extras, setExtras] = useState<string[]>([]);
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { captureAttribution(); }, []);
  // Opening: only the reef video for its first seconds, then menu and texts appear.
  // Skipped (texts at once) on reduced motion, data saver, a deep link, a scrolled page or a repeat visit in this session.
  const [intro, setIntro] = useState<"playing" | "done">("playing");
  useEffect(() => {
    const video = videoRef.current;
    const finish = () => { setIntro("done"); try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* optional */ } };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let seen = false; try { seen = sessionStorage.getItem(INTRO_KEY) === "1"; } catch { /* optional */ }
    if (video && !still) { video.src = window.matchMedia("(max-width: 767px)").matches ? HERO_VIDEO.small : HERO_VIDEO.large; tryPlay(video); }
    if (!video || still || seen || window.location.hash || window.scrollY > 0) { finish(); return; }
    const onTime = () => { if (video.currentTime >= INTRO_SECONDS) finish(); };
    const skip = () => finish();
    const timer = window.setTimeout(finish, INTRO_MAX_MS);
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    video.addEventListener("timeupdate", onTime);
    events.forEach(e => window.addEventListener(e, skip, { passive: true, once: true }));
    return () => { window.clearTimeout(timer); video.removeEventListener("timeupdate", onTime); events.forEach(e => window.removeEventListener(e, skip)); };
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.setAttribute("data-revealed", "true"); io.unobserve(e.target); } }), { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    let last = window.scrollY, frame = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const scroll = () => { if (frame) return; frame = requestAnimationFrame(() => {
      const y = window.scrollY; setHidden(y > 160 && y > last); setScrolled(y > 40); last = y;
      // "Dive": 0 at the top of the hero, 1 when its sticky stage is about to scroll away.
      const hero = heroRef.current;
      if (hero && motion) {
        const travel = hero.offsetHeight - window.innerHeight;
        const dive = travel > 0 ? Math.min(Math.max(-hero.getBoundingClientRect().top / travel, 0), 1) : 0;
        hero.style.setProperty("--dive", dive.toFixed(3));
        const video = videoRef.current;
        if (video && video.src) { if (dive >= 1 && !video.paused) video.pause(); else if (dive < 1 && video.paused) tryPlay(video); }
      }
      frame = 0;
    }); };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", scroll); cancelAnimationFrame(frame); };
  }, []);
  const toggleExtra = (id: string) => setExtras(x => x.includes(id) ? x.filter(e => e !== id) : [...x, id]);
  const mobileLinks = [...NAV.map(([id, name]) => [`#${id}`, name] as const), [publicPath(language, "guide"), "Guida a Sharm"] as const, ["#faq", "Domande frequenti"] as const, ["#contatti", "Contatti"] as const, [publicPath(language, "invest"), "Investire a Sharm"] as const];
  return <main className={intro === "playing" ? "intro-playing" : "intro-done"}>
    <div className="scroll-progress" aria-hidden="true" />
    <header className={`site-header ${hidden && !menu ? "header-hidden" : ""} ${scrolled || menu ? "header-solid" : ""}`}><div className="site-container flex items-center justify-between gap-3">
      <a href="#top" className="brand" onClick={() => setMenu(false)}><Cartouche /><span>{t("Oasi del Faraone")}<small>{t("ESPERIENZE SUL MAR ROSSO")}</small></span></a>
      <nav aria-label={t("Navigazione principale")} className="hidden items-center gap-6 lg:flex">{NAV.map(([id, name]) => <a key={id} href={`#${id}`} className="nav-link">{t(name)}</a>)}<a href={publicPath(language, "guide")} className="nav-link">{t("Guida a Sharm")}</a></nav>
      <div className="flex shrink-0 items-center gap-1"><LanguageSelector /><Button asChild className="nav-book"><a href="#book" onClick={() => setMenu(false)}>{t("PRENOTA")}<ArrowUpRight /></a></Button><Button variant="ghost" size="icon" className="lg:hidden" aria-label={t(menu ? "Chiudi menu" : "Apri menu")} aria-expanded={menu} onClick={() => setMenu(v => !v)}>{menu ? <X /> : <Menu />}</Button></div>
    </div>{menu && <nav aria-label={t("Navigazione mobile")} className="mobile-menu site-container">{mobileLinks.map(([href, name]) => <a key={href} href={href} onClick={() => setMenu(false)}>{t(name)}</a>)}</nav>}</header>
    <section id="top" ref={heroRef} className="hero hero-dive">
      <div className="hero-stage">
        <div className="hero-media"><video ref={videoRef} className="hero-video" poster={HERO_VIDEO.poster} muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture /></div>
        <div className="hero-veil" /><div className="hero-depth" aria-hidden="true" /><div className="hero-waves" aria-hidden="true"><span /><span /><span /></div>
        <div className="site-container hero-content"><p className="eyebrow">{t("DOMINA CORAL BAY · SHARM EL-SHEIKH")}</p><h1>{t("Oasi del Faraone")}<span className="sr-only"> {t("– appartamento al Domina Coral Bay, Sharm el-Sheikh")}</span></h1><p className="hero-tagline">{t("Il tuo rifugio privato nel cuore del Mar Rosso")}</p><div className="hero-actions"><Button asChild className="luxury-cta"><a href="#book">{t("Il tuo prossimo soggiorno")}<ArrowUpRight /></a></Button></div></div>
        <p className="hero-dive-line" aria-hidden="true">{t("Sotto, il Mar Rosso.")}<em>{t("Sopra, la tua stanza.")}</em></p>
        <div className="intro-progress" aria-hidden="true"><span style={{ animationDuration: `${INTRO_SECONDS}s` }} /></div>
        <a href="#apartment" className="hero-scroll-cue" aria-label={t("Scopri l’appartamento")}><span>{t("Scorri per immergerti")}</span><ArrowDown size={18} /></a>
      </div>
    </section>
    <div className="intro-strip"><div className="intro-marquee">{[0, 1].map(copy => <div key={copy} className="contents" aria-hidden={copy === 1 ? true : undefined}>{["Il tuo rifugio privato.", "Fino a 4 ospiti", "Il Mar Rosso, ogni giorno.", "Domina Coral Bay"].map(s => <span key={s}>{t(s)}</span>)}</div>)}</div></div>
    <Section id="apartment" eyebrow={t("01 / Le stanze dell’Oasi")} title={<>{t("Le stanze dell’Oasi.")}<br /><em>{t("Ognuna con la sua storia.")}</em></>} intro={t("Ogni stanza prende il nome dalla zona del Domina Coral Bay in cui si trova e custodisce un racconto.")}>
      {ROOMS.length > 1 && <div className="reveal room-grid">{ROOMS.map(r => <a key={r.slug} href={`#${r.slug}`} className="room-card"><img src={r.cover} srcSet={cdnSrcSet(r.cover, CARD_WIDTHS)} sizes="(min-width: 1024px) 440px, 90vw" alt={`${r.name}: ${t(r.summary)}`} loading="lazy" decoding="async" width={1080} height={1350} /><div><p className="eyebrow">{t(r.zone)}</p><h3>{r.name}</h3><p>{r.sizeSqm} {t("m² · fino a")} {r.maxGuests} {t("ospiti · prezzo per appartamento")}</p><p className="room-price">{t("Da {price} a notte, in base alla stagione", { price: money(FROM_PRICE) })}</p></div></a>)}</div>}
      <div id="elisir-d-oriente" className="room-detail"><div className="reveal section-heading"><p className="eyebrow">{t("Zona Elisir · Domina Coral Bay")}</p><h3 className="font-display text-4xl">{t("Elisir d’Oriente")}</h3><p className="section-intro">{t(ROOMS[0]?.summary ?? "")}</p></div>
      <Carousel slides={APARTMENT_PHOTOS} label={t("Foto dell’appartamento")} portrait />
      <div className="reveal apartment-details"><div className="room-stats">{[["60", "metri quadrati"], ["4", "ospiti massimi"], ["Balcone", "vista piscina"]].map(([v,l]) => <div key={l}><p>{t(v)}</p><span>{t(l)}</span></div>)}</div><ul>{ROOM_AMENITIES.map(a => <li key={a}><Check size={14} />{t(a)}</li>)}</ul></div>
      <div className="reveal room-from"><p>{t("Da {price} a notte · appartamento intero fino a 4 ospiti", { price: money(FROM_PRICE) })}</p><small>{t("Tariffa in base alla stagione. Solo alloggio: pasti e formula all inclusive del resort non compresi.")}</small><small>{t("Wi-Fi non disponibile in camera, gratuito in reception. Spa a pagamento separato, bambini non ammessi. Ristoranti e bar si vivono à la carte.")}</small></div>
      <div className="reveal room-actions"><Button asChild className="luxury-cta"><a href="#book">{t("Verifica disponibilità")}<ArrowUpRight /></a></Button></div>
      <blockquote className="reveal room-legend"><p className="eyebrow">{t("Un racconto dell’Oasi")}</p><p>{t("Si racconta che lungo le vie dei mercanti del Sinai viaggiasse un’ampolla che nessuno vendeva mai. Conteneva l’Elisir d’Oriente: non un profumo, ma un’abitudine. Chi la seguiva, dicevano, tornava sempre.")}</p></blockquote>
      </div>
    </Section>
    <RitualTeaser backdrop={HERO_PHOTOS[2]?.src} />
    <Section id="resort" eyebrow={t("03 / Una destinazione nella destinazione")} title={<>{t("Il villaggio")} <em>{t("Domina Coral Bay.")}</em></>} intro={t("Spiagge e piscine del resort sono incluse. Ristoranti, bar e attività a pagamento si scelgono a parte.")} className="theme-sea wave-top">
      <Carousel slides={VILLAGE_PHOTOS} label={t("Foto del villaggio")} />
      <div className="facilities-grid">{FACILITIES.map(f => <article key={t(f.name)} className="reveal facility"><f.icon size={27} strokeWidth={1.2} /><h3>{t(f.name)}</h3><p>{t(f.description)}</p><span>{t(f.note)}</span></article>)}</div>
    </Section>
    <Section id="mina" eyebrow={t("04 / Il tuo amico sul posto")} title={t("Mina, la tua guida a Sharm el-Sheikh")} className="theme-dusk">
      <div className="mina-layout"><figure className="reveal mina-photo"><img src={minaPortrait.url} srcSet={cdnSrcSet(minaPortrait.url, CARD_WIDTHS)} sizes="(min-width: 1024px) 480px, 90vw" alt={t("Mina, il tuo referente a Sharm el-Sheikh")} loading="lazy" decoding="async" width={944} height={970} /></figure><div className="reveal mina-copy"><p className="font-display text-3xl leading-snug">{t("Il tuo referente sul posto, un nostro fidato amico. Mina conosce ogni barriera corallina e gli angoli più autentici di Sharm.")}</p><p className="mt-6 text-muted-foreground leading-relaxed">{t("Con Mina non sei un turista: sei un ospite.")}</p><ul className="mt-8 space-y-3">{["Tour di snorkeling e immersioni", "Safari nel deserto in quad", "Il Cairo e Luxor", "Tour della città e transfer privati"].map(s => <li key={s} className="flex gap-3 text-sm"><Check size={16} className="text-gold shrink-0" />{t(s)}</li>)}</ul><Button asChild className="luxury-cta mina-tours mt-8"><a href={MINA_TOURS_URL} target="_blank" rel="noopener noreferrer">{t("Scopri e prenota le escursioni di Mina")}<ArrowUpRight /></a></Button><Button asChild className="mina-whatsapp mt-3"><a href={`https://wa.me/${MINA_WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle />{t("Chatta con Mina su WhatsApp")}</a></Button><a href={publicPath(language, "guide")} className="mina-guide">{t("Cosa vedere e dove mangiare: la nostra guida a Sharm")}<ArrowUpRight size={16} /></a></div></div>
    </Section>
    <Section id="book" eyebrow={t("05 / Ci vediamo sul Mar Rosso")} title={<>{t("Prenota il tuo soggiorno.")}<br /><em>{t("Il tuo prossimo ricordo.")}</em></>} className="theme-night wave-top"><div className="reveal"><Booking extras={extras} toggleExtra={toggleExtra} /></div></Section>
    <Section id="faq" eyebrow={t("Prima di partire")} title={t("Domande frequenti")} className="theme-night faq-section"><div className="reveal info-list">{FAQS.map(([q,a], i) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{i === 5 ? <>{a.split("viaggiaresicuri.it")[0]}<a href="https://www.viaggiaresicuri.it/" target="_blank" rel="noreferrer" className="underline">viaggiaresicuri.it</a>{a.split("viaggiaresicuri.it")[1]}</> : a}</p></details>)}</div></Section>
    <SiteFooter onHome />
    <FloatingActions />
    <CookieConsent />
  </main>;
}
