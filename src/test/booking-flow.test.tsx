import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Booking, QUOTE_HOLD_SECONDS } from "@/components/site/Booking";

describe("booking flow", () => {
  it("holds the quote for 12 minutes, then returns to the dates step", () => {
    expect(QUOTE_HOLD_SECONDS).toBe(720);
    vi.useFakeTimers();
    render(<Booking extras={[]} toggleExtra={() => {}} />);
    const y = new Date().getFullYear() + 1;
    fireEvent.change(screen.getByLabelText("Arrivo"), { target: { value: `${y}-05-10` } });
    fireEvent.change(screen.getByLabelText("Partenza"), { target: { value: `${y}-05-14` } });
    fireEvent.click(screen.getByRole("button", { name: /Vedi disponibilità/ }));
    expect(screen.getByRole("timer").textContent).toContain("12:00");
    act(() => { vi.advanceTimersByTime(720_000); });
    expect(screen.getByText("Il preventivo è scaduto. Seleziona di nuovo le date.")).toBeTruthy();
    vi.useRealTimers();
  });
  it("allows at most 3 children", () => {
    render(<Booking extras={[]} toggleExtra={() => {}} />);
    fireEvent.click(screen.getByLabelText("Meno Adulti"));
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByLabelText("Più Bambini"));
    expect(screen.getByLabelText("Numero Bambini").textContent).toBe("3");
  });
});
