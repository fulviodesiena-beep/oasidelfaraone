import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/admin/BookingFormDialog";
import { eur, fmtDate, todayKey } from "@/lib/admin";
import { expenseEur } from "@/lib/finance";
import { useServerFn } from "@tanstack/react-start";
import { ecbRate } from "@/lib/fx.functions";

export const Route = createFileRoute("/admin/expenses")({ component: ExpensesPage });
type Expense = Tables<"expenses">;
const CATEGORIES = ["Condominio", "Luce", "Acqua", "Pulizie", "Manutenzione", "Altro"];
const blank = () => ({ id: "", date: todayKey(), category: "Luce", amount: 0, currency: "EUR", amount_eur: "" as string, note: "", paid_by: "Carmine", fx_rate: null as number | null, fx_date: null as string | null, amortize_months: 1 });

function ExpensesPage() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<ReturnType<typeof blank> | null>(null);
  const rateFn = useServerFn(ecbRate);
  async function fetchRate(f: ReturnType<typeof blank>) {
    const r = await rateFn({ data: { date: f.date, from: f.currency } });
    if (!r.rate) { toast.error(r.error ?? "Cambio non disponibile: inseriscilo a mano"); return f; }
    return { ...f, fx_rate: r.rate, fx_date: r.date, amount_eur: String(Math.round(f.amount * r.rate * 100) / 100) };
  }
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "expenses"],
    queryFn: async () => { const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false }); if (error) throw error; return data; },
  });
  const save = useMutation({
    mutationFn: async (input: ReturnType<typeof blank>) => {
      const f = input.currency !== "EUR" && input.amount_eur === "" ? await fetchRate(input) : input;
      const row = { amortize_months: f.amortize_months, fx_rate: f.currency === "EUR" ? null : f.fx_rate, fx_date: f.currency === "EUR" ? null : f.fx_date, date: f.date, category: f.category, amount: f.amount, currency: f.currency, amount_eur: f.currency === "EUR" ? f.amount : f.amount_eur === "" ? null : Number(f.amount_eur), note: f.note.trim() || null, paid_by: f.paid_by, period_month: f.date.slice(0, 7) };
      const { error } = f.id ? await supabase.from("expenses").update(row).eq("id", f.id) : await supabase.from("expenses").insert(row);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Spesa salvata"); setEdit(null); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("expenses").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const open = (x: Expense) => setEdit({ id: x.id, date: x.date, category: x.category, amount: Number(x.amount), currency: x.currency, amount_eur: x.amount_eur == null ? "" : String(x.amount_eur), note: x.note ?? "", paid_by: x.paid_by ?? "Carmine", fx_rate: x.fx_rate == null ? null : Number(x.fx_rate), fx_date: x.fx_date, amortize_months: x.amortize_months ?? 1 });

  return (
    <div className="space-y-4">
      <div className="flex"><Button className="ml-auto" onClick={() => setEdit(blank())}><Plus />Nuova spesa</Button></div>
      <div className="border border-border"><Table>
        <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Categoria</TableHead><TableHead>Importo</TableHead><TableHead>In euro</TableHead><TableHead>Pagata da</TableHead><TableHead>Nota</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan={7} className="text-muted-foreground">Caricamento…</TableCell></TableRow>}
          {data.map(x => (
            <TableRow key={x.id}>
              <TableCell className="whitespace-nowrap">{fmtDate(x.date)}</TableCell><TableCell>{x.category}</TableCell>
              <TableCell>{Number(x.amount).toLocaleString("it-IT")} {x.currency}</TableCell>
              <TableCell>{x.amount_eur == null && x.currency !== "EUR" ? <span className="text-warning">da convertire</span> : <>{eur(expenseEur(x))}{x.fx_rate != null && <span className="block text-xs text-muted-foreground">BCE {Number(x.fx_rate).toLocaleString("it-IT", { maximumFractionDigits: 5 })} del {fmtDate(x.fx_date)}</span>}</>}</TableCell>
              <TableCell>{x.paid_by ?? "Carmine"}{x.amortize_months > 1 && <span className="block text-xs text-muted-foreground">ripartita su {x.amortize_months} mesi</span>}</TableCell><TableCell className="max-w-56 truncate">{x.note ?? "—"}</TableCell>
              <TableCell className="whitespace-nowrap"><Button size="icon" variant="ghost" aria-label="Modifica" onClick={() => open(x)}><Pencil /></Button>
                <Button size="icon" variant="ghost" aria-label="Elimina" onClick={() => { if (confirm("Eliminare questa spesa?")) del.mutate(x.id); }}><Trash2 /></Button></TableCell>
            </TableRow>))}
        </TableBody></Table></div>
      {edit && (
        <Dialog open onOpenChange={o => { if (!o) setEdit(null); }}>
          <DialogContent><DialogHeader><DialogTitle>{edit.id ? "Modifica spesa" : "Nuova spesa"}</DialogTitle></DialogHeader>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); save.mutate(edit); }}>
              <Field label="Data"><Input type="date" required value={edit.date} onChange={e => setEdit({ ...edit, date: e.target.value })} /></Field>
              <Field label="Categoria"><Select value={edit.category} onValueChange={v => setEdit({ ...edit, category: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[...new Set([...CATEGORIES, edit.category])].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Importo"><Input type="number" min={0} step="0.01" required value={edit.amount} onChange={e => setEdit({ ...edit, amount: Number(e.target.value) })} /></Field>
              <Field label="Valuta"><Select value={edit.currency} onValueChange={v => setEdit({ ...edit, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["EUR", "USD", "EGP"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
              {edit.currency !== "EUR" && <Field label="Controvalore in euro (vuoto = cambio BCE automatico)"><div className="flex gap-2"><Input type="number" min={0} step="0.01" value={edit.amount_eur} onChange={e => setEdit({ ...edit, amount_eur: e.target.value, fx_rate: null, fx_date: null })} />
                <Button type="button" variant="outline" size="sm" onClick={async () => setEdit(await fetchRate(edit))}>BCE</Button></div>
                {edit.fx_rate != null && <p className="text-xs text-muted-foreground">Cambio BCE {edit.fx_rate} del {fmtDate(edit.fx_date)}</p>}</Field>}
              <Field label="Pagata da"><Select value={edit.paid_by} onValueChange={v => setEdit({ ...edit, paid_by: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Carmine">Carmine (dalla sua quota)</SelectItem><SelectItem value="FDS">Borsellino FDS</SelectItem></SelectContent></Select></Field>
              <Field label="Ripartisci su"><Select value={String(edit.amortize_months)} onValueChange={v => setEdit({ ...edit, amortize_months: Number(v) })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1, 3, 6, 12].map(n => <SelectItem key={n} value={String(n)}>{n === 1 ? "Solo questo mese" : `${n} mesi da questa data`}</SelectItem>)}</SelectContent></Select></Field>
              <div className="sm:col-span-2"><Field label="Nota"><Input value={edit.note} onChange={e => setEdit({ ...edit, note: e.target.value })} /></Field></div>
              <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={save.isPending}>Salva</Button></DialogFooter>
            </form></DialogContent>
        </Dialog>)}
    </div>
  );
}
