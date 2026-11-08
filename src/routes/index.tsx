import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Check, Menu, X, MessageCircle, Instagram, Mail, Waves, Umbrella, Theater, Sparkles, Diamond, Flower2, Fish, Bike, Volleyball, ChevronLeft, ChevronRight } from "lucide-react";
import moovyLogo from "@/assets/moovy-logo.png.asset.json";
import moovyBoy from "@/assets/moovy-boy.jpg.asset.json";
import minaPortrait from "@/assets/mina-portrait.png.asset.json";
import { Button } from "@/components/ui/button";
import { Booking } from "@/components/site/Booking";
import { PhotoCard } from "@/components/site/PhotoCard";
import { APARTMENT_PHOTOS, EXTRAS, HERO_PHOTOS, INSTAGRAM_URL, MINA_WHATSAPP, OWNER_EMAIL, OWNER_WHATSAPP, RESTAURANTS, ROOM_AMENITIES, SPOTS, VILLAGE_PHOTOS, wa } from "@/lib/site-data";
import { CLEANING_FEE, SEASONS } from "@/lib/pricing";
import { CookieConsent } from "@/components/site/CookieConsent";
import { captureAttribution } from "@/lib/tracking";
const TITLE = "Appartamento a Sharm el-Sheikh · Domina Coral Bay | Oasi del Faraone";
const DESCRIPTION = "Appartamento privato fino a 4 ospiti al Domina Coral Bay, Sharm el-Sheikh. Balcone vista piscina, spiagge e piscine del resort incluse. Preventivo in 2 minuti.";
const SITE_URL = "https://oasidelfaraone.it";
const OG_IMAGE = `${SITE_URL}${HERO_PHOTOS[0]?.src ?? ""}`;
const FAQS: [string, ReactNode, string][] = [
  ["Cosa è incluso nel soggiorno?", "Spiagge, piscine, padel, beach volley e animazione del resort Domina Coral Bay sono inclusi, senza costi aggiuntivi. Ristoranti e bar sono à la carte; spa e casinò sono a pagamento.", ""],
  ["C’è il Wi‑Fi?", "In camera il Wi‑Fi non è disponibile. Consigliamo una eSIM o una SIM locale: ti diamo noi le indicazioni prima della partenza.", ""],
  ["Quante persone può ospitare l’appartamento?", "Fino a 4 ospiti. Il prezzo è per appartamento, non per persona.", ""],
  ["Le pulizie sono incluse?", "La pulizia finale costa 40 € e si paga in reception al check-in, alla consegna delle chiavi. Pulizie extra si richiedono in reception, a pagamento.", ""],
  ["Quali sono gli orari di check-in e check-out?", "Check-in dalle 15:00, check-out entro le 11:00.", ""],
  ["Serve il visto per l’Egitto?", <>Verifica sempre i requisiti aggiornati sul sito ufficiale <a href="https://www.viaggiaresicuri.it/" target="_blank" rel="noreferrer" className="underline">viaggiaresicuri.it</a> della Farnesina prima di partire.</>, "Verifica sempre i requisiti aggiornati sul sito ufficiale viaggiaresicuri.it della Farnesina prima di partire."],
  ["Come si arriva dall’aeroporto di Sharm?", "Il transfer dall’aeroporto è organizzato dal nostro referente sul posto, Mina (+39 348 180 4764).", ""],
  ["Come prenoto?", "Scegli le date sul sito e invia la richiesta: Fulvio ti risponde di persona e conferma la prenotazione via WhatsApp o email.", ""],
];
const JSONLD = [
  { "@context": "https://schema.org", "@type": ["VacationRental", "LodgingBusiness"],
    name: "Oasi del Faraone – Elisir d'Oriente", description: DESCRIPTION, url: SITE_URL, image: OG_IMAGE,
    address: { "@type": "PostalAddress", streetAddress: "Domina Coral Bay", addressLocality: "Sharm el-Sheikh", addressRegion: "South Sinai", addressCountry: "EG" },
    geo: { "@type": "GeoCoordinates", latitude: 27.95, longitude: 34.38 },
    numberOfRooms: 1, occupancy: { "@type": "QuantitativeValue", maxValue: 4 },
    floorSize: { "@type": "QuantitativeValue", value: 60, unitCode: "MTK" },
    amenityFeature: [["Aria condizionata", true], ["TV satellitare", true], ["Cassaforte", true], ["Bollitore", true], ["Microonde", true], ["Vasca e doccia", true], ["Balcone vista piscina", true], ["Wi-Fi in camera", false]].map(([name, value]) => ({ "@type": "LocationFeatureSpecification", name, value })),
    checkinTime: "15:00", checkoutTime: "11:00", telephone: "+393347328158", email: "prenotazionisharm@gmail.com" },
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(([q, a, t]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: t || a } })) },
  { "@context": "https://schema.org", "@type": "Organization", name: "Oasi del Faraone", url: SITE_URL, email: "prenotazionisharm@gmail.com", telephone: "+393347328158", sameAs: ["https://www.instagram.com/oasidelfaraone/"] },
];
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "it_IT" },
    { property: "og:site_name", content: "Oasi del Faraone" },
    { property: "og:url", content: `${SITE_URL}/` },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: TITLE },
    { name: "twitter:description", content: DESCRIPTION },
    { name: "twitter:image", content: OG_IMAGE },
  ],
  links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  scripts: JSONLD.map(j => ({ type: "application/ld+json", children: JSON.stringify(j) })),
  }), component: Index,
});
export function Cartouche({ className = "h-10 w-8" }: { className?: string }) { return <svg viewBox="0 0 48 64" className={className} aria-hidden="true"><rect x="4" y="2" width="40" height="56" rx="20" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 61h32M20 48V28m8 20V28m-11 2h14m-14 5h14m-14 5h14" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="24" cy="17" r="6" className="fill-terracotta" /></svg>; }
function Section({ id, eyebrow, title, intro, children, className = "" }: { id?: string; eyebrow: string; title: ReactNode; intro?: string; children: ReactNode; className?: string }) { return <section id={id} className={`site-section ${className}`}><div className="site-container"><div className="reveal section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}</div>{children}</div></section>; }
function Racket({ size = 27, strokeWidth = 1.2 }: { size?: number; strokeWidth?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true"><ellipse cx="14" cy="9" rx="6.5" ry="7" /><path d="M9.5 14 4 21.5M3 20.5l1.5 1.5" /><circle cx="12" cy="7" r=".6" /><circle cx="15.5" cy="7" r=".6" /><circle cx="13.5" cy="10.5" r=".6" /></svg>; }
type Slide = { src: string; alt: string };
const HERO: Slide[] = HERO_PHOTOS;
function Carousel({ slides, label, portrait = false }: { slides: Slide[]; label: string; portrait?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * .8, behavior: "smooth" });
  return <div className={`reveal carousel ${portrait ? "carousel-portrait" : ""}`}><div ref={ref} className="carousel-track" role="region" aria-label={label} tabIndex={0}>{slides.map((s, i) => <figure key={i} className="carousel-slide"><img src={s.src} alt={s.alt} loading={i < 2 ? "eager" : "lazy"} width={portrait ? 1080 : 1200} height={portrait ? 1350 : 800} /><figcaption>{s.alt}</figcaption></figure>)}</div><div className="carousel-controls"><Button variant="outline" size="icon" aria-label="Foto precedente" onClick={() => go(-1)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Foto successiva" onClick={() => go(1)}><ChevronRight /></Button></div></div>;
}
const NAV = [["apartment", "Appartamento"], ["resort", "Villaggio"], ["tariffe", "Tariffe"], ["extras", "Esperienze"], ["mina", "Mina"], ["faq", "FAQ"], ["investire", "Investire"]];
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
function Index() {
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
      <a href="#top" className="brand" onClick={() => setMenu(false)}><Cartouche /><span>Oasi del Faraone<small>ELISIR D’ORIENTE</small></span></a>
      <nav aria-label="Navigazione principale" className="hidden items-center gap-7 lg:flex">{NAV.map(([id, name]) => <a key={id} href={`#${id}`} className="nav-link">{name}</a>)}</nav>
      <div className="flex items-center gap-2"><Button asChild className="nav-book"><a href="#book" onClick={() => setMenu(false)}>PRENOTA<ArrowUpRight /></a></Button><Button variant="ghost" size="icon" className="lg:hidden" aria-label={menu ? "Chiudi menu" : "Apri menu"} aria-expanded={menu} onClick={() => setMenu(v => !v)}>{menu ? <X /> : <Menu />}</Button></div>
    </div>{menu && <nav aria-label="Navigazione mobile" className="mobile-menu site-container">{NAV.map(([id, name]) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>{name}</a>)}</nav>}</header>
    <section id="top" ref={heroRef} className="hero">
      <div className="hero-media">{HERO.map((h, i) => <img key={h.src} src={h.src} width={1920} height={1080} alt={h.alt} className={`hero-slide hero-slide-${i}`} fetchPriority={i === 0 ? "high" : "auto"} />)}</div><div className="hero-veil" /><div className="hero-shimmer" aria-hidden="true" />
      <div className="site-container hero-content"><p className="eyebrow">DOMINA CORAL BAY · SHARM EL-SHEIKH</p><h1>Oasi del Faraone<span className="sr-only"> – appartamento al Domina Coral Bay, Sharm el-Sheikh</span></h1><p className="hero-subbrand">Elisir d’Oriente · Appartamento al Domina Coral Bay</p><p className="hero-tagline">Il tuo rifugio privato nel cuore del Mar Rosso</p><p className="hero-sub">Relax assoluto. Privacy totale. Esclusività che non si trova ovunque.</p><div className="hero-actions"><Button asChild className="luxury-cta"><a href="#book">Il tuo prossimo soggiorno<ArrowUpRight /></a></Button><a className="hero-discover" href="#apartment">Entra nell’oasi<ArrowDown size={16} /></a></div></div>
      <div className="hero-bottom site-container"><span>27°57′ N · 34°23′ E</span><span>Mar Rosso, Egitto</span><a href="#apartment" aria-label="Scopri l’appartamento"><ArrowDown size={20} /></a></div>
    </section>
    <div className="intro-strip"><div className="site-container"><span>Il tuo rifugio privato.</span><span>Fino a 4 ospiti</span><span>Il Mar Rosso, ogni giorno.</span></div></div>
    <Section id="apartment" eyebrow="01 / Il tuo angolo d’Oriente" title={<>L’appartamento.<br /><em>La tua casa vacanze a Sharm.</em></>} intro="Un appartamento di 60 m² per fino a 4 ospiti, con balcone vista piscina, nel villaggio Domina Coral Bay. Il punto di partenza ideale per una vacanza relax al sole sul Mar Rosso.">
      <Carousel slides={APARTMENT_PHOTOS} label="Foto dell’appartamento" portrait />
      <div className="reveal apartment-details"><div className="room-stats">{[["60", "metri quadrati"], ["4", "ospiti massimi"], ["Balcone", "vista piscina"]].map(([v,l]) => <div key={l}><p>{v}</p><span>{l}</span></div>)}</div><ul>{ROOM_AMENITIES.map(a => <li key={a}><Check size={14} />{a}</li>)}</ul></div>
      <p className="reveal room-note">Wi-Fi non disponibile in camera. Spa a pagamento separato, bambini non ammessi. Ristoranti e bar si vivono à la carte.</p>
    </Section>
    <Section id="resort" eyebrow="02 / Una destinazione nella destinazione" title={<>Il villaggio <em>Domina Coral Bay.</em></>} intro="Spiagge private, piscine, padel, beach volley e serate sotto le stelle. Spiagge e piscine del resort incluse, senza costi aggiuntivi; ristoranti, bar e attività a pagamento si scelgono separatamente." className="bg-secondary">
      <Carousel slides={VILLAGE_PHOTOS} label="Foto del villaggio" />
      <div className="facilities-grid">{FACILITIES.map(f => <article key={f.name} className="reveal facility"><f.icon size={27} strokeWidth={1.2} /><h3>{f.name}</h3><p>{f.description}</p><span>{f.note}</span></article>)}</div>
    </Section>
    <Section id="mina" eyebrow="03 / Il tuo amico sul posto" title="Mina, la tua guida a Sharm el-Sheikh">
      <div className="mina-layout"><figure className="reveal mina-photo"><img src={minaPortrait.url} alt="Mina, il tuo referente a Sharm el-Sheikh" loading="lazy" width={944} height={970} /></figure><div className="reveal mina-copy"><p className="font-display text-3xl leading-snug">Il tuo referente sul posto, un nostro fidato amico. Mina conosce ogni barriera corallina e gli angoli più autentici di Sharm.</p><p className="mt-6 text-muted-foreground leading-relaxed">Mina conosce Sharm come pochi. Nato e cresciuto qui, è la persona giusta per scoprire la vera essenza di questo luogo — dai fondali della barriera corallina alle strade del mercato notturno, dalle escursioni nel deserto ai migliori tavoli in città. Lui gestirà ogni dettaglio per te. Con Mina, non sei un turista: sei un ospite.</p><ul className="mt-8 space-y-3">{["Tour di snorkeling e immersioni", "Safari nel deserto in quad", "Old Market e zona della moschea Al-Mustafa", "Tour della città e transfer privati"].map(s => <li key={s} className="flex gap-3 text-sm"><Check size={16} className="text-gold shrink-0" />{s}</li>)}</ul><Button asChild className="mina-whatsapp mt-8"><a href={`https://wa.me/${MINA_WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle />Chatta con Mina su WhatsApp</a></Button><a href={`https://wa.me/${MINA_WHATSAPP}`} className="mt-3 block text-sm text-muted-foreground">+39 348 180 4764</a></div></div>
    </Section>
    <Section id="extras" eyebrow="04 / Ricordi, non soltanto giorni" title={<>Esperienze a Sharm el-Sheikh <em>e nel Sinai.</em></>} intro="Pensate per chi cerca calma, spazio e qualcuno sul posto che conosce Sharm. Escursioni a Ras Mohammed e Tiran, snorkeling nel Mar Rosso, deserto e storia d’Egitto." className="bg-secondary"><div className="photo-grid">{EXTRAS.map(e => <PhotoCard key={e.id} title={e.name} description={e.desc} image={e.image} photo={e.photo} focus={e.focus} selected={extras.includes(e.id)} onAdd={() => toggleExtra(e.id)} />)}</div>{extras.length > 0 && <Button asChild variant="link" className="mt-6"><a href="#book">{extras.length} esperienze selezionate · vai al soggiorno<ArrowUpRight /></a></Button>}</Section>
    <Section id="explore" eyebrow="05 / La Sharm che ci piace" title={<>Sharm el-Sheikh: cosa vedere <em>oltre il resort.</em></>} intro="Un tramonto, un profumo, una passeggiata. I luoghi che ti consigliamo di scoprire, un passo alla volta."><div className="photo-grid">{SPOTS.map(s => <PhotoCard key={s.name} title={s.name} description={s.desc} image={s.image} photo={s.photo} />)}</div></Section>
    <Section id="restaurants" eyebrow="06 / I nostri consigli — dove mangiare" title="Dove mangiare a Sharm: i più amati dai nostri ospiti" intro="Una buona tavola fa parte del viaggio. Questi sono gli indirizzi che condividiamo con chi viene a trovarci." className="bg-secondary"><div className="restaurant-grid">{RESTAURANTS.map((r,i) => <article key={r.name} className="reveal restaurant-card"><span className="restaurant-number">{String(i + 1).padStart(2,"0")}</span><p className="restaurant-tag">{r.tag}</p><h3>{r.name}</h3><p className="restaurant-desc">{r.desc}</p><p className="restaurant-cuisine">Tipo di cucina <span>{r.cuisine}</span></p></article>)}</div><p className="mt-6 text-xs text-muted-foreground">Per orari, menu e prenotazioni aggiornati, chiedi a Mina.</p></Section>
    <Section id="tariffe" eyebrow="07 / Il valore del tuo soggiorno" title={<>Tariffe e disponibilità.<br /><em>Una tariffa, fino a 4 ospiti.</em></>} intro="Il prezzo è per appartamento, non per persona. Scegli la stagione che preferisci."><div className="season-grid">{SEASONS.map(s => <article key={s.id} className="reveal season-card"><p className="eyebrow">Stagione {s.name}</p><p className="season-price">€{s.range}</p><span className="text-xs text-muted-foreground">a notte · intero appartamento</span><p className="season-period">{s.period}</p></article>)}</div><div className="reveal pricing-notes"><p>Prezzo a notte per l’intero appartamento, fino a 4 ospiti. Il prezzo finale viene confermato da Fulvio.</p><p>Settimana di Pasqua: dal giovedì prima al lunedì dopo. Soggiorno minimo consigliato: 3 notti, 5 se il soggiorno tocca il Picco.</p><p>Pulizia finale {CLEANING_FEE} € non inclusa: si paga in reception al check-in.</p><p>Spiagge e piscine del resort incluse, senza costi aggiuntivi, insieme a padel, beach volley, teatro e animazione. Ristoranti e bar à la carte. Spa e casinò a pagamento separato.</p></div></Section>
    <Section id="book" eyebrow="08 / Ci vediamo sul Mar Rosso" title={<>Prenota il tuo soggiorno.<br /><em>Il tuo prossimo ricordo.</em></>} className="bg-secondary"><div className="reveal"><Booking extras={extras} toggleExtra={toggleExtra} /></div></Section>
    <Section id="faq" eyebrow="Prima di partire" title="Domande frequenti"><div className="reveal info-list">{FAQS.map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></Section>
    <Invest />
    <Section id="contatti" eyebrow="Contatti" title={<>Parliamone.<br /><em>Come preferisci.</em></>} intro="Per informazioni, prenotazioni o investimenti: scrivi direttamente a Fulvio. Risponde di persona, su WhatsApp o via email.">
      <div className="reveal contact-buttons">
        <Button asChild className="contact-btn contact-whatsapp"><a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer"><MessageCircle />Scrivici su WhatsApp</a></Button>
        <Button asChild variant="outline" className="contact-btn contact-email"><a href={`mailto:${OWNER_EMAIL}`}><Mail />Scrivici via email</a></Button>
      </div>
    </Section>
    <section id="moovy" className="moovy-section site-section"><div className="site-container moovy-layout"><div className="reveal"><p className="eyebrow text-moovy">MOBILITÀ, CON UN’ENERGIA NUOVA</p><img className="moovy-logo" src={moovyLogo.url} alt="MOOVY — Join the Movement. Join MOOVY." loading="lazy" width={1492} height={1023} /><p className="moovy-soon">Coming Soon</p><p className="section-intro">Il progetto di mobilità elettrica di Domina Coral Bay arriva presto.</p><div className="mt-8 flex items-center gap-3 text-moovy"><Bike size={25} /><span className="text-sm">Elettrico. Leggero. Libero.</span></div></div><figure className="reveal moovy-photo"><img src={moovyBoy.url} alt="Bambino di spalle con sacca MOOVY, affacciato sul resort e sul mare" loading="lazy" width={1440} height={1920} /></figure></div></section>
    <footer className="site-footer"><div className="site-container footer-layout"><div><a href="#top" className="brand"><Cartouche className="h-14 w-10" /><span>Oasi del Faraone<small>ELISIR D’ORIENTE</small></span></a><p className="mt-5 font-display text-xl italic text-muted-foreground">Il tuo angolo d’Oriente sul Mar Rosso</p></div><div><p className="eyebrow">Parliamone</p><p className="mt-5 text-sm">Fulvio De Siena</p><a href={`https://wa.me/${OWNER_WHATSAPP}`} className="mt-2 block text-sm text-gold-light">+39 334 732 8158</a><a href={`mailto:${OWNER_EMAIL}`} className="mt-2 block text-sm text-gold-light">{OWNER_EMAIL}</a><p className="mt-5 text-sm text-muted-foreground">Domina Coral Bay<br />Sharm el-Sheikh, Egitto</p></div><div><p className="eyebrow">Restiamo in contatto</p><div className="mt-4 flex gap-3"><Button asChild variant="outline" size="icon"><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram Oasi del Faraone" title="Instagram @oasidelfaraone"><Instagram /></a></Button><Button asChild variant="outline" size="icon"><a href={`https://wa.me/${OWNER_WHATSAPP}`} aria-label="WhatsApp Fulvio" title="WhatsApp Fulvio"><MessageCircle /></a></Button></div><p className="mt-3 text-xs text-muted-foreground">Instagram · @oasidelfaraone</p></div></div><div className="site-container footer-bottom"><span>© {new Date().getFullYear()} Oasi del Faraone</span><span>Un piccolo angolo d’Egitto. Un grande ricordo.</span><a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy e cookie</a><a href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Gestionale</a></div></footer>
    <CookieConsent />
  </main>;
}
const INVEST_TEXT = "Ciao Fulvio, vorrei informazioni sulle opportunità di investimento a Sharm";
function Invest() {
  return <section id="investire" className="site-section invest-section"><div className="site-container invest-layout"><div className="reveal"><p className="eyebrow">OPPORTUNITÀ</p><h2>Investire a<br /><em>Sharm el-Sheikh</em></h2><p className="section-intro">Sharm interessa a chi investe per la domanda turistica tutto l’anno, il clima mite anche in inverno e i voli diretti dall’Italia. Valutiamo insieme numeri reali, caso per caso.</p></div><div className="reveal"><p className="eyebrow">Cosa offriamo</p><ul className="mt-6 space-y-3">{["Affiancamento nella ricerca di unità al Domina Coral Bay e a Sharm", "Valutazione del potenziale di affitto breve", "Gestione e messa a reddito con il modello Oasi del Faraone", "Una rete locale di fiducia sul posto"].map(t => <li key={t} className="flex gap-3 text-sm"><Check size={16} className="text-gold shrink-0" />{t}</li>)}</ul><Button asChild className="mt-8 h-12"><a href={wa(OWNER_WHATSAPP, INVEST_TEXT)} target="_blank" rel="noreferrer"><MessageCircle />Parliamone su WhatsApp</a></Button></div></div></section>;
}
