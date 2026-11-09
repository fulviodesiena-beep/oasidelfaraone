import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/admin/BookingFormDialog";
import { BLOCK_FIELDS, containsPrice, type NewsletterBlocks } from "@/lib/automations/newsletter";
import { newsletterStats, previewNewsletter, scheduleNewsletter, sendNewsletterTest } from "@/lib/automations.functions";

export const Route = createFileRoute("/admin/newsletter")({ component: NewsletterPage });
const STATUS: Record<string, string> = { draft: "Bozza", approved: "Approvata", scheduled: "Programmata", sent: "Inviata" };

function NewsletterPage() {
  const qc = useQueryClient();
  const { data: issues = [] } = useQuery({ queryKey: ["admin", "newsletter"], queryFn: async () => { const { data, error } = await supabase.from("newsletter_issues").select("*").order("number", { ascending: false }); if (error) throw error; return data; } });
  const { data: subs = 0 } = useQuery({ queryKey: ["admin", "nl-subs"], queryFn: async () => (await supabase.from("contacts").select("id", { count: "exact", head: true }).eq("newsletter_status", "confirmed").is("unsubscribed_at", null)).count ?? 0 });
  const [sel, setSel] = useState<string | null>(null);
  const issue = issues.find(i => i.id === sel) ?? issues[0];
  const add = useMutation({ mutationFn: async () => { const n = (issues[0]?.number ?? 0) + 1; const { error } = await supabase.from("newsletter_issues").insert({ number: n, blocks: { firma: "Fulvio — Oasi del Faraone" } }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "newsletter"] }) });
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {issues.map(i => <Button key={i.id} size="sm" variant={issue?.id === i.id ? "default" : "outline"} onClick={() => setSel(i.id)}>N.{i.number} · {STATUS[i.status]}</Button>)}
        <Button size="sm" variant="ghost" onClick={() => add.mutate()}>+ Nuova uscita</Button>
        <span className="ml-auto text-sm text-muted-foreground">Iscritti confermati: {subs}</span>
      </div>
      {issue && <Editor key={issue.id} issue={issue} />}
    </div>
  );
}

function Editor({ issue }: { issue: any }) {
  const qc = useQueryClient();
  const preview = useServerFn(previewNewsletter), test = useServerFn(sendNewsletterTest), schedule = useServerFn(scheduleNewsletter), stats = useServerFn(newsletterStats);
  const [f, setF] = useState({ subject: issue.subject, preheader: issue.preheader, blocks: (issue.blocks ?? {}) as NewsletterBlocks });
  const [html, setHtml] = useState("");
  const [at, setAt] = useState("");
  const locked = issue.status === "scheduled" || issue.status === "sent";
  const price = containsPrice([f.subject, f.preheader, ...Object.values(f.blocks)].join(" "));
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "newsletter"] });
  const save = useMutation({
    mutationFn: async (status?: string) => { const { error } = await supabase.from("newsletter_issues").update({ ...f, updated_at: new Date().toISOString(), ...(status ? { status, approved_at: status === "approved" ? new Date().toISOString() : null } : {}) }).eq("id", issue.id); if (error) throw error; },
    onSuccess: () => { toast.success("Salvato"); refresh(); loadPreview(); }, onError: (e: Error) => toast.error(e.message),
  });
  const loadPreview = () => preview({ data: { id: issue.id } }).then(r => setHtml(r.html)).catch((e: Error) => toast.error(e.message));
  useEffect(() => { loadPreview(); }, [issue.id]);
  const run = (p: Promise<unknown>, ok: string) => p.then(() => { toast.success(ok); refresh(); }).catch((e: Error) => toast.error(e.message));
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Uscita n.{issue.number} — {STATUS[issue.status]}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Oggetto"><Input disabled={locked} value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} /></Field>
          <Field label="Anteprima (testo accanto all'oggetto)"><Input disabled={locked} value={f.preheader} onChange={e => setF({ ...f, preheader: e.target.value })} /></Field>
          {BLOCK_FIELDS.map(b => <Field key={b.key} label={b.label}>{b.long
            ? <Textarea disabled={locked} rows={4} value={f.blocks[b.key] ?? ""} onChange={e => setF({ ...f, blocks: { ...f.blocks, [b.key]: e.target.value } })} />
            : <Input disabled={locked} value={f.blocks[b.key] ?? ""} onChange={e => setF({ ...f, blocks: { ...f.blocks, [b.key]: e.target.value } })} />}</Field>)}
          {price && <p className="text-sm text-destructive">Il testo contiene un prezzo: le email promozionali non devono mostrare prezzi.</p>}
          {!locked && <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => save.mutate(issue.status === "approved" ? "draft" : undefined)}>Salva bozza</Button>
            <Button variant="outline" onClick={() => run(test({ data: { id: issue.id } }), "Prova inviata a prenotazionisharm@gmail.com")}>Invia prova a me</Button>
            <Button disabled={price} onClick={() => { if (confirm("Confermi di aver riletto e approvato questa newsletter?")) save.mutate("approved"); }}>Approva</Button>
          </div>}
          {issue.status === "approved" && <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
            <Field label="Data e ora di invio"><Input type="datetime-local" value={at} onChange={e => setAt(e.target.value)} /></Field>
            <Button disabled={!at} onClick={() => { if (confirm("La campagna verrà creata su Brevo e inviata a tutti gli iscritti confermati alla data scelta. Procedere?")) run(schedule({ data: { id: issue.id, at: new Date(at).toISOString() } }), "Newsletter programmata"); }}>Programma su Brevo</Button>
          </div>}
          {issue.brevo_campaign_id && <div className="space-y-2 border-t border-border pt-3 text-sm">
            <Button size="sm" variant="ghost" onClick={() => run(stats({ data: { id: issue.id } }), "Statistiche aggiornate")}>Aggiorna statistiche</Button>
            {issue.stats && <p className="text-muted-foreground">{Object.entries(issue.stats).filter(([k]) => ["status", "sent", "delivered", "uniqueViews", "uniqueClicks", "unsubscriptions"].includes(k)).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
          </div>}
        </CardContent></Card>
      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Anteprima</CardTitle></CardHeader>
        <CardContent><iframe title="Anteprima newsletter" sandbox="" srcDoc={html} className="h-[900px] w-full rounded border border-border bg-background" /></CardContent></Card>
    </div>
  );
}
