import { createContext, useContext, useEffect, type ReactNode } from "react";
import it from "./locales/it.json";
import en from "./locales/en.json";
import de from "./locales/de.json";

export type LocaleDefinition = { name: string; flag: string; format: string; og: string; dir: "ltr" | "rtl" };
export const LOCALES: Record<"it" | "en" | "de", LocaleDefinition> = {
  it: { name: "Italiano", flag: "🇮🇹", format: "it-IT", og: "it_IT", dir: "ltr" },
  en: { name: "English", flag: "🇬🇧", format: "en-GB", og: "en_GB", dir: "ltr" },
  de: { name: "Deutsch", flag: "🇩🇪", format: "de-DE", og: "de_DE", dir: "ltr" },
};
export type Language = keyof typeof LOCALES;
export const DICTIONARIES: Record<Language, Record<string, string>> = { it, en, de };
export const LANGUAGE_STORAGE_KEY = "odf_language";
export const languages = Object.keys(LOCALES) as Language[];
export function isLanguage(value: string | null | undefined): value is Language { return !!value && Object.hasOwn(LOCALES, value); }
export function detectLanguage(values: readonly string[]): Language {
  for (const value of values) { const code = value.toLowerCase().split("-")[0]; if (isLanguage(code)) return code; }
  return "it";
}
export type PublicPage = "home" | "privacy" | "ritual" | "guide" | "invest";
/** Localized slugs of the secondary pages (Italian has no language prefix). */
const PAGE_SLUGS: Record<"guide" | "invest", Record<Language, string>> = {
  guide: { it: "guida-sharm", en: "sharm-guide", de: "sharm-reisefuehrer" },
  invest: { it: "investire", en: "invest", de: "investieren" },
};
export function publicPath(language: Language, page: PublicPage = "home") {
  const prefix = language === "it" ? "" : `/${language}`;
  if (page === "ritual") return language === "it" ? "/rito" : `${prefix}/ritual`;
  if (page === "guide" || page === "invest") return `${prefix}/${PAGE_SLUGS[page][language]}`;
  return page === "home" ? prefix || "/" : `${prefix}/privacy`;
}
/** Italian entry URLs where a first visit may follow the browser language (home and the in-room QR page). */
const AUTO_LANGUAGE_PAGES: Record<string, PublicPage> = { "/": "home", "/rito": "ritual" };
export function translate(language: Language, key: string = "", values: Record<string, string | number> = {}) {
  let text = DICTIONARIES[language][key] ?? key;
  for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}
const LanguageContext = createContext<Language>("it");
export function useLanguage() {
  const language = useContext(LanguageContext);
  return { language, locale: LOCALES[language], t: (key: string = "", values?: Record<string, string | number>) => translate(language, key, values), money: (amount: number) => new Intl.NumberFormat(LOCALES[language].format, { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount) };
}
export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <LanguageContext.Provider value={language}><LanguageEffects language={language} />{children}</LanguageContext.Provider>;
}
function LanguageEffects({ language }: { language: Language }) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = LOCALES[language].dir;
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      // Explicit localized links win. Browser preference applies only to the Italian home and QR ritual entry URLs.
      // Query strings (e.g. utm_* from the room QR) are carried over unchanged.
      const autoPage = AUTO_LANGUAGE_PAGES[window.location.pathname];
      if (autoPage) {
        const preferred = isLanguage(saved) ? saved : detectLanguage(navigator.languages);
        if (preferred !== "it") { window.location.replace(`${publicPath(preferred, autoPage)}${window.location.search}${window.location.hash}`); return; }
      }
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch { /* Storage can be disabled; the URL remains authoritative. */ }
  }, [language]);
  return null;
}
