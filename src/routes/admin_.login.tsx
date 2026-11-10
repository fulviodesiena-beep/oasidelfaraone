import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RESET_REQUEST_MESSAGE, resetRedirectUrl } from "@/lib/admin-password";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Accesso gestionale — Oasi del Faraone" },
      { name: "description", content: "Area riservata al proprietario di Oasi del Faraone." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Accesso gestionale — Oasi del Faraone" },
      { property: "og:description", content: "Area riservata al proprietario." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

export function AdminLogin() {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      {mode === "login" ? <LoginForm onForgot={() => setMode("forgot")} /> : <ForgotForm onBack={() => setMode("login")} />}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Torna al sito
      </Link>
    </main>
  );
}

function LoginForm({ onForgot }: { onForgot: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) { setBusy(false); setError("Email o password non corretti."); return; }
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!role) { await supabase.auth.signOut(); setBusy(false); setError("Questo account non ha accesso al gestionale."); return; }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-5 border border-border bg-card p-8">
      <div>
        <p className="eyebrow">Area riservata</p>
        <h1 className="mt-2 font-display text-3xl">Gestionale Oasi</h1>
      </div>
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Password</Label>
          <button type="button" onClick={onForgot} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Password dimenticata?</button>
        </div>
        <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Accedi</Button>
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // The outcome is deliberately ignored: the same neutral message is shown either way.
    try { await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: resetRedirectUrl(window.location.origin) }); } catch { /* neutral */ }
    setBusy(false); setSent(true);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-5 border border-border bg-card p-8">
      <div>
        <p className="eyebrow">Area riservata</p>
        <h1 className="mt-2 font-display text-3xl">Password dimenticata</h1>
        <p className="mt-3 text-sm text-muted-foreground">Inserisci l’email del tuo account: ti invieremo un link per sceglierne una nuova.</p>
      </div>
      {sent ? (
        <p role="status" className="border border-border bg-muted/40 p-4 text-sm">{RESET_REQUEST_MESSAGE}</p>
      ) : (
        <>
          <div className="space-y-2"><Label htmlFor="reset-email">Email</Label><Input id="reset-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Invia link di reimpostazione</Button>
        </>
      )}
      <button type="button" onClick={onBack} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Torna all’accesso</button>
    </form>
  );
}
