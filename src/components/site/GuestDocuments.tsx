import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LanguageProvider, useLanguage, publicPath, type Language } from "@/lib/i18n";
import { guestSaveTimes, guestUploadDone, guestUploadInfo, guestUploadTarget } from "@/lib/guest-documents.functions";
import { GUEST_DOC_MAX_BYTES } from "@/lib/delega-flow";
import { Cartouche } from "./Cartouche";

/** Texts of the guest documents page (translated in the locale dictionaries). */
export const GUEST_DOC_TEXTS = [
  "Documenti per il tuo soggiorno", "Ciao {name}!", "Per il tuo arrivo al Domina Coral Bay prepariamo la delega d’ingresso: ci serve una foto del passaporto o della carta d’identità di ogni viaggiatore, bambini compresi.",
  "Ospite {n}", "Caricato", "Carica la foto", "Sostituisci", "Caricamento…",
  "Foto nitida, senza riflessi, con tutti i dati leggibili. I documenti restano privati e servono solo per la delega al Domina.",
  "Orari di viaggio", "Arrivo previsto in villaggio", "Partenza dal villaggio", "Salva orari", "Orari salvati",
  "Fatto! Abbiamo tutti i documenti: Fulvio ti scrive se serve altro.",
  "Il link non è valido o è scaduto. Chiedi un nuovo link a Fulvio: +39 334 732 8158.", "← Torna al sito",
  "Caricamento non riuscito: riprova.", "Soggiorno dal {from} al {to}",
] as const;

const tokenFromPath = () => (typeof window === "undefined" ? "" : decodeURIComponent(window.location.pathname.split("/").pop() ?? ""));

/** Phone photos can weigh 5–10 MB: re-encode large JPEG/PNG/WebP to ~2200px JPEG before upload (HEIC/PDF stay as they are). */
async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 2_500_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2200 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/jpeg", 0.86));
    return out && out.size < file.size ? out : file;
  } catch { return file; }
}

export function GuestDocumentsPage() {
  const [lang, setLang] = useState<Language>("it");
  useEffect(() => { const l = new URLSearchParams(window.location.search).get("l"); if (l === "en" || l === "de") setLang(l); }, []);
  return <LanguageProvider language={lang}><GuestDocuments /></LanguageProvider>;
}

type Info = Awaited<ReturnType<typeof guestUploadInfo>>;
function GuestDocuments() {
  const { t, language, locale } = useLanguage();
  const load = useServerFn(guestUploadInfo), target = useServerFn(guestUploadTarget), done = useServerFn(guestUploadDone), save = useServerFn(guestSaveTimes);
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [times, setTimes] = useState({ arrival: "", departure: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const tk = tokenFromPath(); setToken(tk);
    load({ data: { token: tk } }).then(r => { setInfo(r); if (r.ok) setTimes({ arrival: r.arrival.slice(0, 5), departure: r.departure.slice(0, 5) }); }, () => setInfo({ ok: false }));
  }, [load]);

  const upload = async (slot: number, file: File | undefined) => {
    if (!file || !info?.ok) return;
    setError(null); setBusy(slot);
    try {
      const blob = await shrink(file);
      const type = blob.type || file.type || "image/jpeg";
      if (blob.size > GUEST_DOC_MAX_BYTES) throw new Error(t("Caricamento non riuscito: riprova."));
      const { path, uploadToken } = await target({ data: { token, slot, contentType: type, size: blob.size } });
      const up = await supabase.storage.from("documents").uploadToSignedUrl(path, uploadToken, blob, { contentType: type });
      if (up.error) throw up.error;
      await done({ data: { token, slot, path, contentType: type } });
      setInfo({ ...info, uploaded: info.uploaded.map((u, i) => (i === slot ? true : u)) });
    } catch (e) { setError((e as Error).message || t("Caricamento non riuscito: riprova.")); }
    finally { setBusy(null); }
  };
  const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(locale.format, { day: "numeric", month: "long", timeZone: "UTC" });

  return <main className="site-section min-h-svh">
    <div className="site-container max-w-xl space-y-6">
      <a href={publicPath(language)} className="brand"><Cartouche /><span>{t("Oasi del Faraone")}</span></a>
      <h1 className="font-display text-4xl">{t("Documenti per il tuo soggiorno")}</h1>
      {!info ? <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" size={16} />{t("Caricamento…")}</p>
        : !info.ok ? <p role="alert" className="text-destructive">{t("Il link non è valido o è scaduto. Chiedi un nuovo link a Fulvio: +39 334 732 8158.")}</p>
        : <>
          <p className="font-display text-2xl">{t("Ciao {name}!", { name: info.firstName })}</p>
          <p className="text-sm text-muted-foreground">{t("Soggiorno dal {from} al {to}", { from: fmt(info.checkIn), to: fmt(info.checkOut) })}</p>
          <p className="leading-relaxed">{t("Per il tuo arrivo al Domina Coral Bay prepariamo la delega d’ingresso: ci serve una foto del passaporto o della carta d’identità di ogni viaggiatore, bambini compresi.")}</p>
          <ul className="space-y-3">{info.uploaded.map((ok, i) => <li key={i} className="flex flex-wrap items-center gap-3 border border-border p-4">
            <span className="font-display text-xl">{t("Ospite {n}", { n: String(i + 1) })}</span>
            {ok && <span className="flex items-center gap-1 text-sm text-success"><Check size={16} />{t("Caricato")}</span>}
            <label className={`ml-auto inline-flex cursor-pointer items-center gap-2 border border-input px-4 py-2 text-sm ${busy !== null ? "pointer-events-none opacity-60" : ""}`}>
              {busy === i ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              {busy === i ? t("Caricamento…") : ok ? t("Sostituisci") : t("Carica la foto")}
              <input type="file" accept="image/*,application/pdf" className="sr-only" aria-label={`${t("Carica la foto")} · ${t("Ospite {n}", { n: String(i + 1) })}`} onChange={e => upload(i, e.target.files?.[0])} />
            </label>
          </li>)}</ul>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <p className="text-xs leading-relaxed text-muted-foreground">{t("Foto nitida, senza riflessi, con tutti i dati leggibili. I documenti restano privati e servono solo per la delega al Domina.")}</p>
          {info.uploaded.every(Boolean) && <p role="status" className="text-gold-light">{t("Fatto! Abbiamo tutti i documenti: Fulvio ti scrive se serve altro.")}</p>}
          <form className="space-y-3 border-t border-border pt-6" onSubmit={async e => { e.preventDefault(); setSaved(false); try { await save({ data: { token, ...times } }); setSaved(true); } catch (err) { setError((err as Error).message); } }}>
            <h2 className="font-display text-2xl">{t("Orari di viaggio")}</h2>
            <label className="block text-sm">{t("Arrivo previsto in villaggio")}<input type="time" className="field mt-1" value={times.arrival} onChange={e => setTimes({ ...times, arrival: e.target.value })} /></label>
            <label className="block text-sm">{t("Partenza dal villaggio")}<input type="time" className="field mt-1" value={times.departure} onChange={e => setTimes({ ...times, departure: e.target.value })} /></label>
            <Button type="submit" variant="outline">{t("Salva orari")}</Button>
            {saved && <p role="status" className="text-sm text-success">{t("Orari salvati")}</p>}
          </form>
        </>}
      <p><a className="text-gold-light" href={publicPath(language)}>{t("← Torna al sito")}</a></p>
    </div>
  </main>;
}
