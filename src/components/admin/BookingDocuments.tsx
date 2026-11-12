import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, MessageCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/admin/BookingFormDialog";
import { documentShareLink } from "@/lib/documents.functions";
import { DOCUMENT_TYPES, fmtDate, type Booking, type DocumentRow } from "@/lib/admin";

const BUCKET = "documents";

export async function uploadDocument(bookingId: string, name: string, file: Blob, fileName: string, type: string) {
  const path = `${bookingId}/${Date.now()}-${fileName.replace(/[^\w.-]+/g, "_")}`;
  const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: type });
  if (up.error) throw up.error;
  const { error } = await supabase.from("documents").insert({ booking_id: bookingId, name, file_url: path, file_type: type, uploaded_by: "owner" });
  if (error) throw error;
}

export async function openDocument(doc: DocumentRow) {
  // The admin preview link lives one minute: enough to open it, useless if copied.
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_url, 60);
  if (error) { toast.error(error.message); return; }
  window.open(data.signedUrl, "_blank", "noopener");
}

/** WhatsApp share: sends a 72-hour /api/public/d link (never the storage URL); each click mints a 60-second URL. */
export async function shareDocument(doc: DocumentRow, phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const win = window.open("about:blank", "_blank");
  try {
    const { url, hours } = await documentShareLink({ data: { documentId: doc.id } });
    const text = encodeURIComponent(`${doc.name} — Oasi del Faraone (link valido ${hours} ore): ${url}`);
    const wa = `https://wa.me/${digits}?text=${text}`;
    if (win) win.location.href = wa; else window.open(wa, "_blank", "noopener");
  } catch (e) {
    win?.close();
    toast.error(e instanceof Error ? e.message : "Link non creato");
  }
}

export function DocumentUploader({ bookingId }: { bookingId: string }) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<string>(DOCUMENT_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const up = useMutation({
    mutationFn: () => uploadDocument(bookingId, kind, file!, file!.name, file!.type || "application/octet-stream"),
    onSuccess: () => { toast.success("Documento caricato"); setFile(null); qc.invalidateQueries({ queryKey: ["admin", "documents"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Field label="Tipo"><Select value={kind} onValueChange={setKind}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>{DOCUMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></Field>
      <Field label="File"><Input type="file" className="w-56" onChange={e => setFile(e.target.files?.[0] ?? null)} /></Field>
      <Button size="sm" disabled={!file || up.isPending} onClick={() => up.mutate()}><Upload />Carica</Button>
    </div>
  );
}

export function BookingDocuments({ booking }: { booking: Booking }) {
  const { data: docs = [] } = useQuery({
    queryKey: ["admin", "documents", booking.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("booking_id", booking.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });
  return (
    <section className="space-y-3 border-t border-border pt-4">
      <h3 className="font-display text-xl">Documenti</h3>
      {docs.length === 0 ? <p className="text-sm text-muted-foreground">Nessun documento.</p> :
        <ul className="divide-y divide-border text-sm">{docs.map(doc => (
          <li key={doc.id} className="flex items-center gap-2 py-2">
            <FileText className="size-4 text-gold-light" /><span className="flex-1">{doc.name} <span className="text-xs text-muted-foreground">· {fmtDate(doc.created_at)}</span></span>
            <Button size="sm" variant="ghost" onClick={() => openDocument(doc)}>Apri</Button>
            <Button size="sm" variant="ghost" aria-label="Invia link via WhatsApp" onClick={() => shareDocument(doc, booking.guest_phone)}><MessageCircle /></Button>
          </li>))}</ul>}
      <DocumentUploader bookingId={booking.id} />
    </section>
  );
}
