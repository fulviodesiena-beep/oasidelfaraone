import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import minaPortrait from "@/assets/mina-portrait.png.asset.json";
import { Route } from "@/routes/index";

// jsdom has no IntersectionObserver; the page's reveal effect needs one.
class FakeIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

describe("Mina section", () => {
  it("shows Mina's real portrait, loaded from the published asset", () => {
    const Index = Route.options.component as () => React.ReactElement;

    render(
      <QueryClientProvider client={new QueryClient()}>
        <Index />
      </QueryClientProvider>,
    );

    const portrait = screen.getByRole("img", { name: "Mina, il tuo referente a Sharm el-Sheikh" });
    expect(portrait).toHaveAttribute("src", minaPortrait.url);
    expect(portrait.closest("figure")).toHaveClass("mina-photo");
    expect(portrait.closest("section")).toHaveAttribute("id", "mina");
  });
});
