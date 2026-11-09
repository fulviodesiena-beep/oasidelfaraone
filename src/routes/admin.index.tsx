import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { dashboardStats, occupancyBand, occupancyStats, eur, fmtDate, todayKey, type Booking } from "@/lib/admin";
import { REVIEW_LINK_IS_PLACEHOLDER } from "@/lib/email-templates";
import { FinancePanel } from "@/components/admin/FinancePanel";
import { BookingClosureList, DelegaPanel } from "@/components/admin/DashboardAlerts";
import { needsBookingClosure } from "@/lib/ical";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const today = todayKey();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard", today],
    queryFn: async () => {
      const [b, i] = await Promise.all([
        supabase.from("bookings").select("*").order("check_in"),
        supabase.from("inquiries").select("status"),
      ]);
      if (b.error) throw b.error;
      if (i.error) throw i.error;
      return { ...dashboardStats(b.data, i.data, today), occ: occupancyStats(b.data, today) };
    },
  });
  if (error) return <p className="text-destructive">Impossibile caricare i dati.</p>;
  if (isLoading || !data) return <p className="text-muted-foreground">Caricamento…</p>;

  // I valori di occupazione arrivano dalla stessa query qui sopra: nessuna nuova chiamata al database.
  const monthLabel = new Date().toLocaleDateString("it-IT", { month: "long" });
  const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="space-y-6">
      {REVIEW_LINK_IS_PLACEHOLDER && (
        <div className="rounded-md border border-warning/45 bg-warning/10 px-4 py-3 text-sm text-warning" role="alert">
          ⚠️ Link Google Business non configurato. Aggiorna REVIEW_PLACEHOLDER in src/lib/email-templates.ts con il tuo link reale.
        </div>
      )}

      <BookingClosureList />
      <DelegaPanel />

      {/* Riga 1 — card esistenti */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat title="Check-in oggi" value={data.checkInsToday.length} list={data.checkInsToday} />
        <Stat title="Check-out oggi" value={data.checkOutsToday.length} list={data.checkOutsToday} />
        <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Prenotazioni questo mese</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{data.monthCount}</p><p className="text-sm text-gold-light">{eur(data.monthTotal)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Da incassare</CardTitle></CardHeader>
          <CardContent><p className="font-display text-3xl text-gold-light">{eur(data.toCollect)}</p><p className="text-xs text-muted-foreground">Saldo prenotazioni confermate</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Richieste nuove</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3"><span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-3 font-display text-2xl text-primary-foreground">{data.newInquiries}</span>
            <Link to="/admin/inquiries" className="text-sm text-gold-light underline-offset-4 hover:underline">Apri richieste</Link></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Andamento anno</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="flex justify-between"><span className="text-muted-foreground">Prenotazioni confermate</span><span className="font-display text-xl">{data.occ.confirmedYearCount}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Durata media</span><span className="font-display text-xl">{data.occ.avgNights} notti</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Incasso anno</span><span className="font-display text-xl text-gold-light">{eur(data.occ.revenueYear)}</span></p>
          </CardContent></Card>
      </div>

      {/* Riga 2 — card di occupazione, calcolate dai bookings già caricati */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Giorni occupati — {monthTitle}</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{data.occ.monthBooked} <span className="text-2xl text-muted-foreground">/ {data.occ.monthDays} giorni</span></p></CardContent></Card>
        <Occupancy title="Occupazione mese" pct={data.occ.monthPct} note={`${data.occ.monthBooked} di ${data.occ.monthDays} giorni`} />
        <Occupancy title="Occupazione anno" pct={data.occ.yearPct} note={`${data.occ.yearBooked} di ${data.occ.yearElapsed} giorni dal 1° gennaio`} />
      </div>

      <FinancePanel />

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-normal">Prossime prenotazioni confermate</CardTitle></CardHeader>
        <CardContent>
          {data.upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna prenotazione confermata in arrivo.</p> :
            <ul className="divide-y divide-border">{data.upcoming.map(b => (
              <li key={b.id} className={`flex flex-wrap items-center justify-between gap-2 py-3 ${needsBookingClosure(b, today) ? "text-destructive" : ""}`}>
                <span>{b.guest_name}</span>
                <span className="text-sm text-muted-foreground">{fmtDate(b.check_in)} → {fmtDate(b.check_out)} · {b.total_nights} notti</span>
                <span className="text-sm">{eur(b.total_price)}</span><StatusBadge status={b.status} />
              </li>))}</ul>}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value, list }: { title: string; value: number; list: Booking[] }) {
  return (
    <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent><p className="font-display text-4xl">{value}</p>
        {list.map(b => <p key={b.id} className="truncate text-xs text-muted-foreground">{b.guest_name}</p>)}</CardContent></Card>
  );
}

const BAND = { high: "bg-success", mid: "bg-warning", low: "bg-destructive" } as const;
function Occupancy({ title, pct, note }: { title: string; pct: number; note: string }) {
  return (
    <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2"><p className="font-display text-4xl">{pct.toLocaleString("it-IT")}%</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full ${BAND[occupancyBand(pct)]}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
        <p className="text-xs text-muted-foreground">{note}</p></CardContent></Card>
  );
}
