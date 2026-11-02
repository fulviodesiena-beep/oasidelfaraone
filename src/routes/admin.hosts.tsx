import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/admin/BookingFormDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { eur, fmtDate, type Host } from "@/lib/admin";

export const Route = createFileRoute("/admin/hosts")({ component: HostsPage });

function HostsPage() {
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Host | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "hosts"],
    queryFn: async () => { const { data, error } = await supabase.from("hosts").select("*").order("name"); if (error) throw error; return data; },
  });
  return (
    <div className="space-y-4">
      <div className="flex"><Button className="ml-auto" onClick={() => setCreating(true)}><Plus />Nuovo host</Button></div>
      <div className="border border-border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Appartamento</TableHead><TableHead>Telefono</TableHead><TableHead>Email</TableHead><TableHead>Totale dovuto</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Caricamento…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nessun host.</TableCell></TableRow>}
            {data.map(h => (
              <TableRow key={h.id} className="cursor-pointer" onClick={() => setSelected(h)}>
                <TableCell>{h.name}</TableCell><TableCell>{h.apartment_number ?? "—"}</TableCell>
                <TableCell>{h.phone ?? "—"}</TableCell><TableCell>{h.email ?? "—"}</TableCell>
                <TableCell className="text-gold-light">{eur(h.total_owed)}</TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </div>
      <NewHost open={creating} onOpenChange={setCreating} />
      <HostDetail host={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function NewHost({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", apartment_number: "", phone: "", email: "", notes: "" });
  const save = useMutation({
    mutationFn: async () => {
      const clean = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim() || null])) as typeof f;
      const { error } = await supabase.from("hosts").insert({ ...clean, name: f.name.trim() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Host aggiunto"); qc.invalidateQueries({ queryKey: ["admin", "hosts"] }); setF({ name: "", apartment_number: "", phone: "", email: "", notes: "" }); onOpenChange(false); },
    onError: (e: Error) => toast.error(e.message),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuovo host</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2"><Input value={f.name} onChange={set("name")} /></Field>
          <Field label="Appartamento"><Input value={f.apartment_number} onChange={set("apartment_number")} /></Field>
          <Field label="Telefono"><Input value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Email" className="sm:col-span-2"><Input type="email" value={f.email} onChange={set("email")} /></Field>
          <Field label="Note" className="sm:col-span-2"><Textarea value={f.notes} onChange={set("notes")} /></Field>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button><Button disabled={!f.name.trim() || save.isPending} onClick={() => save.mutate()}>Salva</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HostDetail({ host, onClose }: { host: Host | null; onClose: () => void }) {
  const { data = [] } = useQuery({
    queryKey: ["admin", "host-bookings", host?.id], enabled: !!host,
    queryFn: async () => { const { data, error } = await supabase.from("bookings").select("*").eq("host_id", host!.id).order("check_in", { ascending: false }); if (error) throw error; return data; },
  });
  if (!host) return null;
  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>{host.name}{host.apartment_number ? ` · App. ${host.apartment_number}` : ""}</DialogTitle></DialogHeader>
        <p className="text-sm">Totale dovuto: <span className="text-gold-light">{eur(host.total_owed)}</span></p>
        {host.notes && <p className="text-sm text-muted-foreground">{host.notes}</p>}
        {data.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna prenotazione collegata.</p> :
          <ul className="divide-y divide-border text-sm">{data.map(b => (
            <li key={b.id} className="flex flex-wrap items-center gap-2 py-2">
              <span className="flex-1">{b.guest_name} · {fmtDate(b.check_in)} → {fmtDate(b.check_out)}</span>
              <span>{eur(b.host_amount)}</span><StatusBadge status={b.status} />
            </li>))}</ul>}
      </DialogContent>
    </Dialog>
  );
}
