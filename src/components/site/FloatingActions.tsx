import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mail, MessageCircle, MessagesSquare, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { OWNER_EMAIL, OWNER_WHATSAPP } from "@/lib/site-data";

/**
 * Two fixed buttons on the right edge of every public page:
 * "contact me" (opens WhatsApp / email) and "back to top" with a scroll-progress ring.
 */
export function FloatingActions() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      setShowTop(window.scrollY > 320);
      ringRef.current?.style.setProperty("stroke-dashoffset", String(100 - progress * 100));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (
        e instanceof KeyboardEvent
          ? e.key === "Escape"
          : !wrapRef.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div ref={wrapRef} className="fab-stack" data-testid="floating-actions">
      {open && (
        <div className="fab-menu" role="menu" aria-label={t("Contattami")}>
          <a
            role="menuitem"
            className="fab-option fab-option-wa"
            href={`https://wa.me/${OWNER_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            <MessageCircle size={18} />
            {t("WhatsApp")}
          </a>
          <a
            role="menuitem"
            className="fab-option"
            href={`mailto:${OWNER_EMAIL}`}
            onClick={() => setOpen(false)}
          >
            <Mail size={18} />
            {t("Email")}
          </a>
        </div>
      )}
      <button
        type="button"
        className={`fab fab-contact ${open ? "fab-active" : ""}`}
        aria-label={t(open ? "Chiudi contatti" : "Contattami")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={22} /> : <MessagesSquare size={22} />}
      </button>
      <button
        type="button"
        className={`fab fab-top ${showTop ? "fab-visible" : ""}`}
        aria-label={t("Torna su")}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        onClick={toTop}
      >
        <svg className="fab-ring" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="16" pathLength={100} className="fab-ring-track" />
          <circle ref={ringRef} cx="18" cy="18" r="16" pathLength={100} className="fab-ring-bar" />
        </svg>
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
