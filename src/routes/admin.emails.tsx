import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Play, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field } from "@/components/admin/BookingFormDialog";
import { previewAutomation, runAutomationsNow, sendTestToMe } from "@/lib/automations.functions";
import type { Lang, MessageKey } from "@/lib/automations/messages";

export const Route = createFileRoute("/admin/emails")({ component: EmailsPage });

const TEMPLATES: { key: MessageKey; label: string }[] = [
  { key: "A1", label: "A1 Conferma prenotazione" }, { key: "A2", label: "A2 Documenti e aeroporto" }, { key: "A3", label: "A3 Giorno della partenza (WhatsApp)" },
  { key: "A4", label: "A4 Va tutto bene? (WhatsApp)" }, { key: "A5", label: "A5 Grazie e recensione" }, { key: "A5r", label: "A5 Promemoria recensione" },
  { key: "A6a", label: "A6 Social — prima del viaggio" }, { key: "A6b", label: "A6 Social — dopo il soggiorno" }, { key: "A7", label: "A7 Ricorrenze (Brevo)" },
  { key: "A8a", label: "A8 Richiesta — dopo 2 giorni" }, { key: "A8b", label: "A8 Richiesta — dopo 7 giorni" }, { key: "A9", label: "A9 Un anno fa (Brevo)" },
  { key: "NL_CONFIRM", label: "Conferma iscrizione newsletter" },
];
const STATUS: Record<string, string> = { queued: "in coda", sent: "inviata", error: "errore", skipped: "saltata" };

function EmailsPage() {
  const qc = useQueryClient();
  const preview = useServerFn(previewAutomation), test = useServerFn(sendTestToMe), run = useServerFn(runAutomationsNow);
  const [key, setKey] = useState<MessageKey>("A1");
  const [lang, setLang] = useState<Lang>("it");
  const [bookingId, setBookingId] = useState<string>("");
  const { data: bookings = [] } = useQuery({ queryKey: ["admin", "bookings-pick"], queryFn: async () => { const { data, error } = await supabase.from("bookings").select("id, guest_name, check_in, status").in("status", ["confirmed", "host_collab"]).order("check_in", { ascending: false }); if (error) throw error; return data; } });
  const { data: log = [] } = useQuery({ queryKey: ["admin", "email-log"], queryFn: async () => { const { data, error } = await supabase.from("email_log").select("*").order("created_at", { ascending: false }).limit(200); if (error) throw error; return data; } });
  const p = useQuery({ queryKey: ["admin", "preview", key, lang, bookingId], queryFn: () => preview({ data: { key, lang, bookingId: bookingId || null } }) });
  const sendTest = useMutation({ mutationFn: () => test({ data: { key, lang, bookingId: bookingId || null } }), onSuccess: r => { r.sent ? toast.success("Prova inviata a prenotazionisharm@gmail.com") : toast.error("Indirizzo bloccato"); qc.invalidateQueries({ queryKey: ["admin", "email-log"] }); }, onError: (e: Error) => toast.error(e.message) });
  const runNow = useMutation({ mutationFn: () => run(), onSuccess: r => { toast.success(`Dovute ${r.due}: ${r.sent} inviate, ${r.tasks} WhatsApp, ${r.skipped} saltate, ${r.errors} errori`); qc.invalidateQueries({ queryKey: ["admin"] }); }, onError: (e: Error) => toast.error(e.message) });

  return (
    <div className="grid gap-6">
      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Anteprima modelli</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Modello"><Select value={key} onValueChange={v => setKey(v as MessageKey)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEMPLATES.map(t => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Lingua"><Select value={lang} onValueChange={v => setLang(v as Lang)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="it">Italiano</SelectItem><SelectItem value="en">English</SelectItem><SelectItem value="de">Deutsch</SelectItem></SelectContent></Select></Field>
            <Field label="Dati della prenotazione"><Select value={bookingId || "none"} onValueChange={v => setBookingId(v === "none" ? "" : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Esempio</SelectItem>{bookings.map(b => <SelectItem key={b.id} value={b.id}>{b.guest_name} · {b.check_in}</SelectItem>)}</SelectContent></Select></Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={sendTest.isPending} onClick={() => sendTest.mutate()}><Send />Invia prova a me</Button>
            <Button variant="ghost" disabled={runNow.isPending} onClick={() => { if (confirm("Esegue ora le automazioni ACCESE in Impostazioni: le email dovute partiranno davvero verso gli ospiti. Continuare?")) runNow.mutate(); }}><Play />Esegui automazioni ora</Button>
          </div>
          {p.error && <p className="text-sm text-destructive">{(p.error as Error).message}</p>}
          {p.data && <div className="space-y-2"><p className="text-sm"><strong>Oggetto:</strong> {p.data.subject || "— (solo WhatsApp)"}</p>
            <iframe title="Anteprima email" className="h-[560px] w-full rounded border border-border bg-background" srcDoc={p.data.html} sandbox="" /></div>}
        </CardContent></Card>

      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Registro invii</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Automazione</TableHead><TableHead>Canale</TableHead><TableHead>Destinatario</TableHead><TableHead>Oggetto</TableHead><TableHead>Lingua</TableHead><TableHead>Stato</TableHead></TableRow></TableHeader>
            <TableBody>{log.length === 0 ? <TableRow><TableCell colSpan={7} className="text-muted-foreground">Nessun invio registrato.</TableCell></TableRow> : log.map(l => (
              <TableRow key={l.id}><TableCell className="whitespace-nowrap text-xs">{new Date(l.sent_at ?? l.created_at).toLocaleString("it-IT")}</TableCell>
                <TableCell>{l.automation}{l.step ? ` · ${l.step}` : ""}</TableCell><TableCell>{l.channel}</TableCell><TableCell className="text-xs">{l.recipient ?? "—"}</TableCell>
                <TableCell className="max-w-64 truncate text-xs">{l.subject ?? "—"}</TableCell><TableCell>{l.language}</TableCell>
                <TableCell className={l.status === "error" ? "text-destructive" : ""}>{STATUS[l.status]}{l.reason ? ` — ${l.reason}` : ""}{l.clicked_at ? " · link aperto" : ""}</TableCell></TableRow>
            ))}</TableBody></Table>
        </CardContent></Card>
    </div>
  );
}
