import { useMemo, useState } from "react";
import { EXTRAS, OWNER_WHATSAPP, wa } from "@/lib/site-data";
import { MAX_GUESTS, quote, seasonFor, SEASON_RATES } from "@/lib/pricing";

const fmt = (d: Date) => d.toISOString().slice(0, 10);
const parse = (s: string) => {
  const [y = 0, m = 1, d = 1] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
// Demo occupancy until bookings are stored online
const BOOKED = new Set<string>();
(() => {
  const t = new Date();
  for (const [o, len] of [[6, 5], [20, 7], [41, 4]] as const) for (let i = 0; i < len; i++) BOOKED.add(fmt(new Date(t.getFullYear(), t.getMonth(), t.getDate() + o + i)));
})();

const SEASON_LABEL = { low: "Low", mid: "Mid", high: "High", peak: "Peak" } as const;

export function Booking({ extras, toggleExtra }: { extras: string[]; toggleExtra: (id: string) => void }) {
  const today = new Date();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [step, setStep] = useState<"search" | "quote" | "details" | "done">("search");
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [guest, setGuest] = useState({ name: "", email: "", phone: "", doc: "" });

  const extrasTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce((a, e) => a + e.price, 0);
  const q = useMemo(() => (checkIn && checkOut ? quote(parse(checkIn), parse(checkOut), extrasTotal) : null), [checkIn, checkOut, extrasTotal]);
  const conflict = q?.nights.some((n) => BOOKED.has(fmt(n.date)));
  const valid = q && q.nightsCount > 0 && !conflict;

  const pickDay = (d: Date) => {
    const s = fmt(d);
    if (!checkIn || (checkIn && checkOut) || s <= checkIn) { setCheckIn(s); setCheckOut(""); }
    else setCheckOut(s);
  };

  const summary = () =>
    `New booking request — Oasi del Faraone\nGuest: ${guest.name}\nEmail: ${guest.email}\nPhone: ${guest.phone}\nDates: ${checkIn} → ${checkOut} (${q?.nightsCount} nights)\nGuests: ${adults} adults, ${children} children\nExtras: ${EXTRAS.filter((e) => extras.includes(e.id)).map((e) => e.name).join(", ") || "none"}\nTotal: €${q?.total}`;

  const days = (() => {
    const first = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  })();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      {/* Calendar */}
      <div className="border border-border bg-card/60 p-6 backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="px-3 py-1 text-gold hover:opacity-70">‹</button>
          <h3 className="text-2xl">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h3>
          <button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="px-3 py-1 text-gold hover:opacity-70">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <div key={d} className="py-1">{d}</div>)}
          {days.map((d, i) => {
            if (!d) return <div key={i} />;
            const s = fmt(d);
            const past = d < new Date(today.toDateString());
            const booked = BOOKED.has(s);
            const sel = s === checkIn || s === checkOut || (checkIn && checkOut && s > checkIn && s < checkOut);
            return (
              <button
                key={i}
                disabled={past || booked}
                onClick={() => pickDay(d)}
                className={`flex aspect-square flex-col items-center justify-center text-sm transition ${
                  sel ? "bg-gold text-primary-foreground" : booked ? "text-muted-foreground/40 line-through" : past ? "text-muted-foreground/30" : "text-foreground hover:bg-secondary"
                }`}
              >
                {d.getDate()}
                {!past && !booked && <span className={`text-[9px] ${sel ? "" : "text-gold/70"}`}>€{SEASON_RATES[seasonFor(d)]}</span>}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><i className="h-3 w-3 bg-gold" /> Your stay</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 border border-border" /> Available</span>
          <span className="flex items-center gap-2 line-through">Booked</span>
        </div>
      </div>

      {/* Form */}
      <div className="border border-gold/40 bg-card p-6 shadow-gold sm:p-8">
        {step === "done" ? (
          <div className="py-10 text-center">
            <p className="eyebrow">Shukran</p>
            <h3 className="mt-3 text-4xl">Your request is on its way</h3>
            <p className="mt-4 text-muted-foreground">Fulvio will confirm availability on WhatsApp within a few hours. Online card payment opens soon.</p>
            <button onClick={() => setStep("search")} className="mt-8 text-sm text-gold underline">Make another booking</button>
          </div>
        ) : step === "details" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.open(wa(OWNER_WHATSAPP, summary()), "_blank");
              setStep("done");
            }}
            className="space-y-4"
          >
            <p className="eyebrow">Step 3 · Your details</p>
            <input required className="field" placeholder="Full name (as on document)" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
            <input required type="email" className="field" placeholder="Email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
            <input required type="tel" className="field" placeholder="Phone / WhatsApp" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
            <label className="block text-sm text-muted-foreground">
              Italian ID card or passport <span className="text-gold">*</span>
              <span className="mt-1 block text-xs">Required by Domina Coral Bay for the guest delegation.</span>
              <input required type="file" accept="image/*,.pdf" className="field mt-2 file:mr-3 file:border-0 file:bg-gold file:px-3 file:py-1 file:text-primary-foreground" onChange={(e) => setGuest({ ...guest, doc: e.target.files?.[0]?.name ?? "" })} />
            </label>
            <Total q={q!} />
            <button type="submit" className="w-full bg-gradient-gold py-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90">Confirm & Pay</button>
            <p className="text-center text-xs text-muted-foreground">Secure card payment coming soon — for now your request is sent to the owner on WhatsApp.</p>
            <button type="button" onClick={() => setStep("quote")} className="w-full text-xs text-muted-foreground hover:text-gold">← Back to quote</button>
          </form>
        ) : (
          <div className="space-y-5">
            <p className="eyebrow">Step 1 · Dates & guests</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-muted-foreground">Check-in<input type="date" min={fmt(today)} className="field mt-1" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></label>
              <label className="text-xs text-muted-foreground">Check-out<input type="date" min={checkIn || fmt(today)} className="field mt-1" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Counter label="Adults" value={adults} min={1} max={MAX_GUESTS - children} onChange={setAdults} />
              <Counter label="Children" value={children} min={0} max={MAX_GUESTS - adults} onChange={setChildren} />
            </div>
            <p className="text-xs text-muted-foreground">Maximum {MAX_GUESTS} guests in total.</p>
            {conflict && <p className="text-sm text-destructive">Some of these nights are already booked — please choose other dates.</p>}

            {step === "quote" && valid && (
              <div className="space-y-3 border-t border-border pt-5">
                <p className="eyebrow">Step 2 · Your quote</p>
                {Object.entries(
                  q!.nights.reduce<Record<string, { n: number; p: number }>>((a, n) => {
                    a[n.season] = { n: (a[n.season]?.n ?? 0) + 1, p: n.price };
                    return a;
                  }, {}),
                ).map(([s, v]) => (
                  <div key={s} className="flex justify-between text-sm">
                    <span>{SEASON_LABEL[s as keyof typeof SEASON_LABEL]} season · €{v.p} × {v.n} nights</span>
                    <span>€{v.p * v.n}</span>
                  </div>
                ))}
                {EXTRAS.filter((e) => extras.includes(e.id)).map((e) => (
                  <div key={e.id} className="flex justify-between text-sm text-muted-foreground">
                    <button onClick={() => toggleExtra(e.id)} className="text-left hover:text-destructive">{e.icon} {e.name} ✕</button>
                    <span>€{e.price}</span>
                  </div>
                ))}
                <a href="#extras" className="block text-xs text-gold underline">+ Add excursions & transfers</a>
              </div>
            )}

            {q && q.nightsCount > 0 && <Total q={q} />}

            {step === "quote" && valid ? (
              <button onClick={() => setStep("details")} className="w-full bg-gradient-gold py-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:opacity-90">Continue</button>
            ) : (
              <button disabled={!valid} onClick={() => setStep("quote")} className="w-full bg-gradient-gold py-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90 disabled:opacity-40">Create Quote</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Total({ q }: { q: ReturnType<typeof quote> }) {
  return (
    <div className="flex items-end justify-between border-t border-border pt-4">
      <span className="text-sm text-muted-foreground">{q.nightsCount} nights{q.extrasTotal ? " + extras" : ""}</span>
      <span className="font-display text-4xl text-gradient-gold">€{q.total}</span>
    </div>
  );
}

function Counter({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="text-xs text-muted-foreground">
      {label}
      <div className="field mt-1 flex items-center justify-between !py-2">
        <button aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="px-2 text-lg text-gold disabled:opacity-30">−</button>
        <span className="text-base text-foreground">{value}</span>
        <button aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="px-2 text-lg text-gold disabled:opacity-30">+</button>
      </div>
    </div>
  );
}
