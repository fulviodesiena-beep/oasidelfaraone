import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTOMATIONS, whatsappUrl } from "@/lib/automations/engine";

export const Route = createFileRoute("/admin/today")({ component: TodayPage });
const nameOf = (a: string) => AUTOMATIONS.find(x => x.id === a)?.name ?? a;

function TodayPage() {
  const qc = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["admin", "wa-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_log").select("id, created_at, automation, step, recipient, body, language, booking_id, contact_id").eq("channel", "whatsapp").eq("status", "queued").order("created_at");
      if (error) throw error;
      const ids = [...new Set(data.map(d => d.booking_id).filter(Boolean))] as string[];
      const { data: b } = ids.length ? await supabase.from("bookings").select("id, guest_name, check_in").in("id", ids) : { data: [] };
      return data.map(d => ({ ...d, booking: b?.find(x => x.id === d.booking_id) }));
    },
  });
  const done = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("email_log").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Segnato come inviato"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const skip = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("email_log").update({ status: "skipped", reason: "saltato a mano" }).eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  return (
    <div className="grid max-w-4xl gap-4">
      <p className="text-sm text-muted-foreground">Messaggi WhatsApp preparati dalle automazioni. Nessun messaggio parte da solo: apri WhatsApp, controlla il testo, invia e poi premi “Inviato”.</p>
      {isLoading ? <p className="text-muted-foreground">Caricamento…</p> : tasks.length === 0 ? <p className="text-muted-foreground">Nessun messaggio da inviare oggi.</p> : tasks.map(t => (
        <Card key={t.id}><CardHeader className="pb-2"><CardTitle className="text-base font-medium">{t.automation} · {nameOf(t.automation)} — {t.booking?.guest_name ?? "contatto"} <span className="text-sm font-normal text-muted-foreground">· {t.recipient ?? "numero mancante"} · {t.language.toUpperCase()}</span></CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded border border-border bg-muted/40 p-3 text-xs">{t.body}</pre>
            <div className="flex flex-wrap gap-2">
              <Button asChild disabled={!t.recipient}><a href={whatsappUrl(t.recipient, t.body ?? "")} target="_blank" rel="noreferrer"><MessageCircle />Apri WhatsApp</a></Button>
              <Button variant="outline" onClick={() => done.mutate(t.id)}><Check />Inviato</Button>
              <Button variant="ghost" onClick={() => skip.mutate(t.id)}>Salta</Button>
            </div>
          </CardContent></Card>
      ))}
    </div>
  );
}
