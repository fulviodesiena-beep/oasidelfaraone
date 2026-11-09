import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, RefreshCw, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/admin/BookingFormDialog";
import { syncBookingNow } from "@/lib/ical.functions";
import { TemplateUploads } from "@/components/admin/TemplateUploads";
import { AutomationSettings } from "@/components/admin/AutomationSettings";
import type { TablesUpdate } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

const when = (s: string | null) => (s ? new Date(s).toLocaleString("it-IT") : "mai");
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2, "0")).join("");

function SettingsPage() {
  const qc = useQueryClient();
  const sync = useServerFn(syncBookingNow);
  const { data: s } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => { const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single(); if (error) throw error; return data; },
  });
  const [h, setH] = useState({ holder_name: "", holder_passport: "", unit_number: "", holder_phone: "", domina_email: "" });
  const [f, setF] = useState({ booking_ical_url: "", owner_cap_per_night: 80, fds_min_per_night: 20, owner_name: "", meta_pixel_id: "" });
  useEffect(() => { if (s) setF({ booking_ical_url: s.booking_ical_url ?? "", owner_cap_per_night: Number(s.owner_cap_per_night ?? 80), fds_min_per_night: Number(s.fds_min_per_night ?? 20), owner_name: s.owner_name ?? "", meta_pixel_id: s.meta_pixel_id ?? "" }); if (s) setH({ holder_name: s.holder_name, holder_passport: s.holder_passport, unit_number: s.unit_number, holder_phone: s.holder_phone, domina_email: s.domina_email }); }, [s]);
  const save = useMutation({
    mutationFn: async (patch: TablesUpdate<"settings">) => { const { error } = await supabase.from("settings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", 1); if (error) throw error; },
    onSuccess: () => { toast.success("Impostazioni salvate"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const runSync = useMutation({
    mutationFn: () => sync(),
    onSuccess: r => { r.ok ? toast.success(`Sincronizzato: ${r.imported} periodi, ${r.removed} rimossi`) : toast.error(r.error ?? "Errore"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!s) return <p className="text-muted-foreground">Caricamento…</p>;
  const exportUrl = `https://oasidelfaraone.it/api/public/ical/${s.ical_token}.ics`;
  const pixelOk = !f.meta_pixel_id || /^\d{5,20}$/.test(f.meta_pixel_id);

  return (
    <div className="grid max-w-3xl gap-6">
      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Calendario Booking.com</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="URL iCal esportato da Booking.com"><Input placeholder="https://admin.booking.com/…/ical.ics" value={f.booking_ical_url} onChange={e => setF({ ...f, booking_ical_url: e.target.value })} /></Field>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => save.mutate({ booking_ical_url: f.booking_ical_url.trim() || null })}>Salva URL</Button>
            <Button variant="outline" disabled={runSync.isPending} onClick={() => runSync.mutate()}><RefreshCw className={runSync.isPending ? "animate-spin" : ""} />Sincronizza ora</Button>
          </div>
          <p className="text-sm text-muted-foreground">Sincronizzazione automatica ogni 5 minuti, più una verifica all'apertura di dashboard e prenotazioni (max 1 al minuto) e in tempo reale prima di confermare. Ultimo tentativo: {when(s.last_sync_attempt_at)} · ultima riuscita: {when(s.last_sync_success_at)}</p>
          {s.last_sync_error && <p className="text-sm text-destructive" role="alert">Errore: {s.last_sync_error}</p>}
          <Field label="Link da incollare su Booking.com (importa calendario)">
            <div className="flex gap-2"><Input readOnly value={exportUrl} onFocus={e => e.target.select()} />
              <Button variant="outline" aria-label="Copia link" onClick={() => { navigator.clipboard.writeText(exportUrl); toast.success("Link copiato"); }}><Copy /></Button></div>
          </Field>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Il vecchio link smetterà di funzionare: dovrai incollare quello nuovo su Booking.com. Continuare?")) save.mutate({ ical_token: newToken() }); }}><RotateCw />Rigenera token</Button>
        </CardContent></Card>

      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Ripartizione ricavi</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Nome proprietario"><Input value={f.owner_name} onChange={e => setF({ ...f, owner_name: e.target.value })} /></Field>
            <Field label="Tetto proprietario €/notte"><Input type="number" min={0} step="0.01" value={f.owner_cap_per_night} onChange={e => setF({ ...f, owner_cap_per_night: Number(e.target.value) })} /></Field>
            <Field label="Minimo Borsellino FDS €/notte"><Input type="number" min={0} step="0.01" value={f.fds_min_per_night} onChange={e => setF({ ...f, fds_min_per_night: Number(e.target.value) })} /></Field>
          </div>
          <p className="text-xs text-muted-foreground">Per notte: proprietario = il minore tra il tetto e (netto per notte − minimo FDS); il resto va al Borsellino FDS. Vale per le nuove conferme: le prenotazioni già confermate mantengono i valori di allora.</p>
          <Button onClick={() => save.mutate({ owner_name: f.owner_name.trim() || null, owner_cap_per_night: f.owner_cap_per_night, fds_min_per_night: f.fds_min_per_night })}>Salva ripartizione</Button>
        </CardContent></Card>

      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Delega Domina</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titolare dell'unità"><Input value={h.holder_name} onChange={e => setH({ ...h, holder_name: e.target.value })} /></Field>
            <Field label="Passaporto titolare"><Input value={h.holder_passport} onChange={e => setH({ ...h, holder_passport: e.target.value })} /></Field>
            <Field label="N. unità"><Input value={h.unit_number} onChange={e => setH({ ...h, unit_number: e.target.value })} /></Field>
            <Field label="Cellulare di riserva"><Input value={h.holder_phone} onChange={e => setH({ ...h, holder_phone: e.target.value })} /></Field>
            <Field label="Email Domina (destinatario)" className="sm:col-span-2"><Input type="email" value={h.domina_email} onChange={e => setH({ ...h, domina_email: e.target.value })} /></Field>
          </div>
          <Button disabled={Object.values(h).some(v => !v.trim())} onClick={() => save.mutate({ holder_name: h.holder_name.trim(), holder_passport: h.holder_passport.trim(), unit_number: h.unit_number.trim(), holder_phone: h.holder_phone.trim(), domina_email: h.domina_email.trim() })}>Salva dati delega</Button>
        </CardContent></Card>

      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Modelli e allegati</CardTitle></CardHeader>
        <CardContent><TemplateUploads /></CardContent></Card>

      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Email e automazioni</CardTitle></CardHeader>
        <CardContent><AutomationSettings s={s} /></CardContent></Card>

      <Card><CardHeader><CardTitle className="font-display text-2xl font-normal">Meta Pixel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="ID Meta Pixel (vuoto = disattivato)"><Input inputMode="numeric" value={f.meta_pixel_id} onChange={e => setF({ ...f, meta_pixel_id: e.target.value.trim() })} /></Field>
          {!pixelOk && <p className="text-sm text-destructive">L'ID deve contenere solo cifre.</p>}
          <Button disabled={!pixelOk} onClick={() => save.mutate({ meta_pixel_id: f.meta_pixel_id || null })}>Salva</Button>
        </CardContent></Card>
    </div>
  );
}
