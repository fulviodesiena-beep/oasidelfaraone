import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MessageKey, Lang } from "@/lib/automations/messages";

const KEYS: MessageKey[] = ["A1", "A2", "A3", "A4", "A5", "A5r", "A6a", "A6b", "A7", "A8a", "A8b", "A9", "NL_CONFIRM"];
type Ctx = { supabase: any; userId: string };
async function admin(context: Ctx) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Non autorizzato");
  return context.supabase;
}
const validPreview = (i: { key: MessageKey; bookingId?: string | null; lang: Lang }) => {
  if (!KEYS.includes(i.key)) throw new Error("Modello non valido");
  if (!["it", "en", "de"].includes(i.lang)) throw new Error("Lingua non valida");
  if (i.bookingId && !/^[0-9a-f-]{36}$/i.test(i.bookingId)) throw new Error("Prenotazione non valida");
  return { key: i.key, bookingId: i.bookingId ?? null, lang: i.lang };
};
async function renderPreview(db: any, d: { key: MessageKey; bookingId: string | null; lang: Lang }) {
  const { renderItem } = await import("@/lib/automations/run.server");
  const { data: s, error } = await db.from("settings").select("*").eq("id", 1).single();
  if (error) throw new Error(error.message);
  let name = "Maria", contactId: string | undefined;
  if (d.bookingId) { const { data: b } = await db.from("bookings").select("guest_name, contact_id").eq("id", d.bookingId).single(); name = (b?.guest_name ?? name).split(" ")[0]; contactId = b?.contact_id ?? undefined; }
  const channel = d.key === "A3" || d.key === "A4" ? "whatsapp" : d.key === "A7" || d.key === "A9" ? "brevo" : "email";
  return renderItem(db, { msgKey: d.key, lang: d.lang, name, bookingId: d.bookingId ?? undefined, contactId, channel, occasion: "compleanno 15/6" }, s);
}

export const previewAutomation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(validPreview)
  .handler(async ({ data, context }) => {
    const r = await renderPreview(await admin(context), data);
    return { subject: r.subject, html: r.html, text: r.whatsapp ?? r.text };
  });

export const sendTestToMe = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(validPreview)
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const r = await renderPreview(db, data);
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const { OWNER_INBOX } = await import("@/lib/automations/run.server");
    const subject = `[PROVA] ${r.subject || data.key}`;
    const res = await sendTemplateEmail("oasi-message", OWNER_INBOX, { templateData: { ...r.props, subject, body: r.whatsapp ?? r.props.body }, replyTo: OWNER_INBOX });
    await db.from("email_log").insert({ automation: "TEST", step: data.key, channel: "email", recipient: OWNER_INBOX, subject, language: data.lang, booking_id: data.bookingId, status: res.sent ? "sent" : "skipped", sent_at: res.sent ? new Date().toISOString() : null, reason: res.sent ? null : "indirizzo bloccato" });
    return { sent: res.sent };
  });

export const runAutomationsNow = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin(context);
    const { runAutomations } = await import("@/lib/automations/run.server");
    return runAutomations(db);
  });

export const brevoStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await admin(context);
    const { hasBrevo, brevo } = await import("@/lib/automations/brevo.server");
    if (!hasBrevo()) return { configured: false, ok: false, account: null as string | null, error: null as string | null };
    try { const a = await brevo<{ email?: string; companyName?: string }>("/account"); return { configured: true, ok: true, account: a.companyName ?? a.email ?? null, error: null }; }
    catch (e) { return { configured: true, ok: false, account: null, error: (e as Error).message }; }
  });

/** Pushes consenting contacts to Brevo: newsletter list only for double opt-in; soft opt-in clients without list. */
export const syncBrevo = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin(context);
    const b = await import("@/lib/automations/brevo.server");
    const { canNewsletter, canSoftOptIn, canOccasions } = await import("@/lib/automations/engine");
    await b.ensureAttributes();
    const listId = await b.ensureList();
    await db.from("settings").update({ brevo_list_id: listId }).eq("id", 1);
    const [{ data: contacts }, { data: stays }] = await Promise.all([
      db.from("contacts").select("*").not("email", "is", null),
      db.from("bookings").select("contact_id, check_out").eq("status", "confirmed"),
    ]);
    const last = new Map<string, string>();
    for (const s of stays ?? []) if (s.contact_id && (!last.get(s.contact_id) || last.get(s.contact_id)! < s.check_out)) last.set(s.contact_id, s.check_out);
    let synced = 0, blacklisted = 0;
    for (const c of contacts ?? []) {
      if (c.unsubscribed_at) { await b.blacklistBrevo(c.email); blacklisted++; continue; }
      const nl = canNewsletter(c), other = canSoftOptIn(c) || canOccasions(c);
      if (!nl && !other) continue;
      await b.upsertBrevoContact(c.email, { NOME: c.first_name ?? "", LINGUA: c.language ?? "it", ...(last.get(c.id) ? { ULTIMO_SOGGIORNO: last.get(c.id) } : {}) }, nl ? [listId] : [], nl ? [] : [listId]);
      await db.from("contacts").update({ brevo_synced_at: new Date().toISOString() }).eq("id", c.id);
      synced++;
    }
    return { synced, blacklisted, listId };
  });

export const setupBrevoWebhook = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await admin(context);
    const { brevo } = await import("@/lib/automations/brevo.server");
    const { signToken } = await import("@/lib/automations/tokens");
    const { SITE } = await import("@/lib/automations/run.server");
    const url = `${SITE}/api/public/brevo-webhook?t=${encodeURIComponent(await signToken("brevo-webhook", "v1"))}`;
    const existing = await brevo<{ webhooks?: { id: number; url: string }[] }>("/webhooks?type=marketing");
    if (existing.webhooks?.some(w => w.url.startsWith(`${SITE}/api/public/brevo-webhook`))) return { created: false };
    await brevo("/webhooks", { method: "POST", body: { url, description: "Oasi CRM — disiscrizioni", events: ["unsubscribed", "spam", "hardBounce"], type: "marketing" } });
    return { created: true };
  });

async function newsletterProps(db: any, id: string) {
  const { data: n, error } = await db.from("newsletter_issues").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  const { newsletterSections, containsPrice } = await import("@/lib/automations/newsletter");
  const { MARKETING_FOOTER } = await import("@/lib/automations/messages");
  const sections = newsletterSections(n.blocks ?? {});
  if (containsPrice([n.subject, n.preheader, ...sections.map(s => s.text)].join(" "))) throw new Error("La newsletter contiene un prezzo: rimuovilo prima di inviare.");
  return { n, props: { subject: n.subject, preheader: n.preheader, sections, cta: n.blocks?.cta_url ? { label: n.blocks.cta_label || "Scopri", url: n.blocks.cta_url } : undefined, footer: MARKETING_FOOTER.it, unsubscribeLabel: "Disiscriviti con un clic" } };
}
const idOnly = (i: { id: string }) => { if (!/^[0-9a-f-]{36}$/i.test(i.id)) throw new Error("Id non valido"); return { id: i.id }; };

export const previewNewsletter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idOnly)
  .handler(async ({ data, context }) => {
    const { props } = await newsletterProps(await admin(context), data.id);
    const React = await import("react"); const { render } = await import("@react-email/render");
    const { OasiMessage } = await import("@/lib/email-templates/oasi-message");
    return { html: await render(React.createElement(OasiMessage, { ...props, unsubscribeUrl: "#" })) };
  });

export const sendNewsletterTest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idOnly)
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const { n, props } = await newsletterProps(db, data.id);
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const { OWNER_INBOX } = await import("@/lib/automations/run.server");
    const res = await sendTemplateEmail("oasi-message", OWNER_INBOX, { templateData: { ...props, subject: `[PROVA] ${n.subject}`, unsubscribeUrl: "https://oasidelfaraone.it/disiscrizione" }, replyTo: OWNER_INBOX });
    await db.from("email_log").insert({ automation: "TEST", step: `newsletter-${n.number}`, channel: "email", recipient: OWNER_INBOX, subject: `[PROVA] ${n.subject}`, status: res.sent ? "sent" : "skipped", sent_at: res.sent ? new Date().toISOString() : null });
    return { sent: res.sent };
  });

/** Creates the Brevo campaign for an approved issue and schedules it. Requires A10 on and explicit approval. */
export const scheduleNewsletter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string; at: string }) => { idOnly(i); if (Number.isNaN(Date.parse(i.at)) || Date.parse(i.at) < Date.now() + 10 * 60_000) throw new Error("Scegli una data almeno 10 minuti nel futuro"); return i; })
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const { data: s } = await db.from("settings").select("automations, brevo_list_id").eq("id", 1).single();
    if (!(s?.automations as Record<string, boolean>)?.["A10"]) throw new Error("Attiva prima l'automazione A10 in Impostazioni");
    if (!s?.brevo_list_id) throw new Error("Sincronizza prima i contatti con Brevo");
    const { n, props } = await newsletterProps(db, data.id);
    if (n.status !== "approved") throw new Error("Approva la newsletter prima di programmarla");
    const React = await import("react"); const { render } = await import("@react-email/render");
    const { OasiMessage } = await import("@/lib/email-templates/oasi-message");
    const html = await render(React.createElement(OasiMessage, { ...props, unsubscribeUrl: "{{ unsubscribe }}" }));
    const b = await import("@/lib/automations/brevo.server");
    const c = await b.brevo<{ id: number }>("/emailCampaigns", { method: "POST", body: {
      name: `Lettere dall'Oasi n.${n.number}`, subject: n.subject, previewText: n.preheader, sender: b.BREVO_SENDER, replyTo: b.REPLY_TO,
      htmlContent: html, recipients: { listIds: [s.brevo_list_id] }, scheduledAt: new Date(data.at).toISOString(),
    } });
    await db.from("newsletter_issues").update({ status: "scheduled", scheduled_at: data.at, brevo_campaign_id: c.id, updated_at: new Date().toISOString() }).eq("id", n.id);
    return { campaignId: c.id };
  });

export const newsletterStats = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idOnly)
  .handler(async ({ data, context }) => {
    const db = await admin(context);
    const { data: n } = await db.from("newsletter_issues").select("brevo_campaign_id").eq("id", data.id).single();
    if (!n?.brevo_campaign_id) return { stats: null };
    const b = await import("@/lib/automations/brevo.server");
    const c = await b.brevo<{ status?: string; statistics?: { globalStats?: Record<string, number> } }>(`/emailCampaigns/${n.brevo_campaign_id}`);
    const stats = { status: c.status, ...(c.statistics?.globalStats ?? {}) };
    await db.from("newsletter_issues").update({ stats, ...(c.status === "sent" ? { status: "sent" } : {}) }).eq("id", data.id);
    return { stats };
  });
