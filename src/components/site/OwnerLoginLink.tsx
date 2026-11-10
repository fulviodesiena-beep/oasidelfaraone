import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n";

/** Discreet footer-only link to the owner's login page (never in the main menu). */
export function OwnerLoginLink() {
  const { t } = useLanguage();
  return (
    <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
      {t("Area riservata")}
    </Link>
  );
}
