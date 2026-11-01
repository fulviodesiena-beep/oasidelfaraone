import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import moovyLogo from "@/assets/moovy-logo.png.asset.json";
import moovyBoy from "@/assets/moovy-boy.jpg.asset.json";
import { Route } from "@/routes/index";

// jsdom has no IntersectionObserver; the page's reveal effect needs one.
class FakeIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

describe("MOOVY section", () => {
  it("shows the real MOOVY logo and the real resort photo", () => {
    const Index = Route.options.component as () => React.ReactElement;

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Index />
      </QueryClientProvider>,
    );

    const logo = screen.getByRole("img", { name: "MOOVY — Join the Movement. Join MOOVY." });
    expect(logo).toHaveAttribute("src", moovyLogo.url);
    expect(logo.closest("section")).toHaveAttribute("id", "moovy");

    const photo = screen.getByRole("img", {
      name: "Bambino di spalle con sacca MOOVY, affacciato sul resort e sul mare",
    });
    expect(photo).toHaveAttribute("src", moovyBoy.url);
    expect(photo.closest("figure")).toHaveClass("moovy-photo");
  });
});
