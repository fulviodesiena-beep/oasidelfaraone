import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RITUAL_CLUES, RITUAL_TEASER_TEXTS } from "@/components/site/RitualTeaser";
import { DICTIONARIES, languages } from "@/lib/i18n";
import { HERO_VIDEO, MINA_TOURS_URL, MINA_WHATSAPP, ROOMS } from "@/lib/site-data";
import { Route } from "@/routes/index";
import { Route as RitoRoute } from "@/routes/rito";
import { Route as EnRitualRoute } from "@/routes/en_.ritual";
import { ritualRedirectHref } from "@/lib/ritual-redirect";

class FakeIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

function renderPage() {
  const Index = Route.options.component as () => React.ReactElement;
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <Index />
    </QueryClientProvider>,
  );
}

// November 2026 redesign: the home opens on the owner's reef video, the ritual is only hinted at,
// and excursions are booked on Mina's own catalogue instead of a section of this site.
describe("home experience", () => {
  it("opens on the reef video, muted and inline so phones can autoplay it", () => {
    const { container } = renderPage();
    const video = container.querySelector("#top video") as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.muted).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(video.getAttribute("poster")).toBe(HERO_VIDEO.poster);
    for (const file of Object.values(HERO_VIDEO)) {
      const path = resolve(__dirname, "../../public", `.${file}`);
      expect(existsSync(path)).toBe(true);
      // Keep the opening light: no web file above 4 MB.
      expect(statSync(path).size).toBeLessThan(4 * 1024 * 1024);
    }
  });

  it("no longer lists the excursions and links Mina's catalogue above his WhatsApp", () => {
    const { container } = renderPage();
    expect(container.querySelector("#extras")).toBeNull();
    const tours = screen.getByRole("link", { name: /Scopri e prenota le escursioni di Mina/ });
    expect(tours).toHaveAttribute("href", MINA_TOURS_URL);
    expect(tours).toHaveAttribute("target", "_blank");
    const chat = screen.getByRole("link", { name: /Chatta con Mina su WhatsApp/ });
    expect(chat).toHaveAttribute("href", `https://wa.me/${MINA_WHATSAPP}`);
    expect(tours.compareDocumentPosition(chat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("hints at the ritual without giving away its steps, and leads to the booking", () => {
    const { container } = renderPage();
    const teaser = container.querySelector("#rito") as HTMLElement;
    expect(teaser).not.toBeNull();
    // The full ritual text (scarab in the palm, three turns, the note under the statue) never reaches the home.
    expect(container.textContent).not.toContain(ROOMS[0].ritual);
    expect(teaser.textContent).not.toMatch(/tre volte|Scrigno|statua/);
    expect(screen.getByRole("link", { name: /Prenota e vivi il rito/ })).toHaveAttribute("href", "#book");
    const clue = screen.getAllByRole("button", { expanded: false }).find(b => b.textContent?.includes("Uno scarabeo"));
    expect(clue).toBeDefined();
    fireEvent.click(clue!);
    expect(clue).toHaveAttribute("aria-expanded", "true");
  });

  it("translates every ritual teaser text", () => {
    expect(RITUAL_CLUES).toHaveLength(3);
    for (const language of languages) for (const key of RITUAL_TEASER_TEXTS) expect(DICTIONARIES[language]).toHaveProperty(key);
  });

  it("starts with the video alone: menu and texts wait for the intro to end", () => {
    const { container } = renderPage();
    // jsdom has no playing video: the intro is skipped at once (no autoplay), as on reduced motion.
    expect(container.querySelector("main")?.className).toMatch(/intro-(playing|done)/);
    expect(container.querySelector(".intro-progress")).not.toBeNull();
  });

  it("keeps the hero short and the menu essential", () => {
    const { container } = renderPage();
    const hero = container.querySelector("#top .hero-content") as HTMLElement;
    expect(hero.querySelectorAll("p").length).toBeLessThanOrEqual(2);
    const mainNav = screen.getByRole("navigation", { name: "Navigazione principale" });
    expect(mainNav.querySelectorAll("a").length).toBeLessThanOrEqual(5);
  });

  it("no longer prints Mina's phone number under his WhatsApp button", () => {
    const { container } = renderPage();
    expect(container.querySelector("#mina")?.textContent).not.toContain("348 180 4764");
  });
});

describe("old ritual page", () => {
  it("redirects the in-room QR URLs to the ritual section of the home, keeping the QR parameters", () => {
    const qr = "?utm_source=qr&utm_medium=room&utm_campaign=elisir";
    expect(ritualRedirectHref("it", qr)).toBe(`/${qr}#rito`);
    expect(ritualRedirectHref("en", qr)).toBe(`/en${qr}#rito`);
    expect(ritualRedirectHref("de")).toBe("/de#rito");
    const before = RitoRoute.options.beforeLoad as unknown as (ctx: { location: { searchStr: string } }) => void;
    let thrown: unknown;
    try { before({ location: { searchStr: qr } }); } catch (e) { thrown = e; }
    expect(thrown).toBeDefined();
    expect(JSON.stringify(thrown)).toContain(`/${qr}#rito`);
    expect(EnRitualRoute.options.component).toBeUndefined();
  });
});

describe("November 26 requests", () => {
  it("sends 'Le stanze' straight to the room photos while there is one room", () => {
    renderPage();
    const nav = screen.getByRole("navigation", { name: "Navigazione principale" });
    const rooms = Array.from(nav.querySelectorAll("a")).find(a => a.textContent === "Le stanze");
    expect(rooms?.getAttribute("href")).toBe("#elisir-d-oriente");
    expect(document.getElementById("elisir-d-oriente")?.querySelector(".carousel")).not.toBeNull();
  });

  it("says the Wi-Fi is free at reception", () => {
    const { container } = renderPage();
    expect(container.querySelector("#faq")?.textContent).toMatch(/in reception è gratuito/);
  });

  it("ships the downloadable guide in every language", async () => {
    const { GUIDE_PDF } = await import("@/lib/site-data");
    for (const file of Object.values(GUIDE_PDF)) {
      const path = resolve(__dirname, "../../public", `.${file}`);
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeLessThan(1024 * 1024);
    }
  });
});
