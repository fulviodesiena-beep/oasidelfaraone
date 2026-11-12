import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FloatingActions } from "@/components/site/FloatingActions";
import { LanguageProvider } from "@/lib/i18n";
import { OWNER_EMAIL, OWNER_WHATSAPP } from "@/lib/site-data";

function renderFab(language: "it" | "en" = "it") {
  return render(
    <LanguageProvider language={language}>
      <FloatingActions />
    </LanguageProvider>,
  );
}

describe("floating actions", () => {
  it("opens WhatsApp and email from the contact button", () => {
    renderFab();
    const contact = screen.getByRole("button", { name: "Contattami" });
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(contact);
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /WhatsApp/ })).toHaveAttribute(
      "href",
      `https://wa.me/${OWNER_WHATSAPP}`,
    );
    expect(within(menu).getByRole("menuitem", { name: /Email/ })).toHaveAttribute(
      "href",
      `mailto:${OWNER_EMAIL}`,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("has a back-to-top button that scrolls to the top", () => {
    const calls: unknown[] = [];
    window.scrollTo = ((opts: unknown) => calls.push(opts)) as typeof window.scrollTo;
    renderFab("en");
    fireEvent.click(screen.getByLabelText("Back to top"));
    expect(calls.at(-1)).toMatchObject({ top: 0 });
  });
});
