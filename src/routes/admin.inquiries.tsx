import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingFormDialog, emptyDraft, suggestedRate, type BookingDraft } from "@/components/admin/BookingFormDialog";
import { extrasList, fmtDate, nightsFor, type Inquiry } from "@/lib/admin";

export const Route = createFileRoute("/admin/inquiries")({ component: InquiriesPage });

export function draftFromInquiry(i: Inquiry): BookingDraft {
  const ci = i.check_in ?? "", co = i.check_out ?? "";
  const rate = suggestedRate(ci, co);
  return {
    ...emptyDraft(), guest_name: i.guest_name, guest_email: i.guest_email ?? "", guest_phone: i.guest_phone ?? "",
    check_in: ci, check_out: co, adults: i.adults, children: i.children, extras: extrasList(i.extras),
    price_per_night: rate, total_price: rate * nightsFor(ci, co), notes: i.message ?? "", source: "whatsapp",
  };
}

function InquiriesPage() {
  const qc = useQueryClient();
  const [converting, setConverting] = useState<Inquiry | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Inquiry["status"] }) => {
      const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="border border-border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Date richieste</TableHead><TableHead>Ospiti</TableHead><TableHead>Extra</TableHead><TableHead>Ricevuta</TableHead><TableHead>Stato</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-muted-foreground">Caricamento…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={7} className="text-muted-foreground">Nessuna richiesta dal sito, per ora.</TableCell></TableRow>}
            {data.map(i => (
              <TableRow key={i.id}>
                <TableCell><div>{i.guest_name}</div><div className="text-xs text-muted-foreground">{i.guest_phone ?? i.guest_email ?? ""}</div></TableCell>
                <TableCell className="whitespace-nowrap">{fmtDate(i.check_in)} → {fmtDate(i.check_out)}</TableCell>
                <TableCell>{i.adults + i.children}</TableCell>
                <TableCell className="max-w-48 truncate">{extrasList(i.extras).join(", ") || "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{fmtDate(i.created_at)}</TableCell>
                <TableCell>
                  <Select value={i.status} onValueChange={v => setStatus.mutate({ id: i.id, status: v as Inquiry["status"] })}>
                    <SelectTrigger className="w-36" aria-label={`Stato richiesta ${i.guest_name}`}><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="new">Nuova</SelectItem><SelectItem value="contacted">Contattata</SelectItem><SelectItem value="converted">Convertita</SelectItem><SelectItem value="lost">Persa</SelectItem></SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Button size="sm" variant="outline" disabled={i.status === "converted"} onClick={() => setConverting(i)}><ArrowRightLeft />Converti in prenotazione</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {converting && <BookingFormDialog open onOpenChange={o => { if (!o) setConverting(null); }} initial={draftFromInquiry(converting)} inquiryId={converting.id} />}
    </div>
  );
}
