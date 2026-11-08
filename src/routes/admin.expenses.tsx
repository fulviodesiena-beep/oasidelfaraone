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

export const Route = createFileRoute("/admin/expenses")({ component: ExpensesPage });
type Expense = Tables<"expenses">;
const CATEGORIES = ["Condominio", "Luce", "Acqua", "Pulizie", "Manutenzione", "Altro"];
const blank = () => ({ id: "", date: todayKey(), category: "Luce", amount: 0, currency: "EUR", amount_eur: "" as string, note: "", paid_by: "Carmine" });

function ExpensesPage() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<ReturnType<typeof blank> | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "expenses"],
    queryFn: async () => { const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false }); if (error) throw error; return data; },
  });
  const save = useMutation({
    mutationFn: async (f: ReturnType<typeof blank>) => {
      const row = { date: f.date, category: f.category, amount: f.amount, currency: f.currency, amount_eur: f.currency === "EUR" ? f.amount : f.amount_eur === "" ? null : Number(f.amount_eur), note: f.note.trim() || null, paid_by: f.paid_by, period_month: f.date.slice(0, 7) };
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
  const open = (x: Expense) => setEdit({ id: x.id, date: x.date, category: x.category, amount: Number(x.amount), currency: x.currency, amount_eur: x.amount_eur == null ? "" : String(x.amount_eur), note: x.note ?? "", paid_by: x.paid_by ?? "Carmine" });

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
              <TableCell>{x.amount_eur == null && x.currency !== "EUR" ? <span className="text-warning">da convertire</span> : eur(expenseEur(x))}</TableCell>
              <TableCell>{x.paid_by ?? "Carmine"}</TableCell><TableCell className="max-w-56 truncate">{x.note ?? "—"}</TableCell>
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
              {edit.currency !== "EUR" && <Field label="Controvalore in euro"><Input type="number" min={0} step="0.01" value={edit.amount_eur} onChange={e => setEdit({ ...edit, amount_eur: e.target.value })} /></Field>}
              <Field label="Pagata da"><Select value={edit.paid_by} onValueChange={v => setEdit({ ...edit, paid_by: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Carmine">Carmine (dalla sua quota)</SelectItem><SelectItem value="FDS">Borsellino FDS</SelectItem></SelectContent></Select></Field>
              <div className="sm:col-span-2"><Field label="Nota"><Input value={edit.note} onChange={e => setEdit({ ...edit, note: e.target.value })} /></Field></div>
              <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={save.isPending}>Salva</Button></DialogFooter>
            </form></DialogContent>
        </Dialog>)}
    </div>
  );
}
