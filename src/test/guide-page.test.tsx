import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicGuide } from "@/components/site/PublicGuide";
import { GUIDE_PDF } from "@/lib/site-data";

class FakeIntersectionObserver { observe() {} unobserve() {} disconnect() {} }
globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

describe("guide page", () => {
  it("offers the half-serious guide as a PDF download in the page language", () => {
    render(<PublicGuide language="en" />);
    const link = screen.getByRole("link", { name: /Download the half-serious guide/ });
    expect(link).toHaveAttribute("href", GUIDE_PDF.en);
    expect(link).toHaveAttribute("download");
  });
  it("calls the way home 'Torna all’Oasi' instead of 'Le stanze'", () => {
    render(<PublicGuide />);
    const nav = screen.getByRole("navigation", { name: "Navigazione principale" });
    expect(nav.textContent).toContain("Torna all’Oasi");
    expect(nav.textContent).not.toContain("Le stanze");
  });
  it("keeps a short description visible on every photo card", () => {
    const { container } = render(<PublicGuide />);
    const cards = container.querySelectorAll(".photo-card");
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach(card => expect(card.querySelector(".photo-desc")?.textContent?.length).toBeGreaterThan(10));
  });
});
