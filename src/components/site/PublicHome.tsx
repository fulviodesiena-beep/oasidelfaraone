import { OwnerLoginLink } from "@/components/site/OwnerLoginLink";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Check, Menu, X, MessageCircle, Instagram, Mail, Waves, Umbrella, Theater, Sparkles, Diamond, Flower2, Fish, Bike, Volleyball, ChevronLeft, ChevronRight } from "lucide-react";
import moovyLogo from "@/assets/moovy-logo.png.asset.json";
import moovyBoy from "@/assets/moovy-boy.jpg.asset.json";
import minaPortrait from "@/assets/mina-portrait.png.asset.json";
import { Button } from "@/components/ui/button";
import { Booking } from "@/components/site/Booking";
import { PhotoCard } from "@/components/site/PhotoCard";
import { APARTMENT_PHOTOS, EXTRAS, HERO_PHOTOS, INSTAGRAM_URL, MINA_WHATSAPP, OWNER_EMAIL, OWNER_WHATSAPP, RESTAURANTS, ROOM_AMENITIES, ROOMS, SPOTS, VILLAGE_PHOTOS, wa } from "@/lib/site-data";
import { CookieConsent } from "@/components/site/CookieConsent";
import { captureAttribution } from "@/lib/tracking";
import { LanguageProvider, useLanguage, publicPath, type Language } from "@/lib/i18n";
import { localizedFaqs } from "@/lib/public-head";
import { LanguageSelector } from "./LanguageSelector";
import { NewsletterSignup } from "./NewsletterSignup";
export function Cartouche({ className = "h-10 w-8" }: { className?: string }) { return <svg viewBox="0 0 48 64" className={className} aria-hidden="true"><rect x="4" y="2" width="40" height="56" rx="20" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 61h32M20 48V28m8 20V28m-11 2h14m-14 5h14m-14 5h14" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="24" cy="17" r="6" className="fill-terracotta" /></svg>; }
function Section({ id, eyebrow, title, intro, children, className = "" }: { id?: string; eyebrow: string; title: ReactNode; intro?: string; children: ReactNode; className?: string }) { return <section id={id} className={`site-section ${className}`}><div className="site-container"><div className="reveal section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}</div>{children}</div></section>; }
function Racket({ size = 27, strokeWidth = 1.2 }: { size?: number; strokeWidth?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true"><ellipse cx="14" cy="9" rx="6.5" ry="7" /><path d="M9.5 14 4 21.5M3 20.5l1.5 1.5" /><circle cx="12" cy="7" r=".6" /><circle cx="15.5" cy="7" r=".6" /><circle cx="13.5" cy="10.5" r=".6" /></svg>; }
type Slide = { src: string; alt: string };

function Carousel({ slides, label, portrait = false }: { slides: Slide[]; label: string; portrait?: boolean }) {
 const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * .8, behavior: "smooth" });
  return <div className={`reveal carousel ${portrait ? "carousel-portrait" : ""}`}><div ref={ref} className="carousel-track" role="region" aria-label={label} tabIndex={0}>{slides.map((s, i) => <figure key={i} className="carousel-slide"><img src={s.src} alt={t(s.alt)} loading={i < 2 ? "eager" : "lazy"} width={portrait ? 1080 : 1200} height={portrait ? 1350 : 800} /></figure>)}</div><div className="carousel-controls"><Button variant="outline" size="icon" aria-label={t("Foto precedente")} onClick={() => go(-1)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label={t("Foto successiva")} onClick={() => go(1)}><ChevronRight /></Button></div></div>;
}
const NAV = [["apartment", "Le stanze"], ["resort", "Villaggio"], ["book", "Disponibilità"], ["extras", "Esperienze"], ["mina", "Mina"], ["faq", "FAQ"], ["investire", "Investire"]];
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
export function PublicHome({ language = "it" }: { language?: Language }) { return <LanguageProvider language={language}><HomeContent /></LanguageProvider>; }
function HomeContent() {
  const { t, language } = useLanguage();
  const FAQS = localizedFaqs(language);
  const HERO = HERO_PHOTOS.map(h => ({ ...h, alt: t(h.alt) }));
  const [extras, setExtras] = useState<string[]>([]);
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => { captureAttribution(); }, []);
  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.setAttribute("data-revealed", "true"); io.unobserve(e.target); } }), { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    let last = window.scrollY, frame = 0;
    const canAnimate = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches;
    const scroll = () => { if (frame) return; frame = requestAnimationFrame(() => {
      const y = window.scrollY; setHidden(y > 160 && y > last); setScrolled(y > 40); last = y;
      if (canAnimate) heroRef.current?.style.setProperty("--hero-y", `${Math.min(y * .22, 220)}px`); frame = 0;
    }); };
    const move = (e: PointerEvent) => { if (!canAnimate || e.pointerType !== "mouse") return; heroRef.current?.style.setProperty("--tilt-x", `${(e.clientX / window.innerWidth - .5) * 10}px`); heroRef.current?.style.setProperty("--tilt-y", `${(e.clientY / window.innerHeight - .5) * 6}px`); };
    window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("pointermove", move, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", scroll); window.removeEventListener("pointermove", move); cancelAnimationFrame(frame); };
  }, []);
  const toggleExtra = (id: string) => setExtras(x => x.includes(id) ? x.filter(e => e !== id) : [...x, id]);
  return <main>
    <header className={`site-header ${hidden && !menu ? "header-hidden" : ""} ${scrolled || menu ? "header-solid" : ""}`}><div className="site-container flex items-center justify-between gap-3">
      <a href="#top" className="brand" onClick={() => setMenu(false)}><Cartouche /><span>{t("Oasi del Faraone")}<small>{t("ESPERIENZE SUL MAR ROSSO")}</small></span></a>
      <nav aria-label={t("Navigazione principale")} className="hidden items-center gap-5 xl:flex">{NAV.map(([id, name]) => <a key={id} href={`#${id}`} className="nav-link">{t(name)}</a>)}</nav>
      <div className="flex shrink-0 items-center gap-1"><LanguageSelector /><Button asChild className="nav-book"><a href="#book" onClick={() => setMenu(false)}>{t("PRENOTA")}<ArrowUpRight /></a></Button><Button variant="ghost" size="icon" className="xl:hidden" aria-label={t(menu ? "Chiudi menu" : "Apri menu")} aria-expanded={menu} onClick={() => setMenu(v => !v)}>{menu ? <X /> : <Menu />}</Button></div>
    </div>{menu && <nav aria-label={t("Navigazione mobile")} className="mobile-menu site-container">{NAV.map(([id, name]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{t(name)}</a>)}</nav>}</header>
    <section id="top" ref={heroRef} className="hero">
      <div className="hero-media">{HERO.map((h, i) => <img key={h.src} src={h.src} width={1920} height={1080} alt={h.alt} className={`hero-slide hero-slide-${i}`} fetchPriority={i === 0 ? "high" : "auto"} />)}</div><div className="hero-veil" /><div className="hero-shimmer" aria-hidden="true" />
      <div className="site-container hero-content"><p className="eyebrow">{t("DOMINA CORAL BAY · SHARM EL-SHEIKH")}</p><h1>{t("Oasi del Faraone")}<span className="sr-only"> {t("– appartamento al Domina Coral Bay, Sharm el-Sheikh")}</span></h1><p className="hero-subbrand">{t("Esperienze sul Mar Rosso · Domina Coral Bay")}</p><p className="hero-tagline">{t("Il tuo rifugio privato nel cuore del Mar Rosso")}</p><p className="hero-sub">{t("Relax assoluto. Privacy totale. Esclusività che non si trova ovunque.")}</p><div className="hero-actions"><Button asChild className="luxury-cta"><a href="#book">{t("Il tuo prossimo soggiorno")}<ArrowUpRight /></a></Button><a className="hero-discover" href="#apartment">{t("Entra nell’oasi")}<ArrowDown size={16} /></a></div></div>
      <div className="hero-bottom site-container"><span>{t("27°57′ N · 34°23′ E")}</span><span>{t("Mar Rosso, Egitto")}</span><a href="#apartment" aria-label={t("Scopri l’appartamento")}><ArrowDown size={20} /></a></div>
    </section>
    <div className="intro-strip"><div className="site-container"><span>{t("Il tuo rifugio privato.")}</span><span>{t("Fino a 4 ospiti")}</span><span>{t("Il Mar Rosso, ogni giorno.")}</span></div></div>
    <Section id="apartment" eyebrow={t("01 / Le stanze dell’Oasi")} title={<>{t("Le stanze dell’Oasi.")}<br /><em>{t("Ognuna con la sua storia.")}</em></>} intro={t("Oasi del Faraone è il nostro modo di vivere il Mar Rosso. Ogni stanza prende il nome dalla zona del Domina Coral Bay in cui si trova e porta con sé un racconto e un piccolo rito.")}>
      <div className="reveal room-grid">{ROOMS.map(r => <a key={r.slug} href={`#${r.slug}`} className="room-card"><img src={r.cover} alt={`${r.name}: ${t(r.summary)}`} loading="lazy" width={1080} height={1350} /><div><p className="eyebrow">{t(r.zone)}</p><h3>{r.name}</h3><p>{r.sizeSqm} {t("m² · fino a")} {r.maxGuests} {t("ospiti · prezzo per appartamento")}</p></div></a>)}</div>
      <div id="elisir-d-oriente" className="room-detail"><div className="reveal section-heading"><p className="eyebrow">{t("Prima stanza · zona Elisir")}</p><h3 className="font-display text-4xl">{t("Elisir d’Oriente")}</h3><p className="section-intro">{t(ROOMS[0]?.summary ?? "")}</p></div>
      <Carousel slides={APARTMENT_PHOTOS} label={t("Foto dell’appartamento")} portrait />
      <div className="reveal apartment-details"><div className="room-stats">{[["60", "metri quadrati"], ["4", "ospiti massimi"], ["Balcone", "vista piscina"]].map(([v,l]) => <div key={l}><p>{t(v)}</p><span>{t(l)}</span></div>)}</div><ul>{ROOM_AMENITIES.map(a => <li key={a}><Check size={14} />{t(a)}</li>)}</ul></div>
      <p className="reveal room-note">{t("Wi-Fi non disponibile in camera. Spa a pagamento separato, bambini non ammessi. Ristoranti e bar si vivono à la carte.")}</p>
      <div className="reveal room-actions"><Button asChild variant="outline"><a href="#book">{t("Verifica disponibilità")}</a></Button><Button asChild className="luxury-cta"><a href="#book">{t("Calendario e disponibilità")}<ArrowUpRight /></a></Button></div>
      <div className="room-tales">
        <article className="reveal room-tale"><p className="eyebrow">{t("Un racconto dell’Oasi")}</p><h3>{t("La storia di Elisir d’Oriente")}</h3><p>{t(ROOMS[0]?.story ?? "")}</p></article>
        <article className="reveal room-tale"><p className="eyebrow">{t("Simbolo: lo scarabeo")}</p><h3>{t("Il rito: il risveglio dello scarabeo")}</h3><p>{t(ROOMS[0]?.ritual ?? "")}</p></article>
      </div>
      </div>
    </Section>
    <Section id="resort" eyebrow={t("02 / Una destinazione nella destinazione")} title={<>{t("Il villaggio")} <em>{t("Domina Coral Bay.")}</em></>} intro={t("Spiagge private, piscine, padel, beach volley e serate sotto le stelle. Spiagge e piscine del resort incluse, senza costi aggiuntivi; ristoranti, bar e attività a pagamento si scelgono separatamente.")} className="bg-secondary">
      <Carousel slides={VILLAGE_PHOTOS} label={t("Foto del villaggio")} />
      <div className="facilities-grid">{FACILITIES.map(f => <article key={t(f.name)} className="reveal facility"><f.icon size={27} strokeWidth={1.2} /><h3>{t(f.name)}</h3><p>{t(f.description)}</p><span>{t(f.note)}</span></article>)}</div>
    </Section>
    <Section id="mina" eyebrow={t("03 / Il tuo amico sul posto")} title={t("Mina, la tua guida a Sharm el-Sheikh")}>
      <div className="mina-layout"><figure className="reveal mina-photo"><img src={minaPortrait.url} alt={t("Mina, il tuo referente a Sharm el-Sheikh")} loading="lazy" width={944} height={970} /></figure><div className="reveal mina-copy"><p className="font-display text-3xl leading-snug">{t("Il tuo referente sul posto, un nostro fidato amico. Mina conosce ogni barriera corallina e gli angoli più autentici di Sharm.")}</p><p className="mt-6 text-muted-foreground leading-relaxed">{t("Mina conosce Sharm come pochi. Nato e cresciuto qui, è la persona giusta per scoprire la vera essenza di questo luogo — dai fondali della barriera corallina alle strade del mercato notturno, dalle escursioni nel deserto ai migliori tavoli in città. Lui gestirà ogni dettaglio per te. Con Mina, non sei un turista: sei un ospite.")}</p><ul className="mt-8 space-y-3">{["Tour di snorkeling e immersioni", "Safari nel deserto in quad", "Old Market e zona della moschea Al-Mustafa", "Tour della città e transfer privati"].map(s => <li key={s} className="flex gap-3 text-sm"><Check size={16} className="text-gold shrink-0" />{t(s)}</li>)}</ul><Button asChild className="mina-whatsapp mt-8"><a href={`https://wa.me/${MINA_WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle />{t("Chatta con Mina su WhatsApp")}</a></Button><a href={`https://wa.me/${MINA_WHATSAPP}`} className="mt-3 block text-sm text-muted-foreground">{t("+39 348 180 4764")}</a></div></div>
    </Section>
    <Section id="extras" eyebrow={t("04 / Ricordi, non soltanto giorni")} title={<>{t("Esperienze a Sharm el-Sheikh")} <em>{t("e nel Sinai.")}</em></>} intro={t("Pensate per chi cerca calma, spazio e qualcuno sul posto che conosce Sharm. Escursioni a Ras Mohammed e Tiran, snorkeling nel Mar Rosso, deserto e storia d’Egitto.")} className="bg-secondary"><div className="photo-grid">{EXTRAS.map(e => <PhotoCard key={e.id} title={t(e.name)} description={t(e.desc)} image={e.image} photo={t(e.photo)} focus={e.focus} selected={extras.includes(e.id)} onAdd={() => toggleExtra(e.id)} />)}</div>{extras.length > 0 && <Button asChild variant="link" className="mt-6"><a href="#book">{extras.length} {t("esperienze selezionate · vai al soggiorno")}<ArrowUpRight /></a></Button>}</Section>
    <Section id="explore" eyebrow={t("05 / La Sharm che ci piace")} title={<>{t("Sharm el-Sheikh: cosa vedere")} <em>{t("oltre il resort.")}</em></>} intro={t("Un tramonto, un profumo, una passeggiata. I luoghi che ti consigliamo di scoprire, un passo alla volta.")}><div className="photo-grid">{SPOTS.map(s => <PhotoCard key={s.name} title={t(s.name)} description={t(s.desc)} image={s.image} photo={t(s.photo)} />)}</div></Section>
    <Section id="restaurants" eyebrow={t("06 / I nostri consigli — dove mangiare")} title={t("Dove mangiare a Sharm: i più amati dai nostri ospiti")} intro={t("Una buona tavola fa parte del viaggio. Questi sono gli indirizzi che condividiamo con chi viene a trovarci.")} className="bg-secondary"><div className="restaurant-grid">{RESTAURANTS.map((r,i) => <article key={r.name} className="reveal restaurant-card"><span className="restaurant-number">{String(i + 1).padStart(2,"0")}</span><p className="restaurant-tag">{t(r.tag)}</p><h3>{r.name}</h3><p className="restaurant-desc">{t(r.desc)}</p><p className="restaurant-cuisine">{t("Tipo di cucina")} <span>{t(r.cuisine)}</span></p></article>)}</div><p className="mt-6 text-xs text-muted-foreground">{t("Per orari, menu e prenotazioni aggiornati, chiedi a Mina.")}</p></Section>
    <Section id="book" eyebrow={t("08 / Ci vediamo sul Mar Rosso")} title={<>{t("Prenota il tuo soggiorno.")}<br /><em>{t("Il tuo prossimo ricordo.")}</em></>} className="bg-secondary"><div className="reveal"><Booking extras={extras} toggleExtra={toggleExtra} /></div></Section>
    <Section id="faq" eyebrow={t("Prima di partire")} title={t("Domande frequenti")}><div className="reveal info-list">{FAQS.map(([q,a], i) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{i === 5 ? <>{a.split("viaggiaresicuri.it")[0]}<a href="https://www.viaggiaresicuri.it/" target="_blank" rel="noreferrer" className="underline">viaggiaresicuri.it</a>{a.split("viaggiaresicuri.it")[1]}</> : a}</p></details>)}</div></Section>
    <Invest />
    <Section id="lettere" eyebrow={t("Lettere dall’Oasi")} title={<>{t("Il Mar Rosso,")}<br /><em>{t("raccontato da chi ci torna sempre.")}</em></>}><div className="max-w-xl"><NewsletterSignup /></div></Section>
    <Section id="contatti" eyebrow={t("Contatti")} title={<>{t("Parliamone.")}<br /><em>{t("Come preferisci.")}</em></>} intro={t("Per informazioni, prenotazioni o investimenti: scrivi direttamente a Fulvio. Risponde di persona, su WhatsApp o via email.")}>
      <div className="reveal contact-buttons">
        <Button asChild className="contact-btn contact-whatsapp"><a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle />{t("Scrivici su WhatsApp")}</a></Button>
        <Button asChild variant="outline" className="contact-btn contact-email"><a href={`mailto:${OWNER_EMAIL}`}><Mail />{t("Scrivici via email")}</a></Button>
      </div>
    </Section>
    <section id="moovy" className="moovy-section site-section"><div className="site-container moovy-layout"><div className="reveal"><p className="eyebrow text-moovy">{t("MOBILITÀ, CON UN’ENERGIA NUOVA")}</p><img className="moovy-logo" src={moovyLogo.url} alt={t("MOOVY — Join the Movement. Join MOOVY.")} loading="lazy" width={1492} height={1023} /><p className="moovy-soon">{t("Coming Soon")}</p><p className="section-intro">{t("Il progetto di mobilità elettrica di Domina Coral Bay arriva presto.")}</p><div className="mt-8 flex items-center gap-3 text-moovy"><Bike size={25} /><span className="text-sm">{t("Elettrico. Leggero. Libero.")}</span></div></div><figure className="reveal moovy-photo"><img src={moovyBoy.url} alt={t("Bambino di spalle con sacca MOOVY, affacciato sul resort e sul mare")} loading="lazy" width={1440} height={1920} /></figure></div></section>
    <footer className="site-footer"><div className="site-container footer-layout"><div><a href="#top" className="brand"><Cartouche className="h-14 w-10" /><span>{t("Oasi del Faraone")}<small>{t("ESPERIENZE SUL MAR ROSSO")}</small></span></a><p className="mt-5 font-display text-xl italic text-muted-foreground">{t("Il tuo angolo d’Oriente sul Mar Rosso")}</p></div><div><p className="eyebrow">{t("Parliamone")}</p><p className="mt-5 text-sm">{t("Fulvio De Siena")}</p><a href={`https://wa.me/${OWNER_WHATSAPP}`} className="mt-2 block text-sm text-gold-light">{t("+39 334 732 8158")}</a><a href={`mailto:${OWNER_EMAIL}`} className="mt-2 block text-sm text-gold-light">{OWNER_EMAIL}</a><p className="mt-5 text-sm text-muted-foreground">{t("Domina Coral Bay")}<br />{t("Sharm el-Sheikh, Egitto")}</p></div><div><p className="eyebrow">{t("Restiamo in contatto")}</p><div className="mt-4 flex gap-3"><Button asChild variant="outline" size="icon"><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label={t("Instagram Oasi del Faraone")} title={t("Instagram @oasidelfaraone")}><Instagram /></a></Button><Button asChild variant="outline" size="icon"><a href={`https://wa.me/${OWNER_WHATSAPP}`} aria-label={t("WhatsApp Fulvio")} title={t("WhatsApp Fulvio")}><MessageCircle /></a></Button></div><p className="mt-3 text-xs text-muted-foreground">{t("Instagram · @oasidelfaraone")}</p><div className="mt-6"><p className="eyebrow mb-3">{t("Lettere dall’Oasi")}</p><NewsletterSignup compact /></div></div></div><div className="site-container footer-bottom"><span>{t("©")} {new Date().getFullYear()} {t("Oasi del Faraone")}</span><span>{t("Un piccolo angolo d’Egitto. Un grande ricordo.")}</span><a href={publicPath(language, "privacy")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t("Privacy e cookie")}</a><OwnerLoginLink /></div></footer>
    <CookieConsent />
  </main>;
}
const INVEST_TEXT = "Ciao Fulvio, vorrei informazioni sulle opportunità di investimento a Sharm";
function Invest() {
 const { t } = useLanguage();
  return <section id="investire" className="site-section invest-section"><div className="site-container invest-layout"><div className="reveal"><p className="eyebrow">{t("OPPORTUNITÀ")}</p><h2>{t("Investire a")}<br /><em>{t("Sharm el-Sheikh")}</em></h2><p className="section-intro">{t("Sharm interessa a chi investe per la domanda turistica tutto l’anno, il clima mite anche in inverno e i voli diretti dall’Italia. Valutiamo insieme numeri reali, caso per caso.")}</p></div><div className="reveal"><p className="eyebrow">{t("Cosa offriamo")}</p><ul className="mt-6 space-y-3">{["Affiancamento nella ricerca di unità al Domina Coral Bay e a Sharm", "Valutazione del potenziale di affitto breve", "Gestione e messa a reddito con il modello Oasi del Faraone", "Una rete locale di fiducia sul posto"].map(text => <li key={text} className="flex gap-3 text-sm"><Check size={16} className="text-gold shrink-0" />{t(text)}</li>)}</ul><Button asChild className="mt-8 h-12"><a href={wa(OWNER_WHATSAPP, t(INVEST_TEXT))} target="_blank" rel="noreferrer"><MessageCircle />{t("Parliamone su WhatsApp")}</a></Button></div></div></section>;
}
