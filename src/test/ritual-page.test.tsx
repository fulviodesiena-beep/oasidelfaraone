import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: () => Promise.resolve({ data: [], error: null }) } }));
vi.mock("@tanstack/react-start", async (orig) => ({ ...(await orig<object>()), useServerFn: () => vi.fn() }));
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { DICTIONARIES, languages, publicPath, translate } from "@/lib/i18n";
import { ritualHead, RITUAL_TITLE } from "@/lib/public-head";
import { PublicRitual, RITUAL_STEPS, RITUAL_TEXTS } from "@/components/site/PublicRitual";
import { attributionFrom } from "@/lib/tracking";

const QR = "utm_source=qr&utm_medium=stanza&utm_campaign=elisir";
const SITE = "https://oasidelfaraone.it";
const PRICE = /€|\bEUR\b|\b(40|80|100|120|150)\s?(€|euro)/i;

describe("pagina del rito", () => {
  it("ha le rotte /rito, /en/ritual, /de/ritual anche con i parametri del QR", () => {
    expect(languages.map(l => publicPath(l, "ritual"))).toEqual(["/rito", "/en/ritual", "/de/ritual"]);
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const [path, id] of [["/rito", "/rito"], ["/en/ritual", "/en_/ritual"], ["/de/ritual", "/de_/ritual"]] as const) {
      const match = router.matchRoutes(path, Object.fromEntries(new URLSearchParams(QR))).at(-1);
      expect(match?.routeId).not.toBe(rootRouteId);
      expect(match?.routeId).toBe(id);
    }
  });
  it("registra i parametri UTM del QR come provenienza", () => {
    const a = attributionFrom(`${SITE}/rito?${QR}`, "");
    expect(a).toMatchObject({ utm_source: "qr", utm_medium: "stanza", utm_campaign: "elisir" });
  });
  it("ha canonical pulito, hreflang reciproci e x-default italiano", () => {
    for (const language of languages) {
      const head = ritualHead(language);
      expect(head.links.find(l => l.rel === "canonical")?.href).toBe(SITE + publicPath(language, "ritual"));
      expect(head.links.filter(l => l.rel === "alternate").map(l => ["hrefLang" in l ? l.hrefLang : "", l.href])).toEqual([
        ["it", `${SITE}/rito`], ["en", `${SITE}/en/ritual`], ["de", `${SITE}/de/ritual`], ["x-default", `${SITE}/rito`],
      ]);
      const title = head.meta.find(m => "title" in m)?.title;
      expect(title).toBe(`${translate(language, RITUAL_TITLE)} | Oasi del Faraone`);
    }
    expect(ritualHead("en").meta.find(m => "title" in m)?.title).toContain("The awakening of the scarab");
    expect(ritualHead("de").meta.find(m => "title" in m)?.title).toContain("Das Erwachen des Skarabäus");
  });
  it("è in sitemap con le tre lingue", () => {
    const xml = readFileSync("public/sitemap.xml", "utf8");
    for (const u of ["/rito", "/en/ritual", "/de/ritual"]) expect(xml).toContain(`<loc>${SITE}${u}</loc>`);
  });
  it("ogni testo è tradotto in EN e DE e i nomi propri restano invariati", () => {
    for (const key of [...RITUAL_TEXTS, RITUAL_TITLE]) for (const l of languages) expect(DICTIONARIES[l][key]?.trim(), `${l}: ${key}`).toBeTruthy();
    for (const l of ["en", "de"] as const) {
      expect(translate(l, RITUAL_TITLE)).toContain("Elisir d’Oriente");
      expect(translate(l, "Pubblica la tua alba con #RisveglioDelloScarabeo e tagga @oasidelfaraone.")).toContain("#RisveglioDelloScarabeo");
    }
    expect(RITUAL_STEPS).toHaveLength(4);
  });
  it("non mostra prezzi in nessuna lingua né nei metadati", () => {
    for (const l of languages) {
      for (const key of RITUAL_TEXTS) expect(translate(l, key)).not.toMatch(PRICE);
      expect(JSON.stringify(ritualHead(l))).not.toMatch(PRICE);
    }
  });
  it("mostra un solo titolo, i 4 passi, Instagram e i link in fondo (inglese)", () => {
    const { container } = render(<PublicRitual language="en" />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Elisir d’Oriente · The awakening of the scarab");
    expect(container.querySelectorAll("ol > li")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Open Instagram/ })).toHaveAttribute("href", expect.stringContaining("instagram.com/oasidelfaraone"));
    expect(screen.getByRole("link", { name: "Back to the Oasi del Faraone home page" })).toHaveAttribute("href", "/en");
    expect(screen.getByRole("form", { name: /Letters from the Oasis|Lettere/ })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(PRICE);
  });
});
