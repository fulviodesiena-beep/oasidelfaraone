import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Booking, PHONE_PREFIX, uniformNightPrice } from "@/components/site/Booking";

describe("booking flow", () => {
  const label = (d: Date) => d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const pickNextMonthRange = (from: number, to: number) => {
    const now = new Date(); const m = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    fireEvent.click(screen.getByLabelText("Mese successivo"));
    fireEvent.click(screen.getByRole("button", { name: label(new Date(m.getFullYear(), m.getMonth(), from)) }));
    fireEvent.click(screen.getByRole("button", { name: label(new Date(m.getFullYear(), m.getMonth(), to)) }));
  };
  it("picks dates only from the calendar and shows them as text (no duplicate date inputs)", () => {
    const { container } = render(<Booking extras={[]} toggleExtra={() => {}} />);
    expect(container.querySelectorAll('input[type="date"]').length).toBe(0);
    expect(screen.getByText("Scegli il giorno di arrivo sul calendario.")).toBeTruthy();
    pickNextMonthRange(10, 14);
    expect(screen.getByTestId("check-in").textContent).not.toBe("—");
    expect(screen.getByTestId("check-out").textContent).not.toBe("—");
    expect((screen.getByRole("button", { name: /Vedi disponibilità/ }) as HTMLButtonElement).disabled).toBe(false);
  });
  it("shows no countdown or fake reservation timer on the quote", () => {
    vi.useFakeTimers();
    render(<Booking extras={[]} toggleExtra={() => {}} />);
    pickNextMonthRange(10, 14);
    fireEvent.click(screen.getByRole("button", { name: /Vedi disponibilità/ }));
    expect(screen.queryByRole("timer")).toBeNull();
    expect(screen.queryByText(/riservato per/i)).toBeNull();
    act(() => { vi.advanceTimersByTime(30 * 60_000); });
    expect(screen.getByRole("button", { name: /Richiedi prenotazione/ })).toBeTruthy();
    vi.useRealTimers();
  });
  it("marks free days so the calendar legend matches", () => {
    const { container } = render(<Booking extras={[]} toggleExtra={() => {}} />);
    fireEvent.click(screen.getByLabelText("Mese successivo"));
    expect(container.querySelectorAll(".calendar-day-free").length).toBeGreaterThan(20);
  });
  it("summarises equal nightly prices on one line and defaults the phone prefix by language", () => {
    expect(uniformNightPrice([{ price: 100 }, { price: 100 }])).toBe(100);
    expect(uniformNightPrice([{ price: 100 }, { price: 120 }])).toBeNull();
    expect(uniformNightPrice([{ price: null }])).toBeNull();
    expect(PHONE_PREFIX).toEqual({ it: "+39 ", de: "+49 ", en: "+" });
  });
  it("allows at most 3 children", () => {
    render(<Booking extras={[]} toggleExtra={() => {}} />);
    fireEvent.click(screen.getByLabelText("Meno Adulti"));
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByLabelText("Più Bambini"));
    expect(screen.getByLabelText("Numero Bambini").textContent).toBe("3");
  });
});
