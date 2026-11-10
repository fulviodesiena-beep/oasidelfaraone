import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileDown, Mail, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/admin/BookingFormDialog";
import { openDocument } from "@/components/admin/BookingDocuments";
import { fmtDate, type Booking } from "@/lib/admin";
import { isMinor } from "@/lib/contacts";
import { delegaState, dominaMailto } from "@/lib/delega";
import { ensureDelega } from "@/lib/delega.functions";

const blank = { first_name: "", last_name: "", birth_date: "", document_type: "passaporto", document_number: "", nationality: "" };

export function useTravelers(bookingId: string) {
  return useQuery({
    queryKey: ["admin", "travelers", bookingId],
    queryFn: async () => { const { data, error } = await supabase.from("travelers").select("*").eq("booking_id", bookingId).order("position"); if (error) throw error; return data; },
  });
}

export function BookingTravelers({ booking }: { booking: Booking }) {
  const qc = useQueryClient();
  const { data: travelers = [] } = useTravelers(booking.id);
  const [f, setF] = useState(blank);
  const gen = useServerFn(ensureDelega);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("travelers").insert({
        booking_id: booking.id, first_name: f.first_name.trim(), last_name: f.last_name.trim(), birth_date: f.birth_date || null,
        document_type: f.document_type, document_number: f.document_number.trim().toUpperCase() || null, nationality: f.nationality.trim() || null,
        position: travelers.length, contact_id: travelers.length === 0 ? booking.contact_id : null,
      });
      if (error) throw error;
    },
    onSuccess: () => { setF(blank); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("travelers").delete().eq("id", id); if (error) throw error; },
    onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  const { data: settings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => { const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single(); if (error) throw error; return data; },
  });
  const { data: delegaDoc } = useQuery({
    queryKey: ["admin", "documents", "delega", booking.id],
    queryFn: async () => { const { data } = await supabase.from("documents").select("*").eq("booking_id", booking.id).eq("kind", "delega").maybeSingle(); return data; },
  });
  const [genError, setGenError] = useState<string | null>(null);
  const regen = useMutation({
    mutationFn: (force: boolean) => gen({ data: { bookingId: booking.id, force } }),
    onSuccess: r => { setGenError(null); r.status === "ready" ? toast.success("Delega generata") : toast.error("Delega non ancora generabile: controlla stato, pagamento e documenti"); refresh(); },
    onError: (e: unknown) => { const m = delegaErrorMessage(e); setGenError(m); toast.error(m); },
  });
  const state = delegaState(booking, travelers);
  // Generates automatically the first time the rules are met and no delega exists yet.
  const autoTried = useRef(false);
  useEffect(() => {
    if (state.kind !== "ready" || delegaDoc !== null || autoTried.current || regen.isPending) return;
    autoTried.current = true;
    regen.mutate(false);
  }, [state.kind, delegaDoc, regen]);
  const full = booking.adults + booking.children;

  return (
    <section className="space-y-3">
      <h3 className="font-display text-xl">Viaggiatori ({travelers.length}/{full})</h3>
      {travelers.length === 0 ? <p className="text-sm text-muted-foreground">Nessun viaggiatore: servono per la delega Domina.</p> :
        <ul className="divide-y divide-border text-sm">{travelers.map(t => (
          <li key={t.id} className="flex items-center gap-2 py-2">
            <span className="flex-1">{t.first_name} {t.last_name.toUpperCase()}
              <span className="text-xs text-muted-foreground"> · {t.birth_date ? fmtDate(t.birth_date) : "nascita —"}{isMinor(t.birth_date, booking.check_in) ? " · minore" : ""} · {t.document_type} {t.document_number ?? <span className="text-destructive">documento mancante</span>}</span></span>
            <Button size="icon" variant="ghost" aria-label="Rimuovi viaggiatore" onClick={() => del.mutate(t.id)}><Trash2 /></Button>
          </li>))}</ul>}
      {travelers.length < 4 && (
        <form className="grid gap-2 sm:grid-cols-3" onSubmit={e => { e.preventDefault(); if (f.first_name.trim() && f.last_name.trim()) add.mutate(); }}>
          <Field label="Nome"><Input required value={f.first_name} onChange={e => setF({ ...f, first_name: e.target.value })} /></Field>
          <Field label="Cognome"><Input required value={f.last_name} onChange={e => setF({ ...f, last_name: e.target.value })} /></Field>
          <Field label="Data di nascita"><Input type="date" value={f.birth_date} onChange={e => setF({ ...f, birth_date: e.target.value })} /></Field>
          <Field label="Documento"><Select value={f.document_type} onValueChange={v => setF({ ...f, document_type: v })}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="passaporto">Passaporto</SelectItem><SelectItem value="carta_identita">Carta d'identità</SelectItem></SelectContent></Select></Field>
          <Field label="Numero documento"><Input value={f.document_number} onChange={e => setF({ ...f, document_number: e.target.value })} /></Field>
          <Field label="Nazionalità"><Input value={f.nationality} onChange={e => setF({ ...f, nationality: e.target.value })} /></Field>
          <Button type="submit" size="sm" className="sm:col-span-3 sm:justify-self-start" disabled={add.isPending}><Plus />Aggiungi viaggiatore</Button>
        </form>)}

      <div className="space-y-2 border-t border-border pt-3">
        <h3 className="font-display text-xl">Delega Domina</h3>
        <DelegaStatusLine state={state} hasDoc={!!delegaDoc} error={genError} pending={regen.isPending} />
        <div className="flex flex-wrap gap-2">
          {delegaDoc && <Button size="sm" variant="outline" onClick={() => openDocument(delegaDoc)}><FileDown />Scarica</Button>}
          {delegaDoc && settings && <Button size="sm" variant="outline" asChild><a href={dominaMailto(settings, delegaDoc.name)}><Mail />Prepara email al Domina</a></Button>}
          {state.kind === "ready" && <Button size="sm" variant="ghost" disabled={regen.isPending} onClick={() => regen.mutate(true)}><RefreshCw />{delegaDoc ? "Rigenera" : "Genera ora"}</Button>}
        </div>
        {delegaDoc && <p className="text-xs text-muted-foreground">Ricorda di allegare il PDF scaricato all'email.</p>}
      </div>
    </section>
  );
}

/** Readable message for any server-function failure (never an empty toast). */
export function delegaErrorMessage(e: unknown) {
  const m = e instanceof Error ? e.message : typeof e === "string" ? e : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "";
  return m.trim() || "Errore sconosciuto durante la generazione della delega: riprova o controlla la connessione.";
}

export function DelegaStatusLine({ state, hasDoc, error, pending }: { state: ReturnType<typeof delegaState>; hasDoc: boolean; error?: string | null | undefined; pending?: boolean | undefined }) {
  if (state.kind === "not_eligible") return <p className="text-sm text-muted-foreground">La delega si prepara quando la prenotazione è confermata.</p>;
  if (state.kind === "unpaid") return <p className="text-sm text-warning">Delega in attesa: pagamento non ancora verificato.</p>;
  if (state.kind === "missing_docs") return <p className="text-sm text-destructive">Delega: mancano i documenti di {state.missing} viaggiatori.</p>;
  if (error && !hasDoc) return <p role="alert" className="text-sm text-destructive">{error}</p>;
  return <p className="text-sm text-success">{hasDoc ? "Delega pronta" : pending ? "Delega in preparazione…" : "Delega non ancora generata: premi «Genera ora»."}{state.missing > 0 && <span className="text-warning"> · mancano i documenti di {state.missing} viaggiatori</span>}</p>;
}
