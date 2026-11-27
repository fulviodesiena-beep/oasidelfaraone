import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { confirmNewsletter, unsubscribeContact } from "@/lib/newsletter.functions";
import { LanguageProvider, useLanguage, publicPath, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const token = () => (typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("t") ?? "");

export function UnsubscribePage({ language }: { language: Language }) { return <LanguageProvider language={language}><Unsubscribe /></LanguageProvider>; }
function Unsubscribe() {
  const { t, language } = useLanguage();
  const run = useServerFn(unsubscribeContact);
  const [state, setState] = useState<"idle" | "busy" | "done" | "invalid">("idle");
  const go = async () => { setState("busy"); try { const r = await run({ data: { token: token() } }); setState(r.ok ? "done" : "invalid"); } catch { setState("invalid"); } };
  return <main className="site-section"><div className="site-container max-w-xl space-y-5 text-center">
    <h1 className="font-display text-4xl">{t("Disiscrizione")}</h1>
    {state === "done" ? <p role="status">{t("Fatto: non riceverai più email promozionali da Oasi del Faraone. Le comunicazioni sul tuo eventuale soggiorno restano attive.")}</p>
      : state === "invalid" ? <p role="alert" className="text-destructive">{t("Il link non è valido o è incompleto. Scrivici a prenotazionisharm@gmail.com e ti disiscriviamo noi.")}</p>
      : <><p>{t("Vuoi smettere di ricevere newsletter e offerte da Oasi del Faraone?")}</p><Button onClick={go} disabled={state === "busy"}>{t("Disiscrivimi")}</Button></>}
    <p><a className="text-gold-light" href={publicPath(language)}>{t("← Torna al sito")}</a></p>
  </div></main>;
}

export function ConfirmPage() {
  const [lang, setLang] = useState<Language>("it");
  useEffect(() => { const l = new URLSearchParams(window.location.search).get("l"); if (l === "en" || l === "de") setLang(l); }, []);
  return <LanguageProvider language={lang}><Confirm /></LanguageProvider>;
}
function Confirm() {
  const { t, language } = useLanguage();
  const run = useServerFn(confirmNewsletter);
  const [state, setState] = useState<{ s: "busy" | "ok" | "invalid"; guide?: string | null }>({ s: "busy" });
  useEffect(() => { run({ data: { token: token() } }).then(r => setState({ s: r.ok ? "ok" : "invalid", guide: "guideUrl" in r ? r.guideUrl : null })).catch(() => setState({ s: "invalid" })); }, [run]);
  return <main className="site-section"><div className="site-container max-w-xl space-y-5 text-center">
    <h1 className="font-display text-4xl">{t("Lettere dall’Oasi")}</h1>
    {state.s === "busy" ? <p>{t("Conferma in corso…")}</p> : state.s === "ok" ? <>
      <p role="status">{t("Iscrizione confermata. Benvenuto tra i lettori dell’Oasi!")}</p>
      {state.guide && <Button asChild><a href={state.guide} target="_blank" rel="noreferrer">{t("Scarica la guida ai 12 ristoranti di Sharm")}</a></Button>}
    </> : <p role="alert" className="text-destructive">{t("Il link di conferma non è valido. Prova a iscriverti di nuovo dal sito.")}</p>}
    <p><a className="text-gold-light" href={publicPath(language)}>{t("← Torna al sito")}</a></p>
  </div></main>;
}
