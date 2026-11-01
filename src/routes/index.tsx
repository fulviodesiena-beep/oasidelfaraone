import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Check, Menu, X, MessageCircle, Instagram, Waves, Umbrella, Theater, Sparkles, Diamond, Flower2, Fish, Bike, Zap, QrCode, Image as ImageIcon, UserRound } from "lucide-react";
import resort from "@/assets/resort.jpg.asset.json";
import beach from "@/assets/beach.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Booking } from "@/components/site/Booking";
import { PhotoCard } from "@/components/site/PhotoCard";
import { EXTRAS, MINA_WHATSAPP, OWNER_WHATSAPP, RESTAURANTS, ROOM_AMENITIES, SPOTS, wa } from "@/lib/site-data";
import { SEASONS } from "@/lib/pricing";
const DESCRIPTION = "Oasi del Faraone — Elisir d’Oriente: appartamento con balcone per 4 persone al Domina Coral Bay, Sharm el-Sheikh. Tariffe, mare ed esperienze con Mina. Prenota direttamente con Fulvio.";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Oasi del Faraone | Elisir d’Oriente · Domina Coral Bay" },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: "Oasi del Faraone — Il tuo soggiorno sul Mar Rosso" },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});
export function Cartouche({ className = "h-10 w-8" }: { className?: string }) { return <svg viewBox="0 0 48 64" className={className} aria-hidden="true"><rect x="4" y="2" width="40" height="56" rx="20" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 61h32M20 48V28m8 20V28m-11 2h14m-14 5h14m-14 5h14" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="24" cy="17" r="6" className="fill-terracotta" /></svg>; }
function Section({ id, eyebrow, title, intro, children, className = "" }: { id?: string; eyebrow: string; title: ReactNode; intro?: string; children: ReactNode; className?: string }) { return <section id={id} className={`site-section ${className}`}><div className="site-container"><div className="reveal section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}</div>{children}</div></section>; }
function Placeholder({ label, portrait = false }: { label: string; portrait?: boolean }) { return <div className={`photo-placeholder ${portrait ? "portrait-placeholder" : ""}`}><span className="placeholder-corners" /><div>{portrait ? <UserRound size={40} strokeWidth={1} /> : <ImageIcon size={32} strokeWidth={1} />}<p className="mt-5 font-display text-3xl">{label}</p><p className="mt-2 text-xs text-muted-foreground">Foto reale in arrivo</p></div></div>; }
const NAV = [["apartment", "Appartamento"], ["resort", "Villaggio"], ["tariffe", "Tariffe"], ["extras", "Esperienze"], ["mina", "Mina"]];
const FACILITIES = [
 { name: "Spiagge private", icon: Umbrella, description: "Accesso diretto al Mar Rosso, per lasciarti il mondo alle spalle.", note: "Accesso incluso" },
 { name: "Piscine", icon: Waves, description: "Più piscine nel villaggio, ognuna con il suo ritmo.", note: "Accesso incluso" },
 { name: "Lago salato", icon: Waves, description: "Un luogo speciale, tra acqua salata e quiete, nel cuore del Domina.", note: "Accesso incluso" },
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
      <div className="hero-media"><img src={resort.url} width={1920} height={1080} alt="Veduta aerea ufficiale del Domina Coral Bay sul Mar Rosso" fetchPriority="high" /><img src={beach.url} width={1920} height={1080} alt="Spiaggia del Domina Coral Bay, fotografia ufficiale" className="hero-second" /></div><div className="hero-veil" /><div className="hero-shimmer" aria-hidden="true" />
      <div className="site-container hero-content"><p className="eyebrow">DOMINA CORAL BAY · SHARM EL-SHEIKH</p><h1>Oasi del Faraone</h1><p className="hero-subbrand">Elisir d’Oriente</p><p className="hero-tagline">Dove l’Egitto diventa un’oasi.<br />Solo per te.</p><div className="hero-actions"><Button asChild className="luxury-cta"><a href="#book">Il tuo prossimo soggiorno<ArrowUpRight /></a></Button><a className="hero-discover" href="#apartment">Entra nell’oasi<ArrowDown size={16} /></a></div></div>
      <div className="hero-bottom site-container"><span>27°57′ N · 34°23′ E</span><span>Mar Rosso, Egitto</span><a href="#apartment" aria-label="Scopri l’appartamento"><ArrowDown size={20} /></a></div>
    </section>
    <div className="intro-strip"><div className="site-container"><span>Un appartamento. Il tuo ritmo.</span><span>Fino a 4 ospiti</span><span>Il Mar Rosso, ogni giorno.</span></div></div>
    <Section id="apartment" eyebrow="01 / Il tuo angolo d’Oriente" title={<>Un rifugio privato.<br /><em>Un mare di possibilità.</em></>} intro="Un appartamento di 60 m², un balcone affacciato sulla piscina e il piacere di sentirsi a casa. Al Domina Coral Bay, ogni giornata comincia con una possibilità diversa.">
      <div className="reveal apartment-gallery"><Placeholder label="Il tuo appartamento" /><div className="grid gap-4"><Placeholder label="Il balcone" /><Placeholder label="La zona notte" /></div></div>
      <div className="reveal apartment-details"><div className="room-stats">{[["60", "metri quadrati"], ["4", "ospiti massimi"], ["Balcone", "vista piscina"]].map(([v,l]) => <div key={l}><p>{v}</p><span>{l}</span></div>)}</div><ul>{ROOM_AMENITIES.map(a => <li key={a}><Check size={14} />{a}</li>)}</ul></div>
      <p className="reveal room-note">Wi-Fi non disponibile in camera. Spa a pagamento separato, bambini non ammessi. Ristoranti e bar si vivono à la carte.</p>
    </Section>
    <Section id="resort" eyebrow="02 / Una destinazione nella destinazione" title={<>Il villaggio, <em>da vivere.</em></>} intro="Spiagge private, piscine, lago salato e serate sotto le stelle. Il soggiorno ti dà accesso alle strutture del Domina Coral Bay; ristoranti, bar e attività a pagamento si scelgono separatamente." className="bg-secondary">
      <div className="reveal resort-banner"><img src={beach.url} alt="Spiaggia del resort Domina Coral Bay, foto ufficiale" loading="lazy" width={1600} height={800} /><span>DOMINA CORAL BAY · FOTO UFFICIALE</span></div>
      <div className="facilities-grid">{FACILITIES.map(f => <article key={f.name} className="reveal facility"><f.icon size={27} strokeWidth={1.2} /><h3>{f.name}</h3><p>{f.description}</p><span>{f.note}</span></article>)}</div>
    </Section>
    <section id="moovy" className="moovy-section site-section"><div className="site-container moovy-layout"><div className="reveal"><p className="eyebrow text-moovy">MOBILITÀ, CON UN’ENERGIA NUOVA</p><div className="moovy-brand"><Zap strokeWidth={1.4} /><span>MOOVY</span></div><h2>Muoviti nel Villaggio<br />con MOOVY</h2><p className="section-intro">MOOVY porta la mobilità elettrica nel Domina Coral Bay. Scooter elettrici, biciclette e monopattini disponibili all’interno del villaggio per spostarti in totale libertà, comodità e rispetto per l’ambiente.</p><div className="mt-8 flex items-center gap-3 text-moovy"><Bike size={25} /><span className="text-sm">Elettrico. Leggero. Libero.</span></div></div><div className="reveal moovy-download"><div className="qr-placeholder" aria-label="Segnaposto QR MOOVY, non scansionabile"><QrCode size={128} strokeWidth={1} /><span>QR IN ARRIVO</span></div><h3>Scarica l’app MOOVY</h3><p>Disponibile presto al Domina Coral Bay</p></div></div></section>
    <Section id="mina" eyebrow="03 / Il tuo amico sul posto" title="La tua guida a Sharm — Mina">
      <div className="mina-layout"><div className="reveal"><Placeholder label="Mina, il tuo amico a Sharm" portrait /></div><div className="reveal mina-copy"><p className="font-display text-3xl leading-snug">Il nostro fidato amico sul posto. Mina conosce ogni barriera corallina e gli angoli più autentici di Sharm.</p><p className="mt-6 text-muted-foreground leading-relaxed">Mina conosce Sharm come pochi. Nato e cresciuto qui, è la persona giusta per scoprire la vera essenza di questo luogo — dai fondali della barriera corallina alle strade del mercato notturno, dalle escursioni nel deserto ai migliori tavoli in città. Con Mina, non sei un turista: sei un ospite.</p><ul className="mt-8 space-y-3">{["Tour di snorkeling e immersioni", "Safari nel deserto in quad", "Old Market e zona della moschea Al-Mustafa", "Tour della città e transfer privati"].map(s => <li key={s} className="flex gap-3 text-sm"><Check size={16} className="text-gold shrink-0" />{s}</li>)}</ul><Button asChild className="mina-whatsapp mt-8"><a href={wa(MINA_WHATSAPP, "Ciao Mina! Vorrei scoprire Sharm con te.")} target="_blank" rel="noreferrer"><MessageCircle />Chatta con Mina su WhatsApp</a></Button><a href={`https://wa.me/${MINA_WHATSAPP}`} className="mt-3 block text-sm text-muted-foreground">+20 150 120 2025</a></div></div>
    </Section>
    <Section id="extras" eyebrow="04 / Ricordi, non soltanto giorni" title={<>Lasciati portare <em>altrove.</em></>} intro="Dal silenzio del deserto ai colori della barriera corallina. Scegli le esperienze che ti somigliano: Mina ti aiuterà a organizzarle." className="bg-secondary"><div className="photo-grid">{EXTRAS.map(e => <PhotoCard key={e.id} title={e.name} description={e.desc} image={e.image} photo={e.photo} price={e.price === null ? "Prezzo su richiesta" : "€15 a persona"} selected={extras.includes(e.id)} onAdd={() => toggleExtra(e.id)} />)}</div>{extras.length > 0 && <Button asChild variant="link" className="mt-6"><a href="#book">{extras.length} esperienze selezionate · vai al soggiorno<ArrowUpRight /></a></Button>}</Section>
    <Section id="explore" eyebrow="05 / La Sharm che ci piace" title={<>Oltre i cancelli <em>del resort.</em></>} intro="Un tramonto, un profumo, una passeggiata. I luoghi che ti consigliamo di scoprire, un passo alla volta."><div className="photo-grid">{SPOTS.map(s => <PhotoCard key={s.name} title={s.name} description={s.desc} image={s.image} photo={s.photo} />)}</div></Section>
    <Section id="restaurants" eyebrow="06 / I nostri consigli — dove mangiare" title="I più amati dai nostri ospiti" intro="Una buona tavola fa parte del viaggio. Questi sono gli indirizzi che condividiamo con chi viene a trovarci." className="bg-secondary"><div className="restaurant-grid">{RESTAURANTS.map((r,i) => <article key={r.name} className="reveal restaurant-card"><span className="restaurant-number">{String(i + 1).padStart(2,"0")}</span><p className="restaurant-tag">{r.tag}</p><h3>{r.name}</h3><p className="restaurant-desc">{r.desc}</p><p className="restaurant-cuisine">Tipo di cucina <span>{r.cuisine}</span></p></article>)}</div><p className="mt-6 text-xs text-muted-foreground">Per orari, menu e prenotazioni aggiornati, chiedi a Mina.</p></Section>
    <Section id="tariffe" eyebrow="07 / Il valore del tuo soggiorno" title={<>Un’oasi tutta tua.<br /><em>Una tariffa, fino a 4 ospiti.</em></>} intro="Il prezzo è per appartamento, non per persona. Scegli la stagione che preferisci."><div className="season-grid">{SEASONS.map(s => <article key={s.id} className="reveal season-card"><p className="eyebrow">Stagione {s.name}</p><p className="season-price">€{s.range}</p><span className="text-xs text-muted-foreground">a notte · intero appartamento</span><p className="season-period">{s.period}</p></article>)}</div><div className="reveal pricing-notes"><p>Il preventivo usa tariffe indicative: €75 bassa, €95 media, €130 alta e €170 picco. Il prezzo finale viene confermato da Fulvio.</p><p>Picco a Pasqua e Pasquetta. Gennaio dopo il 6, febbraio e dicembre prima del 20: prezzo su richiesta.</p><p>Accesso a spiagge, piscine, lago salato, teatro e animazione. Ristoranti e bar à la carte. Spa e casinò a pagamento separato.</p></div></Section>
    <Section id="book" eyebrow="08 / Ci vediamo sul Mar Rosso" title={<>Le tue date.<br /><em>Il tuo prossimo ricordo.</em></>} className="bg-secondary"><div className="reveal"><Booking extras={extras} toggleExtra={toggleExtra} /></div></Section>
    <Section id="info" eyebrow="Prima di partire" title="Le cose da sapere"><div className="reveal info-list">{[
      ["Arrivo e partenza", "Check-in dalle 15:00, check-out entro le 11:00. Per esigenze diverse, contatta Fulvio."],
      ["Servizi e accesso al villaggio", "Fino a 4 persone, accesso a spiagge private, piscine, lago salato e intrattenimento. Ristoranti e bar à la carte. La spa è a pagamento e non ammette bambini; il casinò è a pagamento e riservato agli adulti."],
      ["Wi-Fi e dotazioni", "Il Wi-Fi non è disponibile in camera. L’appartamento dispone di un balcone e delle dotazioni elencate nella sezione appartamento. La macchina da caffè non è presente."],
      ["Transfer dall’aeroporto", "Transfer a €15 per persona. Organizza arrivo e dettagli direttamente con Mina al +20 150 120 2025."],
      ["Documenti di viaggio", "Verifica documenti, visti e requisiti di ingresso aggiornati prima della partenza, tramite le fonti ufficiali. Fulvio ti darà le indicazioni per la delega ospiti del resort."],
    ].map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></Section>
    <RealEstate />
    <footer className="site-footer"><div className="site-container footer-layout"><div><a href="#top" className="brand"><Cartouche className="h-14 w-10" /><span>Oasi del Faraone<small>ELISIR D’ORIENTE</small></span></a><p className="mt-5 font-display text-xl italic text-muted-foreground">Il tuo angolo d’Oriente sul Mar Rosso</p></div><div><p className="eyebrow">Parliamone</p><p className="mt-5 text-sm">Fulvio De Siena</p><a href={`https://wa.me/${OWNER_WHATSAPP}`} className="mt-2 block text-sm text-gold-light">+39 334 732 8158</a><p className="mt-5 text-sm text-muted-foreground">Domina Coral Bay<br />Sharm el-Sheikh, Egitto</p></div><div><p className="eyebrow">Restiamo in contatto</p><div className="mt-4 flex gap-3"><Button variant="outline" size="icon" disabled aria-label="Instagram — profilo in arrivo" title="Instagram — profilo in arrivo"><Instagram /></Button><Button asChild variant="outline" size="icon"><a href={`https://wa.me/${OWNER_WHATSAPP}`} aria-label="WhatsApp Fulvio" title="WhatsApp Fulvio"><MessageCircle /></a></Button></div><p className="mt-3 text-xs text-muted-foreground">Instagram · prossimamente</p></div></div><div className="site-container footer-bottom"><span>© {new Date().getFullYear()} Oasi del Faraone</span><span>Un piccolo angolo d’Egitto. Un grande ricordo.</span></div></footer>
  </main>;
}
function RealEstate() {
  const [opened, setOpened] = useState(false);
  return <section id="invest" className="site-section invest-section"><div className="site-container invest-layout"><div className="reveal"><p className="eyebrow">IMPREZA REAL ESTATE</p><h2>Vuoi investire al<br /><em>Domina Coral Bay?</em></h2><p className="section-intro">Acquistare un appartamento in uno dei resort più esclusivi del Mar Rosso è più semplice di quanto pensi. Raccogli le tue domande, ti mettiamo in contatto con i nostri partner.</p><span className="invest-mark" aria-hidden="true">Impreza.</span></div><form className="reveal invest-form" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); window.open(wa(OWNER_WHATSAPP, `Richiesta Impreza Real Estate\n${[...f.entries()].map(([k,v]) => `${k}: ${v}`).join("\n")}`), "_blank", "noopener,noreferrer"); setOpened(true); }}><label>Nome<input required name="Nome" autoComplete="name" className="field" /></label><label>Email<input required name="Email" type="email" autoComplete="email" className="field" /></label><label>Telefono<input required name="Telefono" type="tel" autoComplete="tel" className="field" /></label><label>Tipo di interesse<select name="Tipo di interesse" className="field">{["Acquisto appartamento", "Investimento", "Informazioni generali"].map(o => <option key={o}>{o}</option>)}</select></label><label className="sm:col-span-2">Messaggio<textarea name="Messaggio" rows={3} className="field" /></label><Button type="submit" className="h-12 sm:col-span-2"><MessageCircle />Parliamone su WhatsApp</Button>{opened && <p role="status" className="text-sm text-gold-light sm:col-span-2">Il messaggio è pronto su WhatsApp: invialo per contattare Fulvio.</p>}</form></div></section>;
}
