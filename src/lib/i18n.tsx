import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import it from "./locales/it.json";
import en from "./locales/en.json";
import de from "./locales/de.json";

export const LOCALES = {
  it: { name: "Italiano", flag: "🇮🇹", format: "it-IT", og: "it_IT", dir: "ltr" },
  en: { name: "English", flag: "🇬🇧", format: "en-GB", og: "en_GB", dir: "ltr" },
  de: { name: "Deutsch", flag: "🇩🇪", format: "de-DE", og: "de_DE", dir: "ltr" },
} as const;
export type Language = keyof typeof LOCALES;
export const DICTIONARIES: Record<Language, Record<string, string>> = { it, en, de };
export const LANGUAGE_STORAGE_KEY = "odf_language";
export const languages = Object.keys(LOCALES) as Language[];
export function isLanguage(value: string | null | undefined): value is Language { return !!value && Object.hasOwn(LOCALES, value); }
export function detectLanguage(values: readonly string[]): Language {
  for (const value of values) { const code = value.toLowerCase().split("-")[0]; if (isLanguage(code)) return code; }
  return "it";
}
export function publicPath(language: Language, page: "home" | "privacy" = "home") {
  const prefix = language === "it" ? "" : `/${language}`;
  return page === "home" ? prefix || "/" : `${prefix}/privacy`;
}
export function translate(language: Language, key: string, values: Record<string, string | number> = {}) {
  let text = DICTIONARIES[language][key] ?? key;
  for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}
const LanguageContext = createContext<Language>("it");
export function useLanguage() {
  const language = useContext(LanguageContext);
  return { language, locale: LOCALES[language], t: (key: string, values?: Record<string, string | number>) => translate(language, key, values), money: (amount: number) => new Intl.NumberFormat(LOCALES[language].format, { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(amount) };
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
      // Explicit localized links win. Browser preference applies only to the first home visit.
      if (window.location.pathname === "/") {
        const preferred = isLanguage(saved) ? saved : detectLanguage(navigator.languages);
        if (preferred !== "it") { window.location.replace(`${publicPath(preferred)}${window.location.search}${window.location.hash}`); return; }
      }
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch { /* Storage can be disabled; the URL remains authoritative. */ }
  }, [language]);
  return null;
}

// Localized route navigation retains the mounted booking component and its chosen dates.
export function usePublicNavigation(language: Language, page: "home" | "privacy" = "home") {
  const [current, setCurrent] = useState(language);
  const changeLanguage = (next: Language) => {
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* optional persistence */ }
    const target = `${publicPath(next, page)}${window.location.search}${window.location.hash}`;
    window.location.assign(target);
    setCurrent(next);
  };
  return { current, changeLanguage };
}