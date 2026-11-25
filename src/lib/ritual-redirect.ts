import { redirect } from "@tanstack/react-router";
import type { Language } from "./i18n";
import { publicPath } from "./i18n";

/**
 * The ritual page was removed (November 2026): its secret is now only hinted at on the home.
 * The old URLs stay alive because printed in-room QR codes point at them: they redirect
 * permanently to the ritual section of the home, keeping the QR query (utm_*) for attribution.
 */
export function ritualRedirectHref(language: Language, searchStr = "") {
  const home = publicPath(language);
  return `${home}${searchStr}#rito`;
}
export function redirectRitual(language: Language, searchStr = ""): never {
  throw redirect({ href: ritualRedirectHref(language, searchStr), statusCode: 301 });
}
