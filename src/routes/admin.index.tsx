import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { dashboardStats, eur, fmtDate, todayKey, type Booking } from "@/lib/admin";

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
      return dashboardStats(b.data, i.data, today);
    },
  });
  if (error) return <p className="text-destructive">Impossibile caricare i dati.</p>;
  if (isLoading || !data) return <p className="text-muted-foreground">Caricamento…</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Check-in oggi" value={data.checkInsToday.length} list={data.checkInsToday} />
        <Stat title="Check-out oggi" value={data.checkOutsToday.length} list={data.checkOutsToday} />
        <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Prenotazioni questo mese</CardTitle></CardHeader>
          <CardContent><p className="font-display text-4xl">{data.monthCount}</p><p className="text-sm text-gold-light">{eur(data.monthTotal)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-normal text-muted-foreground">Richieste nuove</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3"><span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-3 font-display text-2xl text-primary-foreground">{data.newInquiries}</span>
            <Link to="/admin/inquiries" className="text-sm text-gold-light underline-offset-4 hover:underline">Apri richieste</Link></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="font-display text-2xl font-normal">Prossime prenotazioni confermate</CardTitle></CardHeader>
        <CardContent>
          {data.upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna prenotazione confermata in arrivo.</p> :
            <ul className="divide-y divide-border">{data.upcoming.map(b => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
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
