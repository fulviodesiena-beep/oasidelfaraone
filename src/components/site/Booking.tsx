import { useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, ArrowRight, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXTRAS, OWNER_WHATSAPP, wa } from "@/lib/site-data";
import { dateKey, MAX_GUESTS, quote } from "@/lib/pricing";
const parse = (s: string) => { const [y = 0, m = 1, d = 1] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export function Booking({ extras, toggleExtra }: { extras: string[]; toggleExtra: (id: string) => void }) {
  const [today] = useState(new Date());
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [step, setStep] = useState<"search" | "quote" | "details">("search");
  const [opened, setOpened] = useState(false);
      const q = checkIn && checkOut ? quote(parse(checkIn), parse(checkOut)) : null;
  const valid = Boolean(q && q.nightsCount > 0 && checkIn >= dateKey(today));
  const pick = (d: Date) => { const key = dateKey(d); setOpened(false); if (!checkIn || checkOut || key <= checkIn) { setCheckIn(key); setCheckOut(""); } else setCheckOut(key); setStep("search"); };
  const first = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days: (Date | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  return <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
    <div className="min-w-0">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
        <Button variant="ghost" size="icon" aria-label="Mese precedente" disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button>
        <h3 className="text-2xl capitalize">{month.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</h3>
        <Button variant="ghost" size="icon" aria-label="Mese successivo" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button>
      </div>
      <div className="calendar-grid grid grid-cols-7 text-center">
        {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => <span key={i} className="pb-3 text-xs text-muted-foreground">{d}</span>)}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = dateKey(d);
          const selected = key === checkIn || key === checkOut || Boolean(checkIn && checkOut && key > checkIn && key < checkOut);
          return <Button key={key} variant="ghost" disabled={key < dateKey(today)} aria-label={d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })} aria-pressed={selected} onClick={() => pick(d)} className={`calendar-day ${selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-foreground"}`}>{d.getDate()}</Button>;
        })}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">Disponibilità da confermare con Fulvio. Il prezzo è riferito all’intero appartamento.</p>
    </div>
    <div className="min-w-0 border border-border bg-card p-5 sm:p-8">
      <p className="eyebrow">Il tuo soggiorno · fino a 4 persone</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <label className="text-xs text-muted-foreground">Arrivo<input aria-label="Arrivo" type="date" min={dateKey(today)} className="field mt-2" value={checkIn} onChange={e => { setCheckIn(e.target.value); setStep("search"); setOpened(false); }} /></label>
        <label className="text-xs text-muted-foreground">Partenza<input aria-label="Partenza" type="date" min={checkIn || dateKey(today)} className="field mt-2" value={checkOut} onChange={e => { setCheckOut(e.target.value); setStep("search"); setOpened(false); }} /></label>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3"><Counter label="Adulti" value={adults} min={1} max={MAX_GUESTS - children} change={setAdults} /><Counter label="Bambini" value={children} min={0} max={MAX_GUESTS - adults} change={setChildren} /></div>
      <p className="mt-4 text-xs text-muted-foreground">Il prezzo dell’appartamento non cambia da 1 a 4 ospiti.</p>
      {step !== "search" && valid && q && <div className="mt-6 space-y-3 border-t border-border pt-5">
        <div className="flex justify-between gap-3 text-sm"><span>{q.nightsCount} notti · appartamento</span><span>{q.accommodation === null ? "Su richiesta" : `€${q.accommodation}`}</span></div>
        {extras.map(id => { const e = EXTRAS.find(x => x.id === id); if (!e) return null; return <div key={id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{e.name}</span><div className="flex items-center gap-1"><Button size="icon" variant="ghost" aria-label={`Rimuovi ${e.name}`} onClick={() => toggleExtra(id)}><X /></Button></div></div>; })}
        <div className="flex items-end justify-between gap-3 border-t border-border pt-4"><span className="text-sm text-muted-foreground">{q.onRequest ? "Preventivo" : "Totale indicativo"}</span><span className="font-display text-4xl text-gold-light">{q.total === null ? "Su richiesta" : `€${q.total}`}</span></div>
        {extras.length > 0 && <p className="text-xs text-muted-foreground">Le esperienze selezionate non sono comprese nel totale.</p>}
      </div>}
      {step === "details" && valid && q ? <form className="mt-6 space-y-4" onSubmit={e => {
        e.preventDefault(); const form = new FormData(e.currentTarget);
        const message = `Richiesta soggiorno — Oasi del Faraone\nNome: ${form.get("Nome")}\nEmail: ${form.get("Email")}\nTelefono: ${form.get("Telefono")}\nDate: ${checkIn} → ${checkOut}\n${q.nightsCount} notti\nOspiti: ${adults} adulti, ${children} bambini\nExtra: ${EXTRAS.filter(x => extras.includes(x.id)).map(x => x.name).join(", ") || "nessuno"}\nTotale indicativo: ${q.total === null ? "su richiesta" : `€${q.total}`}\nDisponibilità e prezzi da confermare.`;
        window.open(wa(OWNER_WHATSAPP, message), "_blank", "noopener,noreferrer"); setOpened(true);
      }}>
        <label className="block text-xs text-muted-foreground">Nome completo<input name="Nome" required autoComplete="name" className="field mt-2" /></label>
        <label className="block text-xs text-muted-foreground">Email<input name="Email" type="email" required autoComplete="email" className="field mt-2" /></label>
        <label className="block text-xs text-muted-foreground">Telefono<input name="Telefono" type="tel" required autoComplete="tel" className="field mt-2" /></label>
        <Button type="submit" className="h-12 w-full whitespace-normal"><MessageCircle />Invia richiesta su WhatsApp</Button>
        <p className="text-xs leading-relaxed text-muted-foreground">Nessun pagamento online. Invia il messaggio a Fulvio su WhatsApp per ricevere conferma. I documenti verranno richiesti in seguito, tramite un canale concordato.</p>
        {opened && <p role="status" className="text-sm text-gold-light">La richiesta è pronta su WhatsApp: inviala per contattare Fulvio.</p>}
        <Button type="button" variant="link" onClick={() => setStep("quote")}>Torna al preventivo</Button>
      </form> : <Button disabled={!valid} className="mt-6 h-12 w-full" onClick={() => setStep(step === "quote" ? "details" : "quote")}>{step === "quote" ? "Continua" : "Calcola il soggiorno"}<ArrowRight /></Button>}
    </div>
  </div>;
}
function Counter({ label, value, min, max, change }: { label: string; value: number; min: number; max: number; change: (n: number) => void }) { return <div><p className="text-xs text-muted-foreground">{label}</p><div className="mt-2 flex h-12 items-center justify-between border border-input"><Button variant="ghost" size="icon" aria-label={`Meno ${label}`} disabled={value <= min} onClick={() => change(value - 1)}><Minus /></Button><span aria-label={`Numero ${label}`}>{value}</span><Button variant="ghost" size="icon" aria-label={`Più ${label}`} disabled={value >= max} onClick={() => change(value + 1)}><Plus /></Button></div></div>; }
