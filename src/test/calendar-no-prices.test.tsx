import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Booking } from "@/components/site/Booking";

describe("availability calendar", () => {
  it("shows only the day number in every calendar cell, never a price, across 12 months", () => {
    const { container } = render(<Booking extras={[]} toggleExtra={() => {}} />);
    for (let i = 0; i < 12; i++) {
      const cells = container.querySelectorAll(".calendar-day");
      expect(cells.length).toBeGreaterThan(27);
      cells.forEach((cell) => {
        expect(cell.textContent?.trim()).toMatch(/^\d{1,2}$/);
      });
      fireEvent.click(screen.getByRole("button", { name: "Mese successivo" }));
    }
  });
});
