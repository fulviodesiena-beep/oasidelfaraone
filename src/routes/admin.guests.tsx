import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDate } from "@/lib/admin";

export const Route = createFileRoute("/admin/guests")({ component: GuestsPage });

function GuestsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*").order("last_stay", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">I clienti si aggiungono da soli quando confermi una prenotazione (stessa email o telefono = stesso cliente).</p>
      <div className="border border-border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Contatto</TableHead><TableHead>Soggiorni</TableHead><TableHead>Ultima visita</TableHead><TableHead>Note</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Caricamento…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nessun cliente ancora.</TableCell></TableRow>}
            {data.map(g => (
              <TableRow key={g.id}>
                <TableCell>{g.name}{g.nationality && <span className="ml-2 text-xs text-muted-foreground">{g.nationality}</span>}</TableCell>
                <TableCell><div>{g.email ?? "—"}</div><div className="text-xs text-muted-foreground">{g.phone ?? ""}</div></TableCell>
                <TableCell>{g.total_stays}</TableCell>
                <TableCell>{fmtDate(g.last_stay)}</TableCell>
                <TableCell className="max-w-64 truncate">{g.notes ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
