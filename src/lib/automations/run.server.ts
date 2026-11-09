// Esecuzione delle automazioni (server-only). Lavora con un client Supabase che può leggere/scrivere le tabelle admin.
import * as React from "react";
import { render } from "@react-email/render";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { computeDue, bookingVars, messageText, whatsappUrl, type DueItem, type Toggles, type ABooking } from "./engine";
import { LINK_LABELS, MARKETING_FOOTER, UNSUBSCRIBE_LABEL, type Lang, type MessageKey } from "./messages";
import { signToken } from "./tokens";
import { OasiMessage, type OasiMessageProps } from "@/lib/email-templates/oasi-message";
import { MINA_WHATSAPP, ELISIR_ROOM_ID } from "@/lib/site-data";

type DB = SupabaseClient<Database>;
export const SITE = "https://oasidelfaraone.it";
export const OWNER_INBOX = "prenotazionisharm@gmail.com";
const ATTACHMENTS = ["scheda-gialla-it.pdf", "scheda-gialla-ar.pdf", "modulo-rosa-it.pdf", "modulo-rosa-ar.pdf"];
const THIRTY_DAYS = 30 * 86400;
const langPath = (l: Lang) => (l === "it" ? "" : `/${l}`);
export const unsubscribePath = (l: Lang) => ({ it: "/disiscrizione", en: "/en/unsubscribe", de: "/de/abmelden" }[l]);
const MARKETING = new Set<MessageKey>(["A7", "A9"]);

export async function unsubscribeUrl(contactId: string, lang: Lang) {
  return `${SITE}${unsubscribePath(lang)}?t=${encodeURIComponent(await signToken("unsub", contactId))}`;
}

export type Rendered = { subject: string; text: string; html: string; links: { label: string; url: string }[]; props: OasiMessageProps; whatsapp?: string | undefined };

type Settings = Database["public"]["Tables"]["settings"]["Row"];
async function roomOf(db: DB, roomId: string | null | undefined, s: Settings) {
  const { data } = await db.from("rooms").select("name, unit_number").eq("id", roomId ?? ELISIR_ROOM_ID).maybeSingle();
  return { name: (data?.name ?? "Elisir d’Oriente").replace("’", "'"), unit: data?.unit_number || s.unit_number };
}

/** Renders a due item (or a preview) into subject/text/html plus wa.me link for WhatsApp tasks. */
export async function renderItem(db: DB, item: Pick<DueItem, "msgKey" | "lang" | "name" | "bookingId" | "contactId" | "channel" | "occasion">, s: Settings, opts: { logId?: string } = {}): Promise<Rendered> {
  const lang = item.lang;
  let vars: Record<string, string> = { nome_ospite: item.name, camera: "Elisir d'Oriente", numero_stanza: s.unit_number, occasione: item.occasion ?? "" };
  if (item.bookingId) {
    const { data: b } = await db.from("bookings").select("check_in, check_out, total_nights, extras, room_id").eq("id", item.bookingId).single();
    if (b) { vars = { ...vars, ...bookingVars(b, item.name, lang, await roomOf(db, b.room_id, s)) }; }
  }
  const overrides = (s.template_overrides ?? {}) as Record<string, Partial<Record<Lang, string>>>;
  const { subject, body } = messageText(item.msgKey, lang, vars, overrides);
  const L = (k: string) => LINK_LABELS[k]?.[lang] ?? k;
  const links: { label: string; url: string }[] = [];
  const site = `${SITE}${langPath(lang)}/#book`;
  switch (item.msgKey) {
    case "A1": links.push({ label: L("mina"), url: `https://wa.me/${MINA_WHATSAPP}` }); break;
    case "A2": {
      const { data: files } = await db.storage.from("templates").list();
      for (const f of ATTACHMENTS) if (files?.some(x => x.name === f)) {
        const r = await db.storage.from("templates").createSignedUrl(f, THIRTY_DAYS);
        if (r.data) links.push({ label: L(f), url: r.data.signedUrl });
      }
      if (item.bookingId) {
        const { data: d } = await db.from("documents").select("file_url").eq("booking_id", item.bookingId).eq("kind", "delega").order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (d?.file_url) { const r = await db.storage.from("documents").createSignedUrl(d.file_url, THIRTY_DAYS); if (r.data) links.push({ label: L("delega"), url: r.data.signedUrl }); }
      }
      break;
    }
    case "A5": case "A5r": if (s.review_url) links.push({ label: L("review"), url: opts.logId ? `${SITE}/api/public/r/${opts.logId}` : s.review_url }); break;
    case "A6a": if (s.instagram_url) links.push({ label: L("instagram"), url: s.instagram_url }); if (s.facebook_url) links.push({ label: L("facebook"), url: s.facebook_url }); break;
    case "A6b": if (s.instagram_url) links.push({ label: L("instagram"), url: s.instagram_url }); break;
    case "A8a": case "A8b": case "A9": case "A7": links.push({ label: L("site"), url: site }); break;
  }
  const props: OasiMessageProps = { subject, body, links };
  if (MARKETING.has(item.msgKey)) {
    props.footer = MARKETING_FOOTER[lang];
    props.unsubscribeLabel = UNSUBSCRIBE_LABEL[lang];
    props.unsubscribeUrl = item.contactId ? await unsubscribeUrl(item.contactId, lang) : `${SITE}${unsubscribePath(lang)}`;
  }
  const el = React.createElement(OasiMessage, props);
  const html = await render(el);
  const text = await render(el, { plainText: true });
  const waText = [body, ...links.map(l => `${l.label}: ${l.url}`)].join("\n\n");
  return { subject, text, html, links, props, whatsapp: item.channel === "whatsapp" ? waText : undefined };
}

export async function loadAutomationContext(db: DB, now: Date) {
  const since = new Date(now.getTime() - 400 * 86400_000).toISOString().slice(0, 10);
  const [s, b, c, q, o, l] = await Promise.all([
    db.from("settings").select("*").eq("id", 1).single(),
    db.from("bookings").select("id,status,check_in,check_out,total_nights,extras,guest_name,guest_email,guest_phone,contact_id,confirmed_at,payment_verified_at,deposit_paid,total_price,is_personal_use").gte("check_out", since),
    db.from("contacts").select("id,first_name,email,phone,language,status,consent_occasions,consent_marketing,unsubscribed_at,newsletter_status"),
    db.from("inquiries").select("id,created_at,guest_name,guest_email,contact_id,status,language").gte("created_at", new Date(now.getTime() - 10 * 86400_000).toISOString()),
    db.from("occasions").select("id,contact_id,kind,day,month"),
    db.from("email_log").select("dedup_key,automation,booking_id,step,channel,status,clicked_at").not("dedup_key", "is", null),
  ]);
  const err = s.error ?? b.error ?? c.error ?? q.error ?? o.error ?? l.error;
  if (err) throw new Error(err.message);
  if (!s.data) throw new Error("Impostazioni mancanti");
  return { settings: s.data, bookings: b.data as ABooking[], contacts: c.data, inquiries: q.data, occasions: o.data, logs: l.data };
}

export type RunSummary = { due: number; sent: number; tasks: number; skipped: number; errors: number; details: string[] };

export async function runAutomations(db: DB, now = new Date()): Promise<RunSummary> {
  const ctx = await loadAutomationContext(db, now);
  const toggles = (ctx.settings.automations ?? {}) as Toggles;
  const due = computeDue({ now, toggles, ...ctx });
  const sum: RunSummary = { due: due.length, sent: 0, tasks: 0, skipped: 0, errors: 0, details: [] };
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const brevoMod = await import("./brevo.server");

  for (const item of due) {
    if (item.channel === "brevo" && !brevoMod.hasBrevo()) { sum.details.push(`${item.automation}: Brevo non configurato, rimandato`); continue; }
    // Reserve the dedup key first: the unique constraint guarantees one send per automation/booking/contact.
    const { data: row, error } = await db.from("email_log").insert({
      automation: item.automation, step: item.step, channel: item.channel, booking_id: item.bookingId ?? null, contact_id: item.contactId ?? null,
      inquiry_id: item.inquiryId ?? null, language: item.lang, recipient: item.to, dedup_key: item.dedupKey, status: "queued",
    }).select("id").single();
    if (error) { if (error.code !== "23505") { sum.errors++; sum.details.push(`${item.automation}: ${error.message}`); } continue; }
    const r = await renderItem(db, item, ctx.settings, { logId: row.id });
    const patch = (p: Database["public"]["Tables"]["email_log"]["Update"]) => db.from("email_log").update({ subject: r.subject || null, body: r.whatsapp ?? r.text, ...p }).eq("id", row.id);
    if (!item.to) { await patch({ status: "skipped", reason: item.channel === "whatsapp" ? "telefono mancante" : "email mancante" }); sum.skipped++; continue; }
    if (item.channel === "whatsapp") { await patch({ status: "queued" }); sum.tasks++; continue; }
    try {
      if (item.channel === "email") {
        const res = await sendTemplateEmail("oasi-message", item.to, { templateData: { ...r.props }, idempotencyKey: item.dedupKey, replyTo: OWNER_INBOX });
        if (res.sent) { await patch({ status: "sent", sent_at: new Date().toISOString() }); sum.sent++; }
        else { await patch({ status: "skipped", reason: "destinatario disiscritto o bloccato" }); sum.skipped++; }
      } else {
        const id = await brevoMod.sendBrevoEmail({ to: item.to, name: item.name, subject: r.subject, html: r.html, text: r.text, tag: item.automation });
        await patch({ status: "sent", sent_at: new Date().toISOString(), provider_message_id: id });
        sum.sent++;
      }
    } catch (e) {
      await patch({ status: "error", reason: String((e as Error).message ?? e).slice(0, 500) }); sum.errors++;
    }
  }
  return sum;
}

