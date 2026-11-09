import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import type { Lang } from "@/lib/automations/messages";

const pickLang = (l: unknown): Lang => (l === "en" || l === "de" ? l : "it");
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

/** Public: starts double opt-in. Never reveals whether the address already exists. */
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((i: { email: string; lang: string; consent: boolean }) => {
    const email = String(i.email ?? "").trim().toLowerCase();
    if (!EMAIL.test(email) || email.length > 254) throw new Error("invalid_email");
    if (i.consent !== true) throw new Error("consent_required");
    return { email, lang: pickLang(i.lang) };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: id, error } = await db.rpc("upsert_contact", { _name: "", _email: data.email, _phone: "", _source: "newsletter", _status: "iscritto" });
    if (error || !id) throw new Error("save_failed");
    const { data: c } = await db.from("contacts").select("newsletter_status, language, unsubscribed_at").eq("id", id).single();
    if (c?.newsletter_status === "confirmed" && !c.unsubscribed_at) return { ok: true };
    let ip: string | null = null; try { ip = getRequestIP({ xForwardedFor: true }) ?? null; } catch { /* no request ip */ }
    await db.from("contacts").update({ newsletter_status: "pending", newsletter_requested_at: new Date().toISOString(), newsletter_ip: ip, language: c?.language ?? data.lang }).eq("id", id);
    const { signToken } = await import("@/lib/automations/tokens");
    const { SITE } = await import("@/lib/automations/run.server");
    const { MESSAGES, LINK_LABELS } = await import("@/lib/automations/messages");
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const url = `${SITE}/newsletter/conferma?t=${encodeURIComponent(await signToken("nl-confirm", id))}&l=${data.lang}`;
    const m = MESSAGES.NL_CONFIRM[data.lang];
    const day = new Date().toISOString().slice(0, 10);
    const res = await sendTemplateEmail("oasi-message", data.email, { templateData: { subject: m.subject, body: m.body, cta: { label: LINK_LABELS.confirm[data.lang], url } }, idempotencyKey: `nl-confirm-${id}-${day}`, replyTo: "prenotazionisharm@gmail.com" });
    await db.from("email_log").insert({ automation: "NL_CONFIRM", channel: "email", contact_id: id, recipient: data.email, subject: m.subject, language: data.lang, status: res.sent ? "sent" : "skipped", sent_at: res.sent ? new Date().toISOString() : null, reason: res.sent ? null : "indirizzo bloccato" });
    return { ok: true };
  });

export const confirmNewsletter = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string }) => ({ token: String(i.token ?? "").slice(0, 500) }))
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/automations/tokens");
    const id = await verifyToken("nl-confirm", data.token);
    if (!id) return { ok: false };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { data: c } = await db.from("contacts").update({ newsletter_status: "confirmed", newsletter_confirmed_at: now, consent_marketing: true, consent_marketing_at: now, consent_marketing_source: "newsletter", unsubscribed_at: null, updated_at: now }).eq("id", id).select("email, first_name, language").single();
    if (!c) return { ok: false };
    const b = await import("@/lib/automations/brevo.server");
    if (b.hasBrevo() && c.email) { try { const { data: s } = await db.from("settings").select("brevo_list_id").eq("id", 1).single(); const list = s?.brevo_list_id ?? await b.ensureList(); await b.upsertBrevoContact(c.email, { NOME: c.first_name ?? "", LINGUA: c.language ?? "it" }, [list]); await db.from("contacts").update({ brevo_synced_at: now }).eq("id", id); } catch (e) { console.error("Brevo sync failed", e); } }
    const { data: s2 } = await db.from("settings").select("newsletter_guide_url").eq("id", 1).single();
    return { ok: true, guideUrl: s2?.newsletter_guide_url || null };
  });

/** One-click unsubscribe from all marketing (CRM + Brevo), effective immediately. */
export const unsubscribeContact = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string }) => ({ token: String(i.token ?? "").slice(0, 500) }))
  .handler(async ({ data }) => {
    const { verifyToken } = await import("@/lib/automations/tokens");
    const id = await verifyToken("unsub", data.token);
    if (!id) return { ok: false };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { data: c } = await db.from("contacts").update({ unsubscribed_at: now, consent_marketing: false, consent_occasions: false, newsletter_status: "none", updated_at: now }).eq("id", id).select("email").single();
    if (!c) return { ok: false };
    const b = await import("@/lib/automations/brevo.server");
    if (b.hasBrevo() && c.email) { try { await b.blacklistBrevo(c.email); } catch (e) { console.error("Brevo blacklist failed", e); } }
    return { ok: true };
  });
