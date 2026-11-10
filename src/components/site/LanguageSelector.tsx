import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LANGUAGE_STORAGE_KEY, LOCALES, languages, publicPath, useLanguage, type PublicPage } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

export function LanguageSelector({ page = "home" }: { page?: PublicPage }) {
  const { language, t } = useLanguage();
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={t("Lingua")} title={t("Lingua")}><span className="text-xl" aria-hidden="true">{LOCALES[language].flag}</span></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="z-[100] min-w-44">{languages.map(code => <DropdownMenuItem key={code} asChild><Link to={publicPath(code, page)} onClick={() => { try { localStorage.setItem(LANGUAGE_STORAGE_KEY, code); } catch { /* optional */ } }} className="flex min-h-11 items-center gap-3"><span aria-hidden="true">{LOCALES[code].flag}</span><span lang={code}>{LOCALES[code].name}</span>{code === language && <Check className="ms-auto size-4" />}</Link></DropdownMenuItem>)}</DropdownMenuContent>
  </DropdownMenu>;
}