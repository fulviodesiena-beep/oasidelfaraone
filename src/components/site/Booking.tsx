import { useLanguage, publicPath } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, ArrowRight, Car, Fish, Heart, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXTRAS, OWNER_WHATSAPP, ROOMS, wa } from "@/lib/site-data";
import { dateKey, MAX_GUESTS, quote } from "@/lib/pricing";
import { saveInquiryWithin } from "@/lib/inquiries";
import { trackEvent } from "@/lib/tracking";
import { isOccupied, rangeHitsOccupied, type Range } from "@/lib/availability";
import { supabase } from "@/integrations/supabase/client";

export const QUOTE_HOLD_SECONDS = 12 * 60;
export const MAX_CHILDREN = 3;
const QUICK_EXTRAS = [
  { id: "transfer", name: "Transfer aeroporto", icon: Car },
  { id: "rasmo", name: "Escursione snorkeling", icon: Fish },
  { id: "cena", name: "Cena romantica", icon: Heart },
] as const;
const parse = (s: string) => { const [y = 0, m = 1, d = 1] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function Booking({ extras, toggleExtra }: { extras: string[]; toggleExtra: (id: string) => void }) {
  const { t, language, locale, money } = useLanguage();
  const [today] = useState(new Date());
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [step, setStep] = useState<"dates" | "details">("dates");
  const [opened, setOpened] = useState(false);
  const [expired, setExpired] = useState(false);
  const [left, setLeft] = useState(QUOTE_HOLD_SECONDS);
  const [dinner, setDinner] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [occupied, setOccupied] = useState<Range[]>([]);
  useEffect(() => {
    supabase.rpc("get_occupied_ranges").then(({ data, error }) => { if (!error && data) setOccupied(data); }, () => {});
  }, []);

  // 12-minute hold, React state only; restarts every time the details step opens.
  useEffect(() => {
    if (step !== "details") return;
    const end = Date.now() + QUOTE_HOLD_SECONDS * 1000;
    setLeft(QUOTE_HOLD_SECONDS);
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) { clearInterval(t); setExpired(true); setStep("dates"); setCheckIn(""); setCheckOut(""); setOpened(false); }
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const q = checkIn && checkOut ? quote(parse(checkIn), parse(checkOut)) : null;
  const clash = Boolean(checkIn && checkOut && rangeHitsOccupied(checkIn, checkOut, occupied));
  const valid = Boolean(q && q.nightsCount > 0 && checkIn >= dateKey(today) && !clash);
  const editDates = () => { setStep("dates"); setOpened(false); setExpired(false); };
  const pick = (d: Date) => { const key = dateKey(d); editDates(); if (!checkIn || checkOut || key <= checkIn) { setCheckIn(key); setCheckOut(""); } else setCheckOut(key); };
  const first = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days: (Date | null)[] = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const fmt = (s: string) => parse(s).toLocaleDateString(locale.format, { day: "numeric", month: "short" });

  return <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
    <div className="min-w-0">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
        <Button variant="ghost" size="icon" aria-label={t("Mese precedente")} disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button>
        <h3 className="text-2xl capitalize">{month.toLocaleDateString(locale.format, { month: "long", year: "numeric" })}</h3>
        <Button variant="ghost" size="icon" aria-label={t("Mese successivo")} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button>
      </div>
      <div className="calendar-grid grid grid-cols-7 text-center">
        {Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 2 + i).toLocaleDateString(locale.format, { weekday: "short" })).map((d, i) => <span key={i} className="pb-3 text-xs text-muted-foreground">{d}</span>)}
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = dateKey(d);
          const selected = key === checkIn || key === checkOut || Boolean(checkIn && checkOut && key > checkIn && key < checkOut);
          const busy = isOccupied(key, occupied);
          return <Button key={key} variant="ghost" disabled={key < dateKey(today) || busy} aria-label={`${d.toLocaleDateString(locale.format, { day: "numeric", month: "long", year: "numeric" })}${busy ? ` — ${t("Occupato")}` : ""}`} aria-pressed={selected} onClick={() => pick(d)} className={`calendar-day ${selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : busy ? "text-muted-foreground line-through" : "text-foreground"}`}>{d.getDate()}</Button>;
        })}
      </div>
      <div className="mt-5 flex gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-muted-foreground" />{t("Occupato")}</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-whatsapp" />{t("Disponibile")}</span>
      </div>
      {clash && <p role="alert" className="mt-3 text-sm text-destructive">{t("Le date scelte includono giorni già occupati. Scegli un altro periodo.")}</p>}
      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{t("Disponibilità da confermare con Fulvio. Il prezzo è riferito all’intero appartamento.")}</p>
    </div>

    <div className="min-w-0 border border-border bg-card p-5 sm:p-8">
      {step === "dates" || !valid || !q ? <>
        <p className="eyebrow">{t("1 · Date e ospiti · fino a 4 persone")}</p>
        {expired && <p role="alert" className="mt-4 text-sm text-destructive">{t("Il preventivo è scaduto. Seleziona di nuovo le date.")}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <label className="text-xs text-muted-foreground">{t("Arrivo")}<input aria-label={t("Arrivo")} type="date" min={dateKey(today)} className="field mt-2" value={checkIn} onChange={e => { setCheckIn(e.target.value); editDates(); }} /></label>
          <label className="text-xs text-muted-foreground">{t("Partenza")}<input aria-label={t("Partenza")} type="date" min={checkIn || dateKey(today)} className="field mt-2" value={checkOut} onChange={e => { setCheckOut(e.target.value); editDates(); }} /></label>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3"><Counter label={t("Adulti")} value={adults} min={1} max={MAX_GUESTS - children} change={setAdults} /><Counter label={t("Bambini")} value={children} min={0} max={Math.min(MAX_CHILDREN, MAX_GUESTS - adults)} change={setChildren} /></div>
        <p className="mt-4 text-xs text-muted-foreground">{t("Il prezzo dell’appartamento non cambia da 1 a 4 ospiti.")}</p>
        <Button disabled={!valid} className="mt-6 h-12 w-full" onClick={() => { setExpired(false); setStep("details"); }}>{t("Vedi disponibilità")}<ArrowRight /></Button>
      </> : <form className="space-y-4" onSubmit={async e => {
        e.preventDefault(); const form = new FormData(e.currentTarget);
        const extraNames = [...EXTRAS.filter(x => extras.includes(x.id)).map(x => t(x.name)), ...(dinner ? [t("Cena romantica")] : [])];
        const note = String(form.get("Note") ?? "").trim();
        const special = String(form.get("special_dates") ?? "").trim().slice(0, 500);
        const message = `${t("Richiesta soggiorno — Oasi del Faraone")}\n${t("Nome")}: ${form.get("Nome")}\n${t("Email")}: ${form.get("Email")}\n${t("Telefono")}: ${form.get("Telefono")}\n${t("Date")}: ${fmt(checkIn)} → ${fmt(checkOut)}\n${q.nightsCount} ${t("notti")}\n${t("Ospiti")}: ${adults} ${t("Adulti")}, ${children} ${t("Bambini")}\n${t("Extra")}: ${extraNames.join(", ") || t("nessuno")}${note ? `\n${t("Note")}: ${note}` : ""}${special ? `\n${t("Date speciali")}: ${special}` : ""}\n${t("Totale indicativo alloggio")}: ${q.total === null ? t("da confermare") : money(q.total)}\n${t("Pulizia finale")} ${money(q.cleaningFee)} ${t("in reception al check-in")}\n${t("Disponibilità e prezzi da confermare.")}`;
        const tab = window.open("", "_blank");
        await saveInquiryWithin({ guest_name: String(form.get("Nome") ?? ""), guest_email: String(form.get("Email") ?? ""), guest_phone: String(form.get("Telefono") ?? ""), check_in: checkIn, check_out: checkOut, adults, children, extras: extraNames, message, consent_privacy: form.get("consent_privacy") === "on", consent_marketing: form.get("consent_marketing") === "on", special_dates: special, consent_occasions: form.get("consent_occasions") === "on", room_id: String(form.get("room_id") ?? ""), language });
        trackEvent("Lead");
        const url = wa(OWNER_WHATSAPP, message);
        if (tab) { tab.opener = null; tab.location.href = url; } else window.location.href = url;
        setOpened(true);
      }}>
        <p className="eyebrow">{t("2 · Riepilogo e contatti")}</p>
        <div className="flex items-center justify-between gap-3 border border-border p-4 text-sm">
          <div><p>{fmt(checkIn)} {t("→")} {fmt(checkOut)}</p><p className="text-xs text-muted-foreground">{q.nightsCount} {t("notti ·")} {adults + children} {t("ospiti")}</p></div>
          <span className="font-display text-3xl text-gold-light">{q.total === null ? t("Da confermare") : money(q.total)}</span>
        </div>
        {q.total !== null && <ul aria-label={t("Dettaglio notti")} className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">{q.nights.map(n => <li key={dateKey(n.date)} className="flex justify-between"><span>{n.date.toLocaleDateString(locale.format, { weekday: "short", day: "numeric", month: "short" })}</span><span>{money(n.price ?? 0)}</span></li>)}<li className="flex justify-between border-t border-border pt-1 text-foreground"><span>{t("Totale alloggio ·")} {q.nightsCount} {t("notti")}</span><span>{money(q.total)}</span></li></ul>}
        <p className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{t("Nota: pulizia finale · pagata in reception al check-in")}</span><span>{money(q.cleaningFee)} {t("· non inclusa")}</span></p>
        {q.minStayWarning && <p role="note" className="text-xs text-warning">{t("Soggiorno minimo consigliato:")} {q.minStayWarning} {t("notti")}{q.touchesPeak ? t(" nel periodo di Picco") : ""}{t(". Puoi comunque inviare la richiesta.")}</p>}
        <p role="timer" className={`flex items-center gap-2 text-sm ${left <= 120 ? "text-destructive" : "text-gold"}`}><Timer className="size-4" />{t("Preventivo riservato per:")} {mmss(left)}</p>
        {ROOMS.length > 1 && <select name="room_id" aria-label={t("Stanza")} className="field" defaultValue={ROOMS[0]?.id}>{ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>}
        <input name="Nome" aria-label={t("Nome completo")} placeholder={t("Nome e Cognome")} required autoComplete="name" className="field" />
        <input name="Telefono" aria-label={t("Telefono")} type="tel" defaultValue="+39 " required autoComplete="tel" className="field" />
        <input name="Email" aria-label={t("Email")} type="email" placeholder={t("Email")} required autoComplete="email" className="field" />
        <fieldset className="space-y-2"><legend className="mb-2 text-xs text-muted-foreground">{t("Extra (non inclusi nel totale)")}</legend>
          {QUICK_EXTRAS.map(x => { const on = x.id === "cena" ? dinner : extras.includes(x.id); return <label key={x.id} className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="accent-primary" checked={on} onChange={() => x.id === "cena" ? setDinner(!dinner) : toggleExtra(x.id)} /><x.icon className="size-4 text-gold-light" />{t(x.name)}</label>; })}
        </fieldset>
        <input name="special_dates" aria-label={t("Date speciali da festeggiare a Sharm")} maxLength={500} placeholder={t("Date speciali da festeggiare a Sharm (compleanni, anniversari) — facoltativo")} className="field" />
        {showNote ? <textarea name="Note" aria-label={t("Note")} rows={3} maxLength={1000} className="field" placeholder={t("Note per Fulvio")} /> : <Button type="button" variant="link" className="h-auto p-0" onClick={() => setShowNote(true)}>{t("Aggiungi una nota")}</Button>}
        <label className="flex items-start gap-3 text-xs"><input type="checkbox" name="consent_privacy" required className="mt-0.5 accent-primary" /><span>{t("Ho letto l’")} <a href={publicPath(language, "privacy")} target="_blank" rel="noreferrer" className="underline">{t("informativa privacy")}</a> {t("e acconsento al trattamento dei dati per gestire la richiesta (obbligatorio).")}</span></label>
        <label className="flex items-start gap-3 text-xs"><input type="checkbox" name="consent_marketing" className="mt-0.5 accent-primary" /><span>{t("Voglio ricevere offerte e novità (facoltativo).")}</span></label>
        <label className="flex items-start gap-3 text-xs"><input type="checkbox" name="consent_occasions" className="mt-0.5 accent-primary" /><span>{t("Acconsento a ricevere offerte personalizzate in occasione delle ricorrenze mie e dei miei compagni di viaggio (facoltativo).")}</span></label>
        <Button type="submit" className="h-12 w-full whitespace-normal">{t("Richiedi prenotazione")}<ArrowRight /></Button>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("Nessun pagamento online. Si apre WhatsApp con il messaggio pronto: invialo a Fulvio per ricevere conferma.")}</p>
        {opened && <p role="status" className="text-sm text-gold-light">{t("La richiesta è pronta su WhatsApp: inviala per contattare Fulvio.")}</p>}
        <Button type="button" variant="link" className="h-auto p-0" onClick={editDates}>{t("Modifica date")}</Button>
      </form>}
    </div>
  </div>;
}
function Counter({ label, value, min, max, change }: { label: string; value: number; min: number; max: number; change: (n: number) => void }) { const { t } = useLanguage(); return <div><p className="text-xs text-muted-foreground">{label}</p><div className="mt-2 flex h-12 items-center justify-between border border-input"><Button variant="ghost" size="icon" aria-label={t("Meno {label}", { label })} disabled={value <= min} onClick={() => change(value - 1)}><Minus /></Button><span aria-label={t("Numero {label}", { label })}>{value}</span><Button variant="ghost" size="icon" aria-label={t("Più {label}", { label })} disabled={value >= max} onClick={() => change(value + 1)}><Plus /></Button></div></div>; }
