import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { INSTAGRAM_URL, OWNER_EMAIL } from "@/lib/site-data";
import { Route } from "@/routes/index";

// jsdom has no IntersectionObserver; the page's reveal effect needs one.
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

describe("contact links", () => {
  it("points Mina's WhatsApp button at https://wa.me/393481804764", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /Chatta con Mina su WhatsApp/i })).toHaveAttribute(
      "href",
      "https://wa.me/393481804764",
    );
  });

  it("opens the Instagram profile @oasidelfaraone", () => {
    renderPage();
    const instagram = screen.getByRole("link", { name: /Instagram Oasi del Faraone/i });
    expect(instagram).toHaveAttribute("href", INSTAGRAM_URL);
    expect(instagram).toHaveAttribute("target", "_blank");
    expect(instagram.closest("button")).toBeNull();
  });

  it("offers WhatsApp and email side by side in the contacts section", () => {
    renderPage();
    const whatsapp = screen.getByRole("link", { name: /Scrivici su WhatsApp/i });
    const email = screen.getByRole("link", { name: /Scrivici via email/i });
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/393347328158");
    expect(email).toHaveAttribute("href", `mailto:${OWNER_EMAIL}`);
    expect(email).toHaveAttribute("href", "mailto:prenotazionisharm@gmail.com");
    expect(whatsapp.closest("section")).toHaveAttribute("id", "contatti");
    expect(email.closest("section")).toHaveAttribute("id", "contatti");
    expect(whatsapp.closest(".contact-buttons")).toBe(email.closest(".contact-buttons"));
  });
});
