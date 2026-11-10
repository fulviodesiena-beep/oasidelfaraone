import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

const auth = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
  updateUser: vi.fn(),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  signInWithPassword: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth, from: vi.fn() } }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
  useNavigate: () => vi.fn(),
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => <a href={to} className={className}>{children}</a>,
}));

import { validateNewPassword } from "@/lib/admin-password";
import { AdminLogin } from "@/routes/admin_.login";
import { AdminResetPassword } from "@/routes/admin_.reset-password";
import { OwnerLoginLink } from "@/components/site/OwnerLoginLink";
import { LanguageProvider } from "@/lib/i18n";

beforeEach(() => { vi.clearAllMocks(); });

describe("new password rules", () => {
  it("requires at least 10 characters", () => {
    expect(validateNewPassword("123456789", "123456789")).toMatch(/almeno 10/);
    expect(validateNewPassword("1234567890", "1234567890")).toBeNull();
  });
  it("requires the confirmation to match", () => {
    expect(validateNewPassword("1234567890", "1234567891")).toMatch(/non coincidono/);
  });
});

describe("forgot password request", () => {
  async function requestReset(email: string) {
    render(<AdminLogin />);
    fireEvent.click(screen.getByRole("button", { name: "Password dimenticata?" }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
    fireEvent.click(screen.getByRole("button", { name: /Invia link/ }));
    return screen.findByRole("status");
  }
  it("sends the reset link to /admin/reset-password and shows the neutral message", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const status = await requestReset("owner@example.invalid");
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("owner@example.invalid", { redirectTo: `${window.location.origin}/admin/reset-password` });
    expect(status).toHaveTextContent("Se l’email è registrata riceverai un link");
  });
  it("shows the same neutral message when the request fails", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: null, error: { message: "User not found" } });
    const status = await requestReset("nobody@example.invalid");
    expect(status).toHaveTextContent("Se l’email è registrata riceverai un link");
    expect(screen.queryByText(/not found/i)).toBeNull();
  });
  it("offers a link back to the public site", () => {
    render(<AdminLogin />);
    expect(screen.getByRole("link", { name: "Torna al sito" })).toHaveAttribute("href", "/");
  });
});

describe("reset password page", () => {
  it("rejects a short password and a wrong confirmation, then saves a valid one", async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } });
    auth.updateUser.mockResolvedValue({ data: {}, error: null });
    render(<AdminResetPassword />);
    const pw = await screen.findByLabelText("Nuova password");
    const confirm = screen.getByLabelText("Conferma password");
    const save = screen.getByRole("button", { name: "Salva nuova password" });

    fireEvent.change(pw, { target: { value: "short1234" } });
    fireEvent.change(confirm, { target: { value: "short1234" } });
    fireEvent.click(save);
    expect(screen.getByRole("alert")).toHaveTextContent("almeno 10 caratteri");

    fireEvent.change(pw, { target: { value: "lunghissima1" } });
    fireEvent.change(confirm, { target: { value: "lunghissima2" } });
    fireEvent.click(save);
    expect(screen.getByRole("alert")).toHaveTextContent("non coincidono");
    expect(auth.updateUser).not.toHaveBeenCalled();

    fireEvent.change(confirm, { target: { value: "lunghissima1" } });
    fireEvent.click(save);
    await waitFor(() => expect(auth.updateUser).toHaveBeenCalledWith({ password: "lunghissima1" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Password aggiornata");
    expect(auth.signOut).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Torna al login" })).toHaveAttribute("href", "/admin/login");
  });
  it("shows an expired-link message when there is no recovery session", async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } });
    render(<AdminResetPassword />);
    expect(await screen.findByRole("alert")).toHaveTextContent("non è valido o è scaduto");
    expect(screen.queryByLabelText("Nuova password")).toBeNull();
  });
});

describe("footer owner link", () => {
  it.each([["it", "Area riservata"], ["en", "Owner login"], ["de", "Interner Bereich"]] as const)("%s footer links to /admin/login", (language, label) => {
    render(<LanguageProvider language={language}><OwnerLoginLink /></LanguageProvider>);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", "/admin/login");
  });
});
