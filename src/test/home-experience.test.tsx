import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RITUAL_STEPS } from "@/components/site/PublicRitual";
import { RITUAL_CLUES, RITUAL_TEASER_TEXTS } from "@/components/site/RitualTeaser";
import { DICTIONARIES, languages } from "@/lib/i18n";
import { HERO_VIDEO, MINA_TOURS_URL, MINA_WHATSAPP } from "@/lib/site-data";
import { Route } from "@/routes/index";

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
    for (const step of RITUAL_STEPS) expect(teaser.textContent).not.toContain(step.text);
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
});
