// Private guest page /documenti/<token>: the guest uploads one photo per traveler and the arrival/departure times.
// Public server functions guarded only by the signed, expiring `upload` token; all storage access is server-side
// with the service role, files go to the private `documents` bucket under <booking>/ospiti/.
import { createServerFn } from "@tanstack/react-start";
import { GUEST_DOC_KIND, GUEST_DOC_MAX_BYTES, GUEST_DOC_TYPES } from "./delega-flow";

const MAX_SLOTS = 8;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

async function bookingFromToken(token: unknown) {
  if (typeof token !== "string" || token.length > 600) return null;
  const { verifyUploadToken } = await import("./automations/tokens");
  const id = await verifyUploadToken(token);
  if (!id) return null;
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data: b } = await db.from("bookings").select("id, status, guest_name, check_in, check_out, adults, children, arrival_time, departure_time").eq("id", id).maybeSingle();
  if (!b || (b.status !== "confirmed" && b.status !== "host_collab")) return null;
  return { db, b };
}
const slotName = (slot: number) => `Documento ospite ${slot + 1}`;

export const guestUploadInfo = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string }) => ({ token: String(i?.token ?? "") }))
  .handler(async ({ data }) => {
    const ctx = await bookingFromToken(data.token);
    if (!ctx) return { ok: false as const };
    const { db, b } = ctx;
    const { data: docs } = await db.from("documents").select("name, created_at").eq("booking_id", b.id).eq("kind", GUEST_DOC_KIND);
    const slots = Math.min(MAX_SLOTS, Math.max(1, b.adults + b.children));
    const uploaded = Array.from({ length: slots }, (_, i) => (docs ?? []).some(d => d.name === slotName(i)));
    return {
      ok: true as const, firstName: (b.guest_name ?? "").split(" ")[0] ?? "", checkIn: b.check_in, checkOut: b.check_out,
      uploaded, arrival: b.arrival_time ?? "", departure: b.departure_time ?? "",
    };
  });

/** Returns a one-time signed upload URL for one traveler slot. */
export const guestUploadTarget = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string; slot: number; contentType: string; size: number }) => {
    if (!Number.isInteger(i.slot) || i.slot < 0 || i.slot >= MAX_SLOTS) throw new Error("Ospite non valido");
    if (!(GUEST_DOC_TYPES as readonly string[]).includes(i.contentType)) throw new Error("Formato non supportato: carica una foto (JPG, PNG, HEIC) o un PDF.");
    if (!(i.size > 0 && i.size <= GUEST_DOC_MAX_BYTES)) throw new Error("File troppo grande (massimo 12 MB).");
    return { token: String(i.token), slot: i.slot, contentType: i.contentType };
  })
  .handler(async ({ data }) => {
    const ctx = await bookingFromToken(data.token);
    if (!ctx) throw new Error("Link scaduto o non valido. Chiedi un nuovo link a Fulvio.");
    const ext = data.contentType === "application/pdf" ? "pdf" : data.contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const path = `${ctx.b.id}/ospiti/ospite-${data.slot + 1}-${Date.now()}.${ext}`;
    const { data: signed, error } = await ctx.db.storage.from("documents").createSignedUploadUrl(path);
    if (error || !signed) throw new Error("Caricamento non disponibile, riprova tra poco.");
    return { path, uploadToken: signed.token };
  });

/** Registers an uploaded file, replaces the previous one for the same traveler and prefills the data with AI when configured. */
export const guestUploadDone = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string; slot: number; path: string; contentType: string }) => ({ token: String(i.token), slot: Number(i.slot), path: String(i.path), contentType: String(i.contentType) }))
  .handler(async ({ data }) => {
    const ctx = await bookingFromToken(data.token);
    if (!ctx) throw new Error("Link scaduto o non valido. Chiedi un nuovo link a Fulvio.");
    const { db, b } = ctx;
    const prefix = `${b.id}/ospiti/ospite-${data.slot + 1}-`;
    if (!data.path.startsWith(prefix) || data.path.includes("..")) throw new Error("File non valido");
    const file = await db.storage.from("documents").download(data.path);
    if (file.error || !file.data) throw new Error("File non trovato: riprova il caricamento.");
    if (file.data.size > GUEST_DOC_MAX_BYTES) { await db.storage.from("documents").remove([data.path]); throw new Error("File troppo grande (massimo 12 MB)."); }
    const { data: previous } = await db.from("documents").select("id, file_url").eq("booking_id", b.id).eq("kind", GUEST_DOC_KIND).eq("name", slotName(data.slot));
    const ins = await db.from("documents").insert({ booking_id: b.id, name: slotName(data.slot), file_url: data.path, file_type: data.contentType, uploaded_by: "guest", kind: GUEST_DOC_KIND }).select("id").single();
    if (ins.error) throw new Error("Salvataggio non riuscito, riprova.");
    if (previous?.length) {
      await db.from("documents").delete().in("id", previous.map(p => p.id));
      await db.storage.from("documents").remove(previous.map(p => p.file_url));
    }
    // Best effort: reading the document never blocks the upload.
    let read = false;
    try {
      const { extractDocument, hasDocumentAi } = await import("./doc-ai.server");
      if (hasDocumentAi()) {
        const extracted = await extractDocument(new Uint8Array(await file.data.arrayBuffer()), data.contentType);
        if (extracted) { await db.from("documents").update({ extracted }).eq("id", ins.data.id); read = true; }
      }
    } catch (e) { console.error("[guestUploadDone] lettura documento:", (e as Error).message); }
    return { ok: true, read };
  });

export const guestSaveTimes = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string; arrival: string; departure: string }) => {
    const ok = (t: string) => t === "" || TIME.test(t);
    if (!ok(i.arrival) || !ok(i.departure)) throw new Error("Orario non valido (formato HH:MM).");
    return { token: String(i.token), arrival: i.arrival, departure: i.departure };
  })
  .handler(async ({ data }) => {
    const ctx = await bookingFromToken(data.token);
    if (!ctx) throw new Error("Link scaduto o non valido. Chiedi un nuovo link a Fulvio.");
    const { error } = await ctx.db.from("bookings").update({ arrival_time: data.arrival || null, departure_time: data.departure || null }).eq("id", ctx.b.id);
    if (error) throw new Error("Salvataggio non riuscito, riprova.");
    return { ok: true };
  });
