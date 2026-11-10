import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_ADMIN_PASSWORD_LENGTH, validateNewPassword } from "@/lib/admin-password";

export const Route = createFileRoute("/admin_/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nuova password — Oasi del Faraone" },
      { name: "description", content: "Scegli una nuova password per l’area riservata di Oasi del Faraone." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Nuova password — Oasi del Faraone" },
      { property: "og:description", content: "Reimpostazione password dell’area riservata." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminResetPassword,
});

type Status = "checking" | "ready" | "invalid" | "done";

export function AdminResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const linkError = /error_code=|error=/.test(window.location.hash) || new URLSearchParams(window.location.search).has("error");
    // The reset link signs the user in with a short-lived recovery session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session))) setStatus(s => (s === "done" ? s : "ready"));
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus(s => (s !== "checking" ? s : data.session && !linkError ? "ready" : "invalid"));
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (status !== "done") return;
    const id = window.setTimeout(() => navigate({ to: "/admin/login", replace: true }), 3000);
    return () => window.clearTimeout(id);
  }, [status, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateNewPassword(password, confirm);
    if (problem) { setError(problem); return; }
    setBusy(true); setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setBusy(false); setError("Non è stato possibile aggiornare la password. Il link potrebbe essere scaduto: richiedine uno nuovo."); return; }
    await supabase.auth.signOut();
    setBusy(false); setStatus("done");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-5 border border-border bg-card p-8">
        <div>
          <p className="eyebrow">Area riservata</p>
          <h1 className="mt-2 font-display text-3xl">Nuova password</h1>
        </div>
        {status === "checking" && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Verifica del link in corso…</p>}
        {status === "invalid" && (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-destructive">Il link non è valido o è scaduto. Richiedi un nuovo link dalla pagina di accesso.</p>
            <Button asChild className="w-full"><Link to="/admin/login">Vai all’accesso</Link></Button>
          </div>
        )}
        {status === "done" && (
          <div className="space-y-4">
            <p role="status" className="text-sm">Password aggiornata. Ora puoi accedere con la nuova password.</p>
            <Button asChild className="w-full"><Link to="/admin/login" replace>Torna al login</Link></Button>
          </div>
        )}
        {status === "ready" && (
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nuova password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} aria-describedby="password-hint" />
              <p id="password-hint" className="text-xs text-muted-foreground">Almeno {MIN_ADMIN_PASSWORD_LENGTH} caratteri.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Conferma password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Salva nuova password</Button>
          </form>
        )}
      </div>
    </main>
  );
}
