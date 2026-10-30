import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import mina from "@/assets/mina.jpg";
import desert from "@/assets/desert.jpg";
import reef from "@/assets/reef.jpg";
import { Booking } from "@/components/site/Booking";
import { EXTRAS, MINA_WHATSAPP, OWNER_WHATSAPP, RESTAURANTS, SPOTS, wa } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oasi del Faraone — Elisir d'Oriente · Domina Coral Bay, Sharm el-Sheikh" },
      { name: "description", content: "Book a 60m² pool-view apartment at Domina Coral Bay, Sharm el-Sheikh. Sleeps 5, free Spa Élisir, private beach, excursions with our local guide Mina." },
      { property: "og:title", content: "Oasi del Faraone — Il tuo angolo d'Oriente sul Mar Rosso" },
      { property: "og:description", content: "A premium apartment at Domina Coral Bay, Sharm el-Sheikh. Book direct." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const HERO = [hero1, hero2, hero3];

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function Cartouche({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden>
      <rect x="4" y="2" width="40" height="56" rx="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <line x1="8" y1="61" x2="40" y2="61" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="17" r="6" className="fill-terracotta" />
      <path d="M20 48V28M28 48V28M17 30h14M17 35h14M17 40h14" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

function Section({ id, eyebrow, title, intro, children, className = "" }: { id?: string; eyebrow: string; title: ReactNode; intro?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`px-5 py-24 sm:px-8 md:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-14 max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-4 text-4xl leading-tight sm:text-6xl">{title}</h2>
          {intro && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Index() {
  useReveal();
  const [slide, setSlide] = useState(0);
  const [extras, setExtras] = useState<string[]>([]);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO.length), 6000);
    const onS = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onS);
    return () => { clearInterval(t); window.removeEventListener("scroll", onS); };
  }, []);
  const toggleExtra = (id: string) => setExtras((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));

  return (
    <main className="overflow-x-hidden">
      {/* NAV */}
      <header className={`fixed inset-x-0 top-0 z-50 transition ${scrolled ? "bg-navy-deep/90 backdrop-blur border-b border-border" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3 text-gold">
            <Cartouche className="h-9 w-7" />
            <span className="font-display text-xl text-foreground">Oasi del Faraone</span>
          </a>
          <nav className="hidden gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
            <a href="#apartment" className="hover:text-gold">Apartment</a>
            <a href="#resort" className="hover:text-gold">Resort</a>
            <a href="#extras" className="hover:text-gold">Experiences</a>
            <a href="#info" className="hover:text-gold">Info</a>
          </nav>
          <a href="#book" className="border border-gold px-4 py-2 text-xs uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-primary-foreground">Book</a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative h-[100svh] min-h-[600px] overflow-hidden">
        {HERO.map((src, i) => (
          <img key={src} src={src} alt="" width={1920} height={1088} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ${i === slide ? "kenburns opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-veil" />
        <div className="relative z-10 flex h-full flex-col items-center justify-end px-5 pb-24 text-center sm:pb-32">
          <Cartouche className="mb-6 h-16 w-12 text-gold" />
          <p className="eyebrow">Elisir d'Oriente · Domina Coral Bay · Sharm el-Sheikh</p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] sm:text-7xl md:text-8xl">
            Il tuo angolo <em className="text-gradient-gold">d'Oriente</em> sul Mar Rosso
          </h1>
          <a href="#book" className="mt-10 bg-gradient-gold px-10 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary-foreground shadow-gold transition hover:scale-105">Book Your Stay</a>
          <div className="mt-10 flex gap-2">
            {HERO.map((_, i) => <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} className={`h-0.5 transition-all ${i === slide ? "w-10 bg-gold" : "w-5 bg-foreground/40"}`} />)}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <Section id="book" eyebrow="Reserve direct · best price" title={<>Choose your <em className="text-gold">nights</em></>} intro="Pick your dates on the calendar, see the price for every night and build your stay — no booking fees." className="bg-navy">
        <div className="reveal"><Booking extras={extras} toggleExtra={toggleExtra} /></div>
      </Section>

      {/* APARTMENT */}
      <Section id="apartment" eyebrow="The apartment" title="60m² of quiet, steps from the pool" intro="A warm, oriental-inspired home with its own terrace overlooking the pool — made for slow breakfasts and long Red Sea evenings.">
        <div className="reveal grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
          <img src={hero3} alt="Living room opening onto the pool-view terrace" loading="lazy" className="col-span-2 row-span-2 h-full min-h-72 w-full object-cover" />
          <img src={hero2} alt="Resort pool at sunset" loading="lazy" className="aspect-square h-full w-full object-cover" />
          <img src={hero1} alt="Domina Coral Bay from above" loading="lazy" className="aspect-square h-full w-full object-cover" />
          <img src={reef} alt="Coral reef" loading="lazy" className="aspect-square h-full w-full object-cover" />
          <img src={desert} alt="Sinai desert" loading="lazy" className="aspect-square h-full w-full object-cover" />
        </div>
        <div className="reveal mt-12 grid gap-10 md:grid-cols-3">
          <div className="grid grid-cols-2 gap-6 md:col-span-1">
            {[["60m²", "Living space"], ["5", "Guests max"], ["Pool", "View"], ["Private", "Terrace"]].map(([a, b]) => (
              <div key={b}><p className="font-display text-4xl text-gold">{a}</p><p className="text-xs uppercase tracking-widest text-muted-foreground">{b}</p></div>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:col-span-2">
            {["Air conditioning", "WiFi", "Satellite TV", "Terrace", "Microwave", "Safe", "Kettle", "Coffee maker", "Hair dryer", "Daily housekeeping", "Spa Élisir — free daily", "All pools & beaches"].map((a) => (
              <li key={a} className="flex items-center gap-3 border-b border-border pb-3"><span className="text-gold">◆</span>{a}</li>
            ))}
          </ul>
        </div>
      </Section>

      {/* RESORT */}
      <Section id="resort" eyebrow="Live the resort" title="Domina Coral Bay, all yours" className="bg-navy">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Private beach", "A coral-fringed bay with its own jetty.", hero1],
            ["Pools", "Lagoon, infinity and quiet pools.", hero2],
            ["Spa Élisir", "Hammam & sauna, free for you daily.", hero3],
            ["Entertainment", "Shows, music and the evening piazza.", desert],
            ["Restaurants", "From buffet to à la carte fine dining.", reef],
          ].map(([t, d, img], i) => (
            <article key={t} className="reveal group relative h-80 overflow-hidden" style={{ transitionDelay: `${i * 90}ms` }}>
              <img src={img} alt={t} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-veil" />
              <div className="absolute bottom-0 p-5"><h3 className="text-2xl">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
            </article>
          ))}
        </div>
        <div className="reveal mt-12 grid gap-6 md:grid-cols-2">
          <blockquote className="border-l-2 border-terracotta pl-6 font-display text-2xl italic leading-snug">
            "We recommend experiencing local restaurants, not just the all-inclusive. Sharm's soul lives in its markets, cafés and kitchens."
          </blockquote>
          <div className="flex h-48 items-center justify-center border border-dashed border-gold/40 text-sm text-muted-foreground">Resort map — coming soon</div>
        </div>
      </Section>

      {/* MINA */}
      <section className="relative px-5 py-24 sm:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <img src={mina} alt="Mina, your local guide" loading="lazy" width={1024} height={1280} className="reveal aspect-[4/5] w-full object-cover" />
          <div className="reveal">
            <p className="eyebrow">Mina · your guide</p>
            <h2 className="mt-4 text-4xl leading-tight sm:text-6xl">Let Mina show you the <em className="text-gold">real</em> Sharm el-Sheikh</h2>
            <p className="mt-6 text-lg text-muted-foreground">Our trusted friend on the ground. Mina knows every reef, every honest taxi driver and every family-run kitchen worth the trip.</p>
            <ul className="mt-8 space-y-3">
              {["Excursions on land and sea", "Airport & city transfers", "Local tips, prices, what to avoid", "Safety guide for exploring Sharm"].map((s) => (
                <li key={s} className="flex gap-3"><span className="text-terracotta">✦</span>{s}</li>
              ))}
            </ul>
            <a href={wa(MINA_WHATSAPP, "Ciao Mina! I'm staying at Oasi del Faraone and would love your help.")} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-3 bg-whatsapp px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-navy-deep transition hover:opacity-90">Chat with Mina on WhatsApp</a>
          </div>
        </div>
      </section>

      {/* EXTRAS */}
      <Section id="extras" eyebrow="Enhance your stay" title="Add unforgettable moments" intro="Add them to your booking now — Mina confirms every detail with you before you fly." className="bg-navy">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXTRAS.map((e, i) => {
            const on = extras.includes(e.id);
            return (
              <article key={e.id} className={`reveal flex flex-col border p-6 transition ${on ? "border-gold bg-gold/10" : "border-border bg-card"}`} style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{e.icon}</span>
                  <span className="font-display text-3xl text-gold">€{e.price}</span>
                </div>
                <h3 className="mt-4 text-2xl">{e.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{e.desc}</p>
                <div className="mt-6 flex gap-2">
                  <button onClick={() => toggleExtra(e.id)} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition ${on ? "bg-gold text-primary-foreground" : "border border-gold text-gold hover:bg-gold/10"}`}>{on ? "✓ Added" : "Add to booking"}</button>
                  <a href={wa(MINA_WHATSAPP, `Ciao Mina, info about: ${e.name}`)} target="_blank" rel="noreferrer" aria-label={`Ask Mina about ${e.name}`} className="border border-border px-4 py-3 text-xs text-whatsapp hover:border-whatsapp">Ask</a>
                </div>
              </article>
            );
          })}
        </div>
        {extras.length > 0 && <a href="#book" className="reveal is-visible mt-8 block text-center text-sm text-gold underline">{extras.length} added · see your updated quote →</a>}
      </Section>

      {/* EXPLORE */}
      <Section eyebrow="Explore Sharm" title="Beyond the resort gates">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SPOTS.map((s, i) => (
            <div key={s.name} className="reveal bg-background p-8" style={{ transitionDelay: `${i * 60}ms` }}>
              <p className="font-display text-5xl text-gold/30">0{i + 1}</p>
              <h3 className="mt-2 text-3xl">{s.name}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* EAT */}
      <Section eyebrow="Where to eat" title="Our table, our tips" className="bg-navy">
        <div className="divide-y divide-border border-y border-border">
          {RESTAURANTS.map((r) => (
            <div key={r.name} className="reveal grid gap-2 py-6 md:grid-cols-[1fr_1fr_2fr] md:items-baseline">
              <h3 className="text-3xl">{r.name}</h3>
              <p className="eyebrow !text-terracotta">{r.tag}</p>
              <p className="text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* INFO */}
      <Section id="info" eyebrow="Practical info" title="Good to know">
        <div className="reveal space-y-px">
          {[
            ["Check-in & check-out", "Check-in from 15:00 · Check-out by 11:00. Early or late? Ask us on WhatsApp."],
            ["Currency", "Egyptian Pound (EGP). Euro is widely accepted; ATMs at the resort and Naama Bay."],
            ["Climate", "Sunny all year. Winter 22–26°C, summer 33–40°C. Sea 22–28°C — swimmable every month."],
            ["How to reach the resort", "Sharm el-Sheikh airport (SSH) is ~15 minutes away. Book our private transfer for €15, or take an official taxi."],
            ["Documents", "Italian ID card or passport is required: Domina needs it for the guest delegation. Visa on arrival covers Sinai stays."],
          ].map(([q, a]) => (
            <details key={q} className="group border border-border bg-card px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-2xl">{q}<span className="text-gold transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* REAL ESTATE */}
      <RealEstate />

      {/* FOOTER */}
      <footer className="border-t border-border px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <div className="flex items-start gap-4 text-gold">
            <Cartouche className="h-14 w-10" />
            <div><p className="font-display text-2xl text-foreground">Oasi del Faraone</p><p className="text-sm italic text-muted-foreground">Elisir d'Oriente — Il tuo angolo d'Oriente sul Mar Rosso</p></div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="eyebrow mb-3">Contact</p>
            <p>Fulvio De Siena</p>
            <a href={wa(OWNER_WHATSAPP, "Ciao Fulvio!")} className="text-gold">+39 334 732 8158 (WhatsApp)</a>
            <p className="mt-2">Domina Coral Bay, Sharm el-Sheikh, Egypt</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="eyebrow mb-3">Follow</p>
            <div className="flex gap-5"><a href="#" className="hover:text-gold">Instagram</a><a href="#" className="hover:text-gold">Facebook</a><a href="#" className="hover:text-gold">TikTok</a></div>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-6xl text-xs text-muted-foreground/60">© {new Date().getFullYear()} Oasi del Faraone</p>
      </footer>
    </main>
  );
}

function RealEstate() {
  const [sent, setSent] = useState(false);
  return (
    <section className="border-t border-border bg-navy px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <div className="reveal">
          <p className="eyebrow !text-terracotta">Invest in the Red Sea</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">Interested in buying or investing at Domina Coral Bay?</h2>
          <p className="mt-4 text-muted-foreground">Studios, duplexes, shops and business opportunities. We know the resort from the inside — and we'll guide you.</p>
        </div>
        {sent ? (
          <p className="reveal is-visible self-center font-display text-2xl text-gold">Thank you — we'll be in touch very soon.</p>
        ) : (
          <form
            className="reveal grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              window.open(wa(OWNER_WHATSAPP, `Real estate lead\n${[...f.entries()].map(([k, v]) => `${k}: ${v}`).join("\n")}`), "_blank");
              setSent(true);
            }}
          >
            <input required name="Name" className="field" placeholder="Name" />
            <input required name="Email" type="email" className="field" placeholder="Email" />
            <input name="Phone" type="tel" className="field" placeholder="Phone" />
            <select name="Interest" className="field" defaultValue="Studio">
              {["Studio", "2-bed", "Duplex", "Shop", "Business activity", "Other investment"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select name="Budget" className="field sm:col-span-2" defaultValue="€50k – €100k">
              {["Under €50k", "€50k – €100k", "€100k – €200k", "€200k – €400k", "€400k+"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <button className="border border-gold py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-primary-foreground sm:col-span-2">We'll guide you</button>
          </form>
        )}
      </div>
    </section>
  );
}
