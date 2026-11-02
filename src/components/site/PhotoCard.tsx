import { useState } from "react";
import { Plus, Check, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function PhotoCard({ title, description, image, photo, price, focus, selected, onAdd }: { title: string; description: string; image: string; photo: string; price?: string; focus?: string; selected?: boolean; onAdd?: () => void }) {
  const [open, setOpen] = useState(false);
  return <article className={`photo-card reveal ${open ? "photo-open" : ""} ${selected ? "photo-selected" : ""}`}>
    <img src={image} alt={photo} loading="lazy" width={1000} height={1000} style={focus ? { objectPosition: focus } : undefined} />
    <div className="photo-shade" />
    <Button variant="ghost" className="photo-trigger" aria-label={`${open ? "Chiudi" : "Scopri"} ${title}`} aria-expanded={open} onClick={() => setOpen(v => !v)}><span className="sr-only">{title}</span></Button>
    <div className="photo-content"><p className="photo-caption">{photo}</p><h3>{title}</h3><div className="photo-details"><p>{description}</p>{price && <p className="photo-price">{price}</p>}{onAdd && <Button onClick={onAdd} className="mt-4 h-11" variant={selected ? "default" : "outline"}>{selected ? <Check /> : <Plus />}{selected ? "Aggiunta" : "Aggiungi"}</Button>}</div></div>
    <span className="photo-arrow" aria-hidden>{open ? <X size={19} /> : <ArrowUpRight size={19} />}</span>
  </article>;
}
