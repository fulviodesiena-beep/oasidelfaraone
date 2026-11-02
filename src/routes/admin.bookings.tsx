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
import { BookingFormDialog, emptyDraft, Field } from "@/components/admin/BookingFormDialog";
import { BookingDocuments } from "@/components/admin/BookingDocuments";
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
  useEffect(() => {
    if (booking) { setStatus(booking.status); setNotes(booking.notes ?? ""); setDeposit(Number(booking.deposit_paid)); setStage(booking.pipeline_stage); }
  }, [booking]);
  const save = useMutation({
    mutationFn: async () => {
      if (!booking) return;
      const { error } = await supabase.from("bookings").update({ status, notes: notes.trim() || null, deposit_paid: deposit, pipeline_stage: stage }).eq("id", booking.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Prenotazione aggiornata"); qc.invalidateQueries({ queryKey: ["admin"] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!booking) return null;
  const total = Number(booking.total_price);
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
        </dl>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stato"><Select value={status} onValueChange={v => setStatus(v as Booking["status"])}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(BOOKING_STATUS_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Fase pipeline"><Select value={stage} onValueChange={v => setStage(v as Booking["pipeline_stage"])}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(PIPELINE_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Caparra ricevuta (€)"><Input type="number" min={0} step="0.01" value={deposit} onChange={e => setDeposit(Number(e.target.value))} /></Field>
          <p className="text-sm sm:col-span-2">Saldo da ricevere: <span className="text-gold-light">{eur(balanceDue(total, deposit))}</span></p>
          <Field label="Note" className="sm:col-span-2"><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></Field>
        </div>
        <BookingDocuments booking={booking} />
        <DialogFooter><Button variant="outline" onClick={onClose}>Chiudi</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Salva modifiche</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Dt({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-xs text-muted-foreground">{k}</dt><dd>{v}</dd></div>;
}
