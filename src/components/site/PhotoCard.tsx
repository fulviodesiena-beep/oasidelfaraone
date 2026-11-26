import { cdnSrcSet, CARD_WIDTHS } from "@/lib/images";
import { useLanguage } from "@/lib/i18n";
import { useState } from "react";
import { Plus, Check, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function PhotoCard({ title, description, image, photo, price, focus, selected, onAdd }: { title: string; description: string; image: string; photo: string; price?: string | undefined; focus?: string | undefined; selected?: boolean | undefined; onAdd?: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return <article className={`photo-card reveal ${open ? "photo-open" : ""} ${selected ? "photo-selected" : ""}`}>
    <img src={image} srcSet={cdnSrcSet(image, CARD_WIDTHS)} sizes="(min-width: 1024px) 400px, 90vw" alt={photo} loading="lazy" decoding="async" width={1000} height={1000} style={focus ? { objectPosition: focus } : undefined} />
    <div className="photo-shade" />
    <Button variant="ghost" className="photo-trigger" aria-label={`${t(open ? "Chiudi" : "Scopri")} ${title}`} aria-expanded={open} onClick={() => setOpen(v => !v)}><span className="sr-only">{title}</span></Button>
    <div className="photo-content"><p className="photo-caption">{photo}</p><h3>{title}</h3><p className="photo-desc">{description}</p><div className="photo-details">{price && <p className="photo-price">{price}</p>}{onAdd && <Button onClick={onAdd} className="mt-4 h-11" variant={selected ? "default" : "outline"}>{selected ? <Check /> : <Plus />}{t(selected ? "Aggiunta" : "Aggiungi")}</Button>}</div></div>
    <span className="photo-arrow" aria-hidden>{open ? <X size={19} /> : <ArrowUpRight size={19} />}</span>
  </article>;
}
