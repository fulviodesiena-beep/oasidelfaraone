import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { useLanguage, publicPath } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Double opt-in sign-up for "Lettere dall'Oasi": unchecked consent box, confirmation email required. */
export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const { t, language } = useLanguage();
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const id = compact ? "nl-footer" : "nl-section";
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setState("busy");
    try { await subscribe({ data: { email, lang: language, consent } }); setState("done"); } catch { setState("error"); }
  };
  if (state === "done") return <p role="status" className="text-sm text-gold-light">{t("Quasi fatto: ti abbiamo inviato un’email. Clicca il link di conferma per iscriverti.")}</p>;
  return (
    <form onSubmit={submit} className="space-y-3" aria-label={t("Iscrizione a Lettere dall’Oasi")}>
      {!compact && <p className="text-sm text-muted-foreground">{t("Una lettera ogni due settimane: consigli pratici, la Sharm che non trovi nelle guide e le novità dell’Oasi. In regalo la guida ai 12 ristoranti di Sharm.")}</p>}
      <div className="flex gap-2">
        <label htmlFor={`${id}-email`} className="sr-only">{t("La tua email")}</label>
        <Input id={`${id}-email`} type="email" required maxLength={254} placeholder={t("La tua email")} value={email} onChange={e => setEmail(e.target.value)} />
        <Button type="submit" disabled={!consent || state === "busy"}>{t("Iscriviti")}</Button>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" className="mt-0.5" checked={consent} onChange={e => setConsent(e.target.checked)} />
        <span>{t("Voglio ricevere Lettere dall’Oasi via email. Posso disiscrivermi in ogni momento.")} <a className="underline" href={publicPath(language, "privacy")}>{t("Privacy e cookie")}</a></span>
      </label>
      {state === "error" && <p role="alert" className="text-xs text-destructive">{t("Non siamo riusciti a registrare l’iscrizione. Controlla l’indirizzo e riprova.")}</p>}
    </form>
  );
}
