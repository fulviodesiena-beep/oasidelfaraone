import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/admin/BookingFormDialog";
import { DocumentUploader, openDocument, shareDocument } from "@/components/admin/BookingDocuments";
import { fmtDate } from "@/lib/admin";

export const Route = createFileRoute("/admin/documents")({ component: DocumentsPage });

function DocumentsPage() {
  const [bookingId, setBookingId] = useState("");
  const { data: bookings = [] } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: async () => { const { data, error } = await supabase.from("bookings").select("*").order("check_in", { ascending: false }); if (error) throw error; return data; },
  });
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["admin", "documents", "all"],
    queryFn: async () => { const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });
  const byId = new Map(bookings.map(b => [b.id, b]));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 border border-border p-4">
        <Field label="Prenotazione"><Select value={bookingId} onValueChange={setBookingId}><SelectTrigger className="w-72"><SelectValue placeholder="Scegli prenotazione" /></SelectTrigger>
          <SelectContent>{bookings.map(b => <SelectItem key={b.id} value={b.id}>{b.guest_name} · {fmtDate(b.check_in)}</SelectItem>)}</SelectContent></Select></Field>
        {bookingId && <DocumentUploader bookingId={bookingId} />}
      </div>
      <div className="border border-border">
        <Table>
          <TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Prenotazione</TableHead><TableHead>Caricato</TableHead><TableHead>Da</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Caricamento…</TableCell></TableRow>}
            {!isLoading && docs.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nessun documento.</TableCell></TableRow>}
            {docs.map(d => { const b = byId.get(d.booking_id); return (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>{b ? `${b.guest_name} · ${fmtDate(b.check_in)}` : "—"}</TableCell>
                <TableCell>{fmtDate(d.created_at)}</TableCell>
                <TableCell>{d.uploaded_by === "guest" ? "Ospite" : "Proprietario"}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => openDocument(d)}>Apri</Button>
                  <Button size="sm" variant="ghost" aria-label="Invia link via WhatsApp" onClick={() => shareDocument(d, b?.guest_phone)}><MessageCircle /></Button></TableCell>
              </TableRow>); })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
