import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { eur, fmtDate, todayKey } from "@/lib/admin";
import { DAY_STATE_LABEL, dayState, doubleBookingConflicts, financeStats, type DayState, type Period } from "@/lib/finance";

const COLOR: Record<DayState, string> = {
  free: "bg-muted/40 text-muted-foreground", option: "bg-warning/60 text-foreground", confirmed: "bg-success/70 text-foreground",
  owner: "bg-gold/70 text-navy-deep", host: "bg-terracotta/70 text-foreground", blocked: "bg-muted-foreground/60 text-background", booking: "bg-moovy/70 text-navy-deep",
};

export function FinancePanel() {
  const today = todayKey();
  const [kind, setKind] = useState<Period["kind"]>("month");
  const [month, setMonth] = useState(today.slice(0, 7));
  const [year, setYear] = useState(today.slice(0, 4));
  const { data } = useQuery({
    queryKey: ["admin", "finance"],
    queryFn: async () => {
      const [b, e, i, k] = await Promise.all([
        supabase.from("bookings").select("*"), supabase.from("expenses").select("*"),
        supabase.from("inquiries").select("created_at, status"), supabase.from("availability_blocks").select("start_date, end_date, source, status"),
      ]);
      for (const r of [b, e, i, k]) if (r.error) throw r.error;
      return { bookings: b.data ?? [], expenses: e.data ?? [], inquiries: i.data ?? [], blocks: k.data ?? [] };
    },
  });
  const period: Period = kind === "month" ? { kind, key: month } : { kind, key: year };
  const s = useMemo(() => (data ? financeStats(data.bookings, data.expenses, data.inquiries, period) : null), [data, kind, month, year]);
  if (!data || !s) return <p className="text-muted-foreground">Caricamento conti…</p>;
  const conflicts = doubleBookingConflicts(data.bookings, data.blocks);
  const label = kind === "month" ? new Date(`${month}-15`).toLocaleDateString("it-IT", { month: "long", year: "numeric" }) : year;

  return (
    <div className="space-y-6">
      {conflicts.map((c, n) => (
        <div key={n} role="alert" className="rounded-md border border-destructive/60 bg-destructive/15 px-4 py-3 text-sm text-destructive">
          Possibile doppia prenotazione: Booking.com occupa {fmtDate(c.block.start_date)} → {fmtDate(c.block.end_date)}, sovrapposto a {c.booking.guest_name} ({fmtDate(c.booking.check_in)} → {fmtDate(c.booking.check_out)}).
        </div>))}

      <div className="flex flex-wrap items-end gap-3">
        <h2 className="mr-auto font-display text-2xl">Conti — {label}</h2>
        <Select value={kind} onValueChange={v => setKind(v as Period["kind"])}><SelectTrigger className="w-32" aria-label="Periodo"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="month">Mese</SelectItem><SelectItem value="year">Anno</SelectItem></SelectContent></Select>
        {kind === "month" ? <Input type="month" className="w-44" aria-label="Mese" value={month} onChange={e => e.target.value && setMonth(e.target.value)} />
          : <Input type="number" className="w-28" aria-label="Anno" min={2020} max={2100} value={year} onChange={e => /^\d{4}$/.test(e.target.value) && setYear(e.target.value)} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <K t="Fatturato stanza" v={eur(s.revenue)} n={`${s.bookingsCount} soggiorni (confermati + host)`} />
        <K t="Commissioni OTA" v={eur(s.commissions)} />
        <K t="Quota Carmine (proprietario)" v={eur(s.ownerShare)} />
        <K t="Borsellino FDS" v={eur(s.fds)} />
        <K t="Spese (a carico Carmine)" v={eur(s.ownerExpenses)} n={s.unconvertedExpenses ? `${s.unconvertedExpenses} spese senza controvalore in euro, escluse` : undefined} />
        <K t="Netto Carmine" v={eur(s.ownerNet)} n="Quota meno spese" gold />
        <K t="Notti vendute" v={`${s.nightsSold} / ${s.nightsAvailable}`} n={`Occupazione ${s.occupancyPct.toLocaleString("it-IT")}%`} />
        <K t="ADR · RevPAR" v={`${eur(s.adr)} · ${eur(s.revpar)}`} n="Prezzo medio per notte venduta · per notte disponibile" />
        <K t="Richieste" v={String(s.inquiries)} n={`Conversione ${s.conversionPct.toLocaleString("it-IT")}%`} />
        <K t="Dirette vs OTA" v={`${s.directPct.toLocaleString("it-IT")}% · ${s.otaPct.toLocaleString("it-IT")}%`} />
      </div>

      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Calendario prossimi 3 mesi</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-xs">{(Object.keys(DAY_STATE_LABEL) as DayState[]).map(k => <span key={k} className="flex items-center gap-1"><span className={`h-3 w-3 rounded-sm ${COLOR[k]}`} />{DAY_STATE_LABEL[k]}</span>)}</div>
          <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map(o => <Month key={o} offset={o} today={today} bookings={data.bookings} blocks={data.blocks} />)}</div>
        </CardContent></Card>
    </div>
  );
}

function K({ t, v, n, gold }: { t: string; v: string; n?: string | undefined; gold?: boolean }) {
  return <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">{t}</CardTitle></CardHeader>
    <CardContent><p className={`font-display text-3xl ${gold ? "text-gold-light" : ""}`}>{v}</p>{n && <p className="text-xs text-muted-foreground">{n}</p>}</CardContent></Card>;
}

function Month({ offset, today, bookings, blocks }: { offset: number; today: string; bookings: Parameters<typeof dayState>[1]; blocks: Parameters<typeof dayState>[2] }) {
  const y = Number(today.slice(0, 4)), m = Number(today.slice(5, 7)) - 1 + offset;
  const first = new Date(Date.UTC(y, m, 1)), days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  return (
    <div>
      <p className="mb-2 font-display text-lg capitalize">{first.toLocaleDateString("it-IT", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => <span key={i} className="text-muted-foreground">{d}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const key = new Date(Date.UTC(y, m, i + 1)).toISOString().slice(0, 10);
          const st = dayState(key, bookings, blocks);
          return <span key={key} title={DAY_STATE_LABEL[st]} className={`rounded-sm py-1 ${COLOR[st]} ${key === today ? "ring-1 ring-gold-light" : ""}`}>{i + 1}</span>;
        })}
      </div>
    </div>
  );
}
