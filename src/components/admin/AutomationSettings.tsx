import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/admin/BookingFormDialog";
import { AUTOMATIONS, type Toggles } from "@/lib/automations/engine";
import { MESSAGES, type Lang } from "@/lib/automations/messages";
import { brevoStatus, setupBrevoWebhook, syncBrevo } from "@/lib/automations.functions";

/** Owner switches (all off by default), links used by templates, editable A2 text and Brevo status. */
export function AutomationSettings({ s }: { s: Tables<"settings"> }) {
  const qc = useQueryClient();
  const status = useServerFn(brevoStatus), sync = useServerFn(syncBrevo), hook = useServerFn(setupBrevoWebhook);
  const toggles = (s.automations ?? {}) as Toggles;
  const overrides = (s.template_overrides ?? {}) as Record<string, Partial<Record<Lang, string>>>;
  const [links, setLinks] = useState({ review_url: "", facebook_url: "", instagram_url: "", newsletter_guide_url: "" });
  const [lang, setLang] = useState<Lang>("it");
  const [a2, setA2] = useState("");
  useEffect(() => { setLinks({ review_url: s.review_url ?? "", facebook_url: s.facebook_url ?? "", instagram_url: s.instagram_url ?? "", newsletter_guide_url: s.newsletter_guide_url ?? "" }); }, [s]);
  useEffect(() => { setA2(overrides.A2?.[lang] ?? MESSAGES.A2[lang].body); }, [lang, s]);
  const save = useMutation({
    mutationFn: async (patch: Partial<Tables<"settings">>) => { const { error } = await supabase.from("settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1); if (error) throw error; },
    onSuccess: () => { toast.success("Salvato"); qc.invalidateQueries({ queryKey: ["admin"] }); }, onError: (e: Error) => toast.error(e.message),
  });
  const b = useQuery({ queryKey: ["admin", "brevo"], queryFn: () => status() });
  const act = (p: Promise<unknown>, ok: string) => p.then(r => { toast.success(ok + (r && typeof r === "object" && "synced" in r ? `: ${(r as { synced: number }).synced} contatti` : "")); }).catch((e: Error) => toast.error(e.message));
  const okUrl = (u: string) => !u || /^https:\/\/\S+$/.test(u);

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border">{AUTOMATIONS.map(a => (
        <li key={a.id} className="flex items-center gap-3 py-2 text-sm">
          <Switch checked={toggles[a.id] === true} onCheckedChange={v => save.mutate({ automations: { ...toggles, [a.id]: v } })} aria-label={`${a.id} ${a.name}`} />
          <span className="flex-1"><strong>{a.id}</strong> {a.name}<br /><span className="text-xs text-muted-foreground">{a.rule} · {a.channels}</span></span>
        </li>))}</ul>
      <p className="text-xs text-muted-foreground">Controllo automatico ogni ora. Le email sul soggiorno partono solo per prenotazioni confermate da adesso in poi; i messaggi WhatsApp compaiono in “Da inviare oggi”.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {([["review_url", "Link recensione (es. Google)"], ["instagram_url", "Instagram"], ["facebook_url", "Facebook"], ["newsletter_guide_url", "Guida 12 ristoranti (PDF)"]] as const).map(([k, l]) => (
          <Field key={k} label={l}><Input placeholder="https://…" value={links[k]} onChange={e => setLinks({ ...links, [k]: e.target.value.trim() })} /></Field>))}
      </div>
      <Button disabled={!Object.values(links).every(okUrl)} onClick={() => save.mutate({ review_url: links.review_url || null, instagram_url: links.instagram_url || null, facebook_url: links.facebook_url || null, newsletter_guide_url: links.newsletter_guide_url || null })}>Salva link</Button>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-sm font-medium">Testo A2 — documenti e aeroporto (le regole possono cambiare)</p>
        <div className="flex gap-2">{(["it", "en", "de"] as Lang[]).map(l => <Button key={l} size="sm" variant={l === lang ? "default" : "outline"} onClick={() => setLang(l)}>{l.toUpperCase()}</Button>)}</div>
        <Textarea rows={14} value={a2} onChange={e => setA2(e.target.value)} />
        <p className="text-xs text-muted-foreground">Segnaposto: {"{{nome_ospite}}"}, {"{{camera}}"}. La nota “Verifica sempre i requisiti aggiornati su viaggiaresicuri.it” viene aggiunta se manca.</p>
        <div className="flex gap-2">
          <Button onClick={() => save.mutate({ template_overrides: { ...overrides, A2: { ...overrides.A2, [lang]: a2 } } })}>Salva testo {lang.toUpperCase()}</Button>
          <Button variant="ghost" onClick={() => { const o = { ...overrides.A2 }; delete o[lang]; save.mutate({ template_overrides: { ...overrides, A2: o } }); }}>Ripristina originale</Button>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <p className="font-medium">Brevo (email promozionali)</p>
        {b.data?.configured ? (b.data.ok ? <p className="text-success">Collegato{b.data.account ? ` · ${b.data.account}` : ""}</p> : <p className="text-destructive">Errore: {b.data.error}</p>)
          : <p className="text-muted-foreground">Non collegato: manca la chiave Brevo nelle impostazioni segrete del progetto.</p>}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!b.data?.ok} onClick={() => act(sync(), "Contatti sincronizzati")}>Sincronizza contatti consenzienti</Button>
          <Button variant="outline" disabled={!b.data?.ok} onClick={() => act(hook(), "Collegamento disiscrizioni attivo")}>Attiva ricezione disiscrizioni</Button>
        </div>
        <p className="text-xs text-muted-foreground">Mittente Brevo: prenotazioni@oasidelfaraone.it (va verificato su Brevo). Ricevono newsletter solo gli iscritti con doppia conferma.</p>
      </div>
    </div>
  );
}
