import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CONTACT_SOURCE_LABEL, CONTACT_STATUS_LABEL } from "@/lib/contacts";

export const Route = createFileRoute("/admin/contacts")({ component: ContactsPage });

const pad = (n: number) => String(n).padStart(2, "0");

function ContactsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: async () => {
      const [c, o] = await Promise.all([
        supabase.from("contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("occasions").select("*").order("month").order("day"),
      ]);
      if (c.error || o.error) throw c.error ?? o.error;
      return { contacts: c.data, occasions: o.data };
    },
  });
  const term = q.trim().toLowerCase();
  const rows = (data?.contacts ?? []).filter(c => !term || [c.first_name, c.last_name, c.email, c.phone].some(v => v?.toLowerCase().includes(term)));
  return (
    <div className="space-y-4">
      <Input placeholder="Cerca per nome, email o telefono" className="max-w-sm" value={q} onChange={e => setQ(e.target.value)} />
      <div className="border border-border"><Table>
        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Telefono</TableHead><TableHead>Fonte</TableHead><TableHead>Stato</TableHead><TableHead>Consensi</TableHead><TableHead>Ricorrenze</TableHead></TableRow></TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan={7} className="text-muted-foreground">Caricamento…</TableCell></TableRow>}
          {!isLoading && rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-muted-foreground">Nessun contatto.</TableCell></TableRow>}
          {rows.map(c => {
            const occ = (data?.occasions ?? []).filter(o => o.contact_id === c.id);
            return (
              <TableRow key={c.id}>
                <TableCell>{[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}</TableCell>
                <TableCell>{c.email ?? "—"}</TableCell><TableCell className="whitespace-nowrap">{c.phone ?? "—"}</TableCell>
                <TableCell>{CONTACT_SOURCE_LABEL[c.source] ?? c.source}</TableCell><TableCell>{CONTACT_STATUS_LABEL[c.status] ?? c.status}</TableCell>
                <TableCell className="text-xs">{c.unsubscribed_at ? <span className="text-destructive">Disiscritto</span> : <>{c.consent_marketing ? "Marketing ✓" : "Marketing —"}<br />{c.consent_occasions ? "Ricorrenze ✓" : "Ricorrenze —"}</>}</TableCell>
                <TableCell className="text-xs">{occ.length ? occ.map(o => <span key={o.id} className="block">{o.kind} {pad(o.day)}/{pad(o.month)}{o.note ? ` · ${o.note}` : ""}</span>) : "—"}</TableCell>
              </TableRow>);
          })}
        </TableBody></Table></div>
    </div>
  );
}
