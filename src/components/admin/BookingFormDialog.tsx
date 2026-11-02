import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { balanceDue, BOOKING_STATUS_LABEL, eur, nightsFor, SOURCE_LABEL, type Booking } from "@/lib/admin";
import { quote } from "@/lib/pricing";

export type BookingDraft = {
  guest_name: string; guest_email: string; guest_phone: string;
  check_in: string; check_out: string; adults: number; children: number;
  extras: string[]; status: Booking["status"];
  is_personal_use: boolean; host_id: string; host_amount: number;
  price_per_night: number; total_price: number; deposit_paid: number;
  notes: string; source: string;
};

export const emptyDraft = (): BookingDraft => ({
  guest_name: "", guest_email: "", guest_phone: "", check_in: "", check_out: "",
  adults: 2, children: 0, extras: [], status: "pending",
  price_per_night: 0, total_price: 0, deposit_paid: 0, notes: "", source: "manual",
  is_personal_use: false, host_id: "", host_amount: 0,
});

/** Suggests a nightly rate from the site's seasonal pricing; 0 when on request. */
export function suggestedRate(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const q = quote(new Date(`${checkIn}T12:00:00`), new Date(`${checkOut}T12:00:00`));
  return q.accommodation && q.nightsCount ? Math.round(q.accommodation / q.nightsCount) : 0;
}

export function BookingFormDialog({ open, onOpenChange, initial, inquiryId }: {
  open: boolean; onOpenChange: (o: boolean) => void; initial: BookingDraft; inquiryId?: string;
}) {
  const qc = useQueryClient();
  const [d, setD] = useState<BookingDraft>(initial);
  useEffect(() => { if (open) setD(initial); }, [open, initial]);
  const nights = nightsFor(d.check_in, d.check_out);
  const set = <K extends keyof BookingDraft>(k: K, v: BookingDraft[K]) => setD(p => ({ ...p, [k]: v }));

  function setDates(ci: string, co: string) {
    setD(p => {
      const rate = p.price_per_night || suggestedRate(ci, co);
      return { ...p, check_in: ci, check_out: co, price_per_night: rate, total_price: rate * nightsFor(ci, co) };
    });
  }

  const { data: hosts = [] } = useQuery({
    queryKey: ["admin", "hosts"], enabled: open,
    queryFn: async () => { const { data, error } = await supabase.from("hosts").select("*").order("name"); if (error) throw error; return data; },
  });
  function setPersonal(on: boolean) {
    setD(p => on ? { ...p, is_personal_use: true, status: "personal", source: "personal", price_per_night: 0, total_price: 0, deposit_paid: 0 }
      : { ...p, is_personal_use: false, status: "pending", source: "manual" });
  }

  const save = useMutation({
    mutationFn: async () => {
      const row: TablesInsert<"bookings"> = {
        guest_name: d.guest_name.trim(), guest_email: d.guest_email.trim() || null, guest_phone: d.guest_phone.trim() || null,
        check_in: d.check_in, check_out: d.check_out, adults: d.adults, children: d.children, extras: d.extras,
        status: d.status, total_nights: nights, price_per_night: d.price_per_night, total_price: d.total_price,
        deposit_paid: d.deposit_paid, notes: d.notes.trim() || null, source: d.source,
        is_personal_use: d.is_personal_use, host_id: d.source === "host" ? d.host_id || null : null, host_amount: d.source === "host" ? d.host_amount : 0,
      };
      const { error } = await supabase.from("bookings").insert(row);
      if (error) throw error;
      if (inquiryId) {
        const { error: e2 } = await supabase.from("inquiries").update({ status: "converted" }).eq("id", inquiryId);
        if (e2) throw e2;
      }
    },
    onSuccess: () => { toast.success("Prenotazione salvata"); qc.invalidateQueries({ queryKey: ["admin"] }); onOpenChange(false); },
    onError: (e: Error) => toast.error(e.message || "Salvataggio non riuscito"),
  });

  const guests = d.adults + d.children;
  const valid = d.guest_name.trim() && nights > 0 && d.adults >= 1 && guests <= 4 && (d.source !== "host" || d.host_id);
  const lock = d.is_personal_use;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{inquiryId ? "Converti richiesta in prenotazione" : "Nuova prenotazione"}</DialogTitle></DialogHeader>
        <form id="booking-form" className="grid gap-4 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); if (valid) save.mutate(); }}>
          <label className="flex items-center gap-3 text-sm sm:col-span-2"><Switch checked={d.is_personal_use} onCheckedChange={setPersonal} />Uso personale (soggiorno gratuito, prezzo 0)</label>
          <Field label="Nome ospite" className="sm:col-span-2"><Input required value={d.guest_name} onChange={e => set("guest_name", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={d.guest_email} onChange={e => set("guest_email", e.target.value)} /></Field>
          <Field label="Telefono"><Input value={d.guest_phone} onChange={e => set("guest_phone", e.target.value)} /></Field>
          <Field label="Arrivo"><Input type="date" required value={d.check_in} onChange={e => setDates(e.target.value, d.check_out)} /></Field>
          <Field label="Partenza"><Input type="date" required min={d.check_in} value={d.check_out} onChange={e => setDates(d.check_in, e.target.value)} /></Field>
          <Field label="Adulti"><Input type="number" min={1} max={4} value={d.adults} onChange={e => set("adults", Number(e.target.value))} /></Field>
          <Field label="Bambini"><Input type="number" min={0} max={3} value={d.children} onChange={e => set("children", Number(e.target.value))} /></Field>
          <Field label="Prezzo a notte (€)"><Input disabled={lock} type="number" min={0} step="0.01" value={d.price_per_night} onChange={e => { const r = Number(e.target.value); setD(p => ({ ...p, price_per_night: r, total_price: r * nights })); }} /></Field>
          <Field label={`Totale (€) · ${nights} notti`}><Input disabled={lock} type="number" min={0} step="0.01" value={d.total_price} onChange={e => set("total_price", Number(e.target.value))} /></Field>
          <Field label="Caparra ricevuta (€)"><Input disabled={lock} type="number" min={0} step="0.01" value={d.deposit_paid} onChange={e => set("deposit_paid", Number(e.target.value))} /></Field>
          <Field label="Saldo da ricevere"><p className="flex h-9 items-center text-sm text-gold-light">{eur(balanceDue(d.total_price, d.deposit_paid))}</p></Field>
          <Field label="Stato">
            <Select disabled={lock} value={d.status} onValueChange={v => set("status", v as BookingDraft["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(BOOKING_STATUS_LABEL).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Origine">
            <Select disabled={lock} value={d.source} onValueChange={v => setD(p => ({ ...p, source: v, status: v === "host" ? "host_collab" : p.status }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(SOURCE_LABEL).filter(([k]) => k !== "personal").map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          {d.source === "host" && <>
            <Field label="Host collaboratore">
              <Select value={d.host_id} onValueChange={v => set("host_id", v)}>
                <SelectTrigger><SelectValue placeholder={hosts.length ? "Seleziona host" : "Nessun host: aggiungilo in Host"} /></SelectTrigger>
                <SelectContent>{hosts.map(h => <SelectItem key={h.id} value={h.id}>{h.name}{h.apartment_number ? ` · App. ${h.apartment_number}` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Importo dovuto dall'host (€)"><Input type="number" min={0} step="0.01" value={d.host_amount} onChange={e => set("host_amount", Number(e.target.value))} /></Field>
          </>}
          <Field label="Extra (separati da virgola)" className="sm:col-span-2"><Input value={d.extras.join(", ")} onChange={e => set("extras", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} /></Field>
          <Field label="Note" className="sm:col-span-2"><Textarea value={d.notes} onChange={e => set("notes", e.target.value)} /></Field>
          {guests > 4 && <p className="text-sm text-destructive sm:col-span-2">Massimo 4 ospiti.</p>}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button type="submit" form="booking-form" disabled={!valid || save.isPending}>Salva prenotazione</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1.5 ${className}`}><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
