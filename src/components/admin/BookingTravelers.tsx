import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, FileDown, Mail, Plus, RefreshCw, Send, Trash2, Upload } from "lucide-react";
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
import { guestUploadLink, sendDelegaToDomina } from "@/lib/delega-send.functions";
import { DELEGA_LOG, GUEST_DOC_KIND, normaliseExtracted } from "@/lib/delega-flow";

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
  // Guest uploads (page /documenti/<token>) with the data read by AI, waiting for one-click confirmation.
  const { data: guestDocs = [] } = useQuery({
    queryKey: ["admin", "documents", GUEST_DOC_KIND, booking.id],
    queryFn: async () => { const { data, error } = await supabase.from("documents").select("*").eq("booking_id", booking.id).eq("kind", GUEST_DOC_KIND).order("name"); if (error) throw error; return data; },
  });
  const { data: sentLog } = useQuery({
    queryKey: ["admin", "delega-sent", booking.id],
    queryFn: async () => { const { data } = await supabase.from("email_log").select("sent_at, recipient, body").eq("booking_id", booking.id).eq("automation", DELEGA_LOG).eq("status", "sent").order("sent_at", { ascending: false }).limit(1).maybeSingle(); return data; },
  });
  const confirmDoc = useMutation({
    mutationFn: async (doc: (typeof guestDocs)[number]) => {
      const x = normaliseExtracted(doc.extracted);
      if (!x) throw new Error("Dati non leggibili: inseriscili a mano qui sotto.");
      const { data: tr, error } = await supabase.from("travelers").insert({
        booking_id: booking.id, first_name: x.first_name, last_name: x.last_name, birth_date: x.birth_date, document_type: x.document_type,
        document_number: x.document_number, nationality: x.nationality, position: travelers.length, contact_id: travelers.length === 0 ? booking.contact_id : null,
      }).select("id").single();
      if (error) throw error;
      const link = await supabase.from("documents").update({ traveler_id: tr.id }).eq("id", doc.id);
      if (link.error) throw link.error;
    },
    onSuccess: () => { toast.success("Viaggiatore aggiunto dal documento"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const linkFn = useServerFn(guestUploadLink);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const makeLink = useMutation({
    mutationFn: () => linkFn({ data: { bookingId: booking.id } }),
    onSuccess: r => { setUploadUrl(r.url); navigator.clipboard?.writeText(r.url).then(() => toast.success("Link copiato"), () => {}); },
    onError: (e: unknown) => toast.error(delegaErrorMessage(e)),
  });
  const sendFn = useServerFn(sendDelegaToDomina);
  const send = useMutation({
    mutationFn: (force: boolean) => sendFn({ data: { bookingId: booking.id, force } }),
    onSuccess: r => { toast.success(`Delega inviata a ${r.to} (CC ${r.cc.join(", ")}) con ${r.attachments.length} allegati`); refresh(); },
    onError: (e: unknown) => toast.error(delegaErrorMessage(e)),
  });

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
        <h3 className="font-display text-xl">Documenti dall'ospite ({guestDocs.length}/{full})</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={makeLink.isPending} onClick={() => makeLink.mutate()}><Upload />Link caricamento documenti</Button>
          {uploadUrl && <>
            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(uploadUrl).then(() => toast.success("Link copiato"), () => {})}><Copy />Copia</Button>
            {booking.guest_phone && <Button size="sm" variant="ghost" asChild><a href={`https://wa.me/${booking.guest_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Ciao! Per preparare la delega d'ingresso al Domina carica qui la foto del documento di ogni viaggiatore: ${uploadUrl}`)}`} target="_blank" rel="noreferrer">Invia su WhatsApp</a></Button>}
          </>}
        </div>
        {guestDocs.length > 0 && <ul className="divide-y divide-border text-sm">{guestDocs.map(d => { const x = normaliseExtracted(d.extracted); return (
          <li key={d.id} className="flex flex-wrap items-center gap-2 py-2">
            <span className="flex-1">{d.name}
              <span className="text-xs text-muted-foreground"> · {x ? `${x.first_name} ${x.last_name.toUpperCase()} · ${x.document_type} ${x.document_number}${x.birth_date ? ` · ${fmtDate(x.birth_date)}` : ""} · lettura ${x.confidence}` : "dati da inserire a mano"}</span></span>
            <Button size="sm" variant="ghost" onClick={() => openDocument(d)}>Apri</Button>
            {d.traveler_id ? <span className="flex items-center gap-1 text-xs text-success"><Check size={14} />confermato</span>
              : x && travelers.length < Math.max(full, 4) && <Button size="sm" variant="outline" disabled={confirmDoc.isPending} onClick={() => confirmDoc.mutate(d)}><Check />Conferma dati</Button>}
          </li>); })}</ul>}
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <h3 className="font-display text-xl">Delega Domina</h3>
        <DelegaStatusLine state={state} hasDoc={!!delegaDoc} error={genError} pending={regen.isPending} />
        <div className="flex flex-wrap gap-2">
          {delegaDoc && <Button size="sm" variant="outline" onClick={() => openDocument(delegaDoc)}><FileDown />Scarica</Button>}
          {delegaDoc && <Button size="sm" disabled={send.isPending} onClick={() => send.mutate(!!sentLog)}><Send />{sentLog ? "Invia di nuovo al Domina" : "Invia al Domina"}</Button>}
          {delegaDoc && settings && <Button size="sm" variant="ghost" asChild><a href={dominaMailto(settings, delegaDoc.name)}><Mail />Email manuale</a></Button>}
          {state.kind === "ready" && <Button size="sm" variant="ghost" disabled={regen.isPending} onClick={() => regen.mutate(true)}><RefreshCw />{delegaDoc ? "Rigenera" : "Genera ora"}</Button>}
        </div>
        {sentLog?.sent_at ? <p className="text-sm text-success">Delega inviata il {new Date(sentLog.sent_at).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })} a {sentLog.recipient}</p>
          : delegaDoc && <p className="text-xs text-muted-foreground">«Invia al Domina» parte da prenotazionisharm@gmail.com con delega e foto dei documenti. Non parte se manca un documento o il pagamento.</p>}
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
