import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { languages, publicPath } from "@/lib/i18n";
import { pageHead } from "@/lib/public-head";
import { PublicGuide } from "@/components/site/PublicGuide";
import { PublicInvest } from "@/components/site/PublicInvest";
import { RESTAURANTS } from "@/lib/site-data";

describe("pagine Guida a Sharm e Investire", () => {
  it("hanno percorsi localizzati, canonical e hreflang per le 3 lingue", () => {
    expect(languages.map((l) => publicPath(l, "guide"))).toEqual([
      "/guida-sharm",
      "/en/sharm-guide",
      "/de/sharm-reisefuehrer",
    ]);
    expect(languages.map((l) => publicPath(l, "invest"))).toEqual([
      "/investire",
      "/en/invest",
      "/de/investieren",
    ]);
    for (const l of languages)
      for (const page of ["guide", "invest"] as const) {
        const head = pageHead(l, page);
        expect(head.links.find((x) => x.rel === "canonical")?.href).toBe(
          `https://oasidelfaraone.it${publicPath(l, page)}`,
        );
        expect(head.links.filter((x) => x.rel === "alternate").length).toBe(4);
      }
    const sitemap = readFileSync("public/sitemap.xml", "utf8");
    for (const l of languages) {
      expect(sitemap).toContain(`<loc>https://oasidelfaraone.it${publicPath(l, "guide")}</loc>`);
      expect(sitemap).toContain(`<loc>https://oasidelfaraone.it${publicPath(l, "invest")}</loc>`);
    }
  });
  it("la guida mostra cosa vedere e tutti i ristoranti; la pagina investimenti contiene MOOVY", () => {
    render(<PublicGuide language="it" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Guida a Sharm el-Sheikh",
    );
    for (const r of RESTAURANTS) expect(screen.getByText(r.name)).toBeTruthy();
  });
  it("la pagina investimenti ha il suo h1 e la sezione MOOVY", () => {
    const { container } = render(<PublicInvest language="en" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Sharm el-Sheikh");
    expect(container.querySelector("#moovy")).not.toBeNull();
    expect(container.querySelector("#investire")).not.toBeNull();
  });
  it("la home non contiene più MOOVY, investimenti, ristoranti né il link all'area riservata", () => {
    const home = readFileSync("src/components/site/PublicHome.tsx", "utf8");
    expect(home).not.toMatch(
      /id="moovy"|id="investire"|id="restaurants"|id="explore"|OwnerLoginLink/,
    );
    expect(home).toContain('publicPath(language, "guide")');
    expect(home).toContain('publicPath(language, "invest")');
  });
});
