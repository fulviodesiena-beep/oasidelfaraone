import { useLanguage } from "@/lib/i18n";

/** Discreet footer-only link to the owner's login page (never in the main menu).
 *  A plain anchor: the admin area is a separate client-only app section, and the
 *  public page must also render outside a router (tests, static previews). */
export function OwnerLoginLink() {
  const { t } = useLanguage();
  return (
    <a href="/admin/login" rel="nofollow" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
      {t("Area riservata")}
    </a>
  );
}
