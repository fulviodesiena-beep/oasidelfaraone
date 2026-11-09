// Newsletter "Lettere dall'Oasi": blocchi → sezioni email. Browser-safe.
export type NewsletterBlocks = {
  cartolina?: string; consiglio_titolo?: string; consiglio?: string; segreta_titolo?: string; segreta?: string;
  oasi?: string; cta_label?: string; cta_url?: string; domanda?: string; firma?: string;
};
export const BLOCK_FIELDS: { key: keyof NewsletterBlocks; label: string; long?: boolean }[] = [
  { key: "cartolina", label: "Cartolina", long: true },
  { key: "consiglio_titolo", label: "Consiglio pratico — titolo" }, { key: "consiglio", label: "Consiglio pratico", long: true },
  { key: "segreta_titolo", label: "Sharm segreta — titolo" }, { key: "segreta", label: "Sharm segreta", long: true },
  { key: "oasi", label: "Dall'Oasi", long: true }, { key: "cta_label", label: "Pulsante — testo" }, { key: "cta_url", label: "Pulsante — link" },
  { key: "domanda", label: "Domanda", long: true }, { key: "firma", label: "Firma" },
];
export function newsletterSections(b: NewsletterBlocks) {
  const s: { title?: string; text: string }[] = [];
  if (b.cartolina) s.push({ title: "Cartolina", text: b.cartolina });
  if (b.consiglio) s.push({ title: `Consiglio pratico${b.consiglio_titolo ? ` — ${b.consiglio_titolo}` : ""}`, text: b.consiglio });
  if (b.segreta) s.push({ title: `Sharm segreta${b.segreta_titolo ? ` — ${b.segreta_titolo}` : ""}`, text: b.segreta });
  if (b.oasi) s.push({ title: "Dall'Oasi", text: b.oasi });
  if (b.domanda) s.push({ title: "Domanda", text: b.domanda });
  if (b.firma) s.push({ text: b.firma });
  return s;
}
/** Marketing must never show prices: flags € amounts or "N euro". */
export const containsPrice = (t: string) => /€\s?\d|\d\s?€|\d+\s?(euro|eur)\b/i.test(t);
