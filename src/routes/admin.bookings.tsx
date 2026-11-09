import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { BookingFormDialog, CHANNELS, emptyDraft, Field, SplitPreview } from "@/components/admin/BookingFormDialog";
import { BookingDocuments } from "@/components/admin/BookingDocuments";
import { BookingCommunications } from "@/components/admin/BookingCommunications";
import { BookingTravelers } from "@/components/admin/BookingTravelers";
import { Switch } from "@/components/ui/switch";
import { useServerFn } from "@tanstack/react-start";
import { checkAvailabilityLive } from "@/lib/ical.functions";
import { defaultOptionExpiry, NEEDS_LIVE_CHECK } from "@/components/admin/BookingFormDialog";
import { previewSplit, suggestedCommission } from "@/lib/finance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { balanceDue, BOOKING_STATUS_LABEL, PIPELINE_LABEL, eur, extrasList, fmtDate, monthOf, SOURCE_LABEL, type Booking } from "@/lib/admin";

export const Route = createFileRoute("/admin/bookings")({ component: BookingsPage });

function BookingsPage() {
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const initial = useMemo(emptyDraft, []);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("check_in", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const rows = data.filter(b => (status === "all" || b.status === status) && (!month || monthOf(b.check_in) === month));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Stato"><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tutti</SelectItem>{Object.entries(BOOKING_STATUS_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Mese di arrivo"><Input type="month" className="w-44" value={month} onChange={e => setMonth(e.target.value)} /></Field>
        {month && <Button variant="ghost" size="sm" onClick={() => setMonth("")}>Tutti i mesi</Button>}
        <Button className="ml-auto" onClick={() => setCreating(true)}><Plus />Nuova prenotazione</Button>
      </div>
      <div className="border border-border">
        <Table>
          <TableHeader><TableRow><TableHead>Ospite</TableHead><TableHead>Date</TableHead><TableHead>Notti</TableHead><TableHead>Totale</TableHead><TableHead>Caparra</TableHead><TableHead>Saldo</TableHead><TableHead>Stato</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-muted-foreground">Caricamento…</TableCell></TableRow>}
            {!isLoading && rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-muted-foreground">Nessuna prenotazione.</TableCell></TableRow>}
            {rows.map(b => (
              <TableRow key={b.id} className="cursor-pointer" onClick={() => setSelected(b)}>
                <TableCell>{b.guest_name}</TableCell>
                <TableCell className="whitespace-nowrap">{fmtDate(b.check_in)} → {fmtDate(b.check_out)}</TableCell>
                <TableCell>{b.total_nights}</TableCell>
                <TableCell>{eur(b.total_price)}</TableCell>
                <TableCell>{eur(b.deposit_paid)}</TableCell>
                <TableCell>{eur(b.balance_due)}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <BookingFormDialog open={creating} onOpenChange={setCreating} initial={initial} />
      <BookingDetail booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function BookingDetail({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<Booking["status"]>("pending");
  const [notes, setNotes] = useState("");
  const [deposit, setDeposit] = useState(0);
  const [stage, setStage] = useState<Booking["pipeline_stage"]>("lead");
  const [channel, setChannel] = useState("diretto");
  const [commission, setCommission] = useState(0);
  const [extra, setExtra] = useState({ option_expires_at: "", arrival_time: "", departure_time: "", delegate_email: "", delegate_phone: "", initial_cleaning: false, final_cleaning: true });
  const live = useServerFn(checkAvailabilityLive);
  const toLocal = (iso: string | null) => iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  useEffect(() => {
    if (booking) { setExtra({ option_expires_at: toLocal(booking.option_expires_at), arrival_time: booking.arrival_time ?? "", departure_time: booking.departure_time ?? "", delegate_email: booking.delegate_email ?? "", delegate_phone: booking.delegate_phone ?? "", initial_cleaning: booking.initial_cleaning, final_cleaning: booking.final_cleaning }); setStatus(booking.status); setNotes(booking.notes ?? ""); setDeposit(Number(booking.deposit_paid)); setStage(booking.pipeline_stage); setChannel(booking.channel || "diretto"); setCommission(Number(booking.channel_commission)); }
  }, [booking]);
  const { data: settings } = useQuery({
    queryKey: ["admin", "settings"], enabled: !!booking,
    queryFn: async () => { const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single(); if (error) throw error; return data; },
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!booking) return;
      if (NEEDS_LIVE_CHECK(status) && status !== booking.status) {
        const r = await live({ data: { checkIn: booking.check_in, checkOut: booking.check_out, excludeId: booking.id } });
        if (r.conflicts.length) throw new Error(`Date non disponibili (verifica in tempo reale): ${r.conflicts.join("; ")}`);
        if (r.syncError) toast.warning(`Booking.com non verificato: ${r.syncError}`);
      }
      const { error } = await supabase.from("bookings").update({ status,
        option_expires_at: status === "option" ? new Date(extra.option_expires_at || defaultOptionExpiry()).toISOString() : null,
        arrival_time: extra.arrival_time.trim() || null, departure_time: extra.departure_time.trim() || null,
        delegate_email: extra.delegate_email.trim() || null, delegate_phone: extra.delegate_phone.trim() || null,
        initial_cleaning: extra.initial_cleaning, final_cleaning: extra.final_cleaning, notes: notes.trim() || null, deposit_paid: deposit, pipeline_stage: stage, channel, channel_commission: booking.is_personal_use ? 0 : commission }).eq("id", booking.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Prenotazione aggiornata"); qc.invalidateQueries({ queryKey: ["admin"] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const verify = useMutation({
    mutationFn: async () => { if (!booking) return; const { error } = await supabase.from("bookings").update({ payment_verified_at: new Date().toISOString() }).eq("id", booking.id); if (error) throw error; },
    onSuccess: () => { toast.success("Pagamento verificato"); qc.invalidateQueries({ queryKey: ["admin"] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!booking) return null;
  const total = Number(booking.total_price);
  const split = previewSplit(total, commission, booking.total_nights, Number(booking.owner_cap_per_night ?? settings?.owner_cap_per_night ?? 80), Number(booking.fds_min_per_night ?? settings?.fds_min_per_night ?? 20), booking.is_personal_use);
  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{booking.guest_name}</DialogTitle></DialogHeader>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Dt k="Date" v={`${fmtDate(booking.check_in)} → ${fmtDate(booking.check_out)}`} />
          <Dt k="Notti" v={String(booking.total_nights)} />
          <Dt k="Ospiti" v={`${booking.adults} adulti, ${booking.children} bambini`} />
          <Dt k="Origine" v={SOURCE_LABEL[booking.source] ?? booking.source} />
          <Dt k="Email" v={booking.guest_email ?? "—"} />
          <Dt k="Telefono" v={booking.guest_phone ?? "—"} />
          <Dt k="Prezzo a notte" v={eur(booking.price_per_night)} />
          <Dt k="Totale" v={eur(total)} />
          {booking.source === "host" && <Dt k="Dovuto dall'host" v={eur(booking.host_amount)} />}
          <Dt k="Extra" v={extrasList(booking.extras).join(", ") || "—"} />
          <Dt k="Canale" v={booking.channel === "diretto" ? "Diretto" : booking.channel} />
          {Number(booking.channel_commission) > 0 && <Dt k="Commissione OTA" v={eur(booking.channel_commission)} />}
          {booking.net_accommodation != null && <Dt k="Netto alloggio" v={eur(booking.net_accommodation)} />}
          {booking.room_amount != null && <Dt k="Quota Carmine (proprietario)" v={eur(booking.room_amount)} />}
          {booking.fds_amount != null && <Dt k="Borsellino FDS" v={eur(booking.fds_amount)} />}
          {booking.owner_cap_per_night != null && <Dt k="Regola applicata" v={`tetto ${eur(booking.owner_cap_per_night)}/notte, minimo FDS ${eur(booking.fds_min_per_night)}/notte`} />}
        </dl>
        <Tabs defaultValue="details">
          <TabsList><TabsTrigger value="details">Dettagli</TabsTrigger><TabsTrigger value="travelers">Viaggiatori e delega</TabsTrigger><TabsTrigger value="docs">Documenti</TabsTrigger><TabsTrigger value="comms">Comunicazioni</TabsTrigger></TabsList>
          <TabsContent value="details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stato"><Select value={status} onValueChange={v => setStatus(v as Booking["status"])}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(BOOKING_STATUS_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
          {status === "option" && <Field label="Opzione valida fino a"><Input type="datetime-local" value={extra.option_expires_at || defaultOptionExpiry()} onChange={e => setExtra({ ...extra, option_expires_at: e.target.value })} /></Field>}
          <Field label="Fase pipeline"><Select value={stage} onValueChange={v => setStage(v as Booking["pipeline_stage"])}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(PIPELINE_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Caparra ricevuta (€)"><Input type="number" min={0} step="0.01" value={deposit} onChange={e => setDeposit(Number(e.target.value))} /></Field>
          <Field label="Canale"><Select disabled={booking.is_personal_use} value={channel} onValueChange={v => { setChannel(v); setCommission(suggestedCommission(v, total)); }}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CHANNELS.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
          <Field label={channel === "booking" ? "Commissione canale (€) · suggerito 15%" : "Commissione canale (€)"}><Input disabled={booking.is_personal_use} type="number" min={0} step="0.01" value={commission} onChange={e => setCommission(Number(e.target.value))} /></Field>
          <SplitPreview net={split.net} owner={split.owner} fds={split.fds} ownerName={settings?.owner_name ?? "Carmine"} />
          <p className="text-sm sm:col-span-2">Saldo da ricevere: <span className="text-gold-light">{eur(balanceDue(total, deposit))}</span></p>
          <div className="flex flex-wrap items-center gap-3 text-sm sm:col-span-2">
            {booking.payment_verified_at ? <span className="text-success">Pagamento verificato il {new Date(booking.payment_verified_at).toLocaleString("it-IT")}</span>
              : <Button type="button" size="sm" variant="outline" disabled={verify.isPending} onClick={() => verify.mutate()}>Pagamento verificato</Button>}
            {booking.ota_closed_at && <span className="text-xs text-muted-foreground">Chiusa su Booking.com il {new Date(booking.ota_closed_at).toLocaleString("it-IT")}</span>}
          </div>
          <Field label="Orario indicativo di arrivo"><Input placeholder="es. 16:00" value={extra.arrival_time} onChange={e => setExtra({ ...extra, arrival_time: e.target.value })} /></Field>
          <Field label="Orario indicativo di partenza"><Input placeholder="es. 10:00" value={extra.departure_time} onChange={e => setExtra({ ...extra, departure_time: e.target.value })} /></Field>
          <Field label="Email delegato (delega)"><Input type="email" value={extra.delegate_email} onChange={e => setExtra({ ...extra, delegate_email: e.target.value })} /></Field>
          <Field label="Cellulare delegato (delega)"><Input value={extra.delegate_phone} onChange={e => setExtra({ ...extra, delegate_phone: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><Switch checked={extra.initial_cleaning} onCheckedChange={v => setExtra({ ...extra, initial_cleaning: v })} />Pulizie iniziali</label>
          <label className="flex items-center gap-2 text-sm"><Switch checked={extra.final_cleaning} onCheckedChange={v => setExtra({ ...extra, final_cleaning: v })} />Pulizie finali</label>
          <Field label="Note" className="sm:col-span-2"><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></Field>
        </div>
          </TabsContent>
          <TabsContent value="travelers"><BookingTravelers booking={booking} /></TabsContent>
          <TabsContent value="docs"><BookingDocuments booking={booking} /></TabsContent>
          <TabsContent value="comms"><BookingCommunications booking={booking} /></TabsContent>
        </Tabs>
        <DialogFooter><Button variant="outline" onClick={onClose}>Chiudi</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Salva modifiche</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Dt({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-xs text-muted-foreground">{k}</dt><dd>{v}</dd></div>;
}
