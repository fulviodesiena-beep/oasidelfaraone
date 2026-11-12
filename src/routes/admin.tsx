import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncBookingIfStale } from "@/lib/ical.functions";
import { BookingClosureGate } from "@/components/admin/BookingClosureGate";
import { createFileRoute, type ErrorComponentProps, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Contact, FileText, Handshake, Inbox, KeyRound, LayoutDashboard, LogOut, Receipt, Settings, Users, MessageCircle, Mail, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";

/** Admin role verified once per signed-in user; later navigations reuse it instead of hitting the network again.
 *  This is only a UX guard: every query is still enforced by RLS (has_role admin) on the database. */
let verifiedAdmin: { id: string; email: string } | null = null;
let authListener = false;

export const Route = createFileRoute("/admin")({
  ssr: false,
  // Shown while the session is checked (and as the server fallback of this client-only route): no blank screen.
  pendingComponent: AdminPending,
  pendingMs: 150,
  errorComponent: AdminError,
  beforeLoad: async () => {
    if (!authListener) {
      authListener = true;
      supabase.auth.onAuthStateChange((_e, session) => { if (session?.user.id !== verifiedAdmin?.id) verifiedAdmin = null; });
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/admin/login" });
    if (verifiedAdmin?.id === session.user.id) return { adminEmail: verifiedAdmin.email };
    const { data: role, error } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
    if (error) throw new Error(`Verifica accesso non riuscita: ${error.message}`);
    if (!role) { await supabase.auth.signOut(); throw redirect({ to: "/admin/login" }); }
    verifiedAdmin = { id: session.user.id, email: session.user.email ?? "" };
    return { adminEmail: verifiedAdmin.email };
  },
  head: () => ({
    meta: [
      { title: "Gestionale — Oasi del Faraone" },
      { name: "description", content: "Pannello privato per prenotazioni, richieste e clienti." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Gestionale — Oasi del Faraone" },
      { property: "og:description", content: "Pannello privato del proprietario." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/bookings", label: "Prenotazioni", icon: CalendarDays },
  { to: "/admin/inquiries", label: "Richieste", icon: Inbox },
  { to: "/admin/guests", label: "Clienti", icon: Users },
  { to: "/admin/contacts", label: "Contatti", icon: Contact },
  { to: "/admin/hosts", label: "Host", icon: Handshake },
  { to: "/admin/documents", label: "Documenti", icon: FileText },
  { to: "/admin/expenses", label: "Spese", icon: Receipt },
  { to: "/admin/today", label: "Da inviare oggi", icon: MessageCircle },
  { to: "/admin/emails", label: "Email", icon: Mail },
  { to: "/admin/newsletter", label: "Newsletter", icon: Newspaper },
  { to: "/admin/settings", label: "Impostazioni", icon: Settings },
] as const;

function AdminLayout() {
  // Resolved location: the title changes together with the page content, not before it.
  const path = useRouterState({ select: s => (s.resolvedLocation ?? s.location).pathname.replace(/\/$/, "") || "/" });
  const failed = useFailedQueries();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { adminEmail } = Route.useRouteContext();
  const { data: newCount = 0 } = useQuery({
    queryKey: ["admin", "inquiries", "new-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("inquiries").select("id", { count: "exact" }).eq("status", "new").range(0, 0);
      if (error) throw error;
      return count ?? 0;
    },
  });
  const current = NAV.find(n => n.to === path) ?? NAV[0];
  const syncIfStale = useServerFn(syncBookingIfStale);
  useEffect(() => {
    if (path !== "/admin" && path !== "/admin/bookings") return;
    syncIfStale().then(r => { if (!r.skipped) qc.invalidateQueries({ queryKey: ["admin"] }); }).catch(() => {});
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <SidebarProvider>
      <div className="admin-shell flex min-h-screen w-full bg-background font-sans">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="font-display text-base text-gold-light">Oasi del Faraone</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map(item => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={path === item.to} tooltip={item.label}>
                        <Link to={item.to}><item.icon /><span>{item.label}</span></Link>
                      </SidebarMenuButton>
                      {item.to === "/admin/inquiries" && newCount > 0 && <SidebarMenuBadge className="bg-primary text-primary-foreground">{newCount}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b border-border px-4">
            <SidebarTrigger />
            <h1 className="font-display text-2xl">{current.label}</h1>
            <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">{adminEmail}</span>
            <PasswordDialog />
            <Button variant="outline" size="sm" onClick={logout}><LogOut />Esci</Button>
          </header>
          {failed > 0 && (
            <div role="alert" className="mx-4 mt-4 flex flex-wrap items-center gap-3 rounded-md border border-destructive/60 bg-destructive/15 px-4 py-3 text-sm text-destructive sm:mx-6">
              <span>Alcuni dati non sono stati caricati: i numeri a zero in questa pagina potrebbero non essere reali.</span>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => qc.refetchQueries({ predicate: q => q.state.status === "error" })}>Riprova</Button>
            </div>
          )}
          <main className="flex-1 p-4 sm:p-6"><Outlet /></main>
          <BookingClosureGate />
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

/** Cambia password: tutto inline qui, nessuna dipendenza da componenti esterni. */
function PasswordDialog() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const error = pw && pw.length < 8 ? "Almeno 8 caratteri" : confirm && pw !== confirm ? "Le password non coincidono" : "";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8 || pw !== confirm) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) { toast.error("Password non aggiornata", { description: error.message }); return; }
    toast.success("Password aggiornata");
    setPw(""); setConfirm(""); setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Cambia password"><KeyRound />Password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl font-normal">Cambia password</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw">Nuova password</Label>
            <Input id="new-pw" type="password" autoComplete="new-password" minLength={8} required value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-pw">Conferma password</Label>
            <Input id="confirm-pw" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={saving || pw.length < 8 || pw !== confirm}>{saving ? "Salvataggio…" : "Salva"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Counts failed admin queries and toasts each failure once, so an error never looks like an empty result. */
function useFailedQueries() {
  const qc = useQueryClient();
  const [failed, setFailed] = useState(0);
  useEffect(() => {
    const cache = qc.getQueryCache();
    const count = () => setFailed(cache.findAll({ predicate: q => q.state.status === "error" }).length);
    count();
    return cache.subscribe(ev => {
      if (ev.type === "updated" && ev.action.type === "error") {
        const msg = ev.action.error instanceof Error ? ev.action.error.message : String(ev.action.error ?? "errore");
        toast.error("Dati non caricati", { id: ev.query.queryHash, description: msg });
      }
      if (ev.type === "updated" || ev.type === "removed") count();
    });
  }, [qc]);
  return failed;
}

function AdminPending() {
  return (
    <div className="admin-shell flex min-h-screen w-full items-center justify-center bg-background font-sans" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold-light" aria-hidden="true" />
        <p className="font-display text-xl text-gold-light">Oasi del Faraone</p>
        <p className="text-sm">Caricamento del gestionale…</p>
      </div>
    </div>
  );
}

function AdminError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="admin-shell flex min-h-screen w-full items-center justify-center bg-background p-6 font-sans">
      <div role="alert" className="max-w-md space-y-4 rounded-md border border-destructive/60 bg-destructive/10 p-6 text-sm">
        <p className="font-display text-2xl">Il gestionale non si è caricato</p>
        <p className="text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
        <div className="flex gap-2">
          <Button onClick={() => { verifiedAdmin = null; reset(); }}>Riprova</Button>
          <Button variant="outline" onClick={() => window.location.assign("/admin/login")}>Vai al login</Button>
        </div>
      </div>
    </div>
  );
}
