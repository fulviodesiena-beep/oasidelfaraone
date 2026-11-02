import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Inbox, LayoutDashboard, LogOut, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!role) { await supabase.auth.signOut(); throw redirect({ to: "/admin/login" }); }
    return { adminEmail: data.user.email ?? "" };
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
] as const;

function AdminLayout() {
  const path = useRouterState({ select: s => s.location.pathname.replace(/\/$/, "") || "/" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { adminEmail } = Route.useRouteContext();
  const { data: newCount = 0 } = useQuery({
    queryKey: ["admin", "inquiries", "new-count"],
    queryFn: async () => {
      const { count } = await supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new");
      return count ?? 0;
    },
  });
  const current = NAV.find(n => n.to === path) ?? NAV[0];

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
            <Button variant="outline" size="sm" onClick={logout}><LogOut />Esci</Button>
          </header>
          <main className="flex-1 p-4 sm:p-6"><Outlet /></main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
