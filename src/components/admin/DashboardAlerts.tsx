import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileDown, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingsToClose } from "@/components/admin/BookingClosureGate";
import { openDocument } from "@/components/admin/BookingDocuments";
import { DelegaStatusLine, delegaErrorMessage } from "@/components/admin/BookingTravelers";
import { fmtDate, todayKey } from "@/lib/admin";
import { delegaFingerprint, delegaState, dominaMailto } from "@/lib/delega";
import { ensureDelega } from "@/lib/delega.functions";

export function BookingClosureList() {
  const { data = [] } = useBookingsToClose();
  if (!data.length) return null;
  return (
    <Card className="border-destructive bg-destructive/10">
      <CardHeader><CardTitle className="font-display text-xl font-normal text-destructive">Da chiudere su Booking.com</CardTitle></CardHeader>
      <CardContent><ul className="space-y-1 text-sm text-destructive">{data.map(b => <li key={b.id}>{b.guest_name} · {fmtDate(b.check_in)} → {fmtDate(b.check_out)}</li>)}</ul></CardContent>
    </Card>
  );
}

/** Upcoming confirmed stays: generates the delega automatically when rules are met and shows its status. */
export function DelegaPanel() {
  const qc = useQueryClient();
  const gen = useServerFn(ensureDelega);
  const tried = useRef(new Set<string>());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const { data } = useQuery({
    queryKey: ["admin", "delega-panel"],
    queryFn: async () => {
      const [b, t, d, s] = await Promise.all([
        supabase.from("bookings").select("*").in("status", ["confirmed", "host_collab"]).gte("check_out", todayKey()).order("check_in"),
        supabase.from("travelers").select("*"),
        supabase.from("documents").select("*").eq("kind", "delega"),
        supabase.from("settings").select("*").eq("id", 1).single(),
      ]);
      if (b.error || t.error || d.error || s.error) throw b.error ?? t.error ?? d.error ?? s.error;
      return b.data.map(bk => {
        const travelers = t.data.filter(x => x.booking_id === bk.id);
        return { booking: bk, state: delegaState(bk, travelers), fp: delegaFingerprint(bk, travelers, s.data), doc: d.data.find(x => x.booking_id === bk.id) ?? null, settings: s.data };
      });
    },
  });
  useEffect(() => {
    for (const r of data ?? []) {
      const key = `${r.booking.id}:${r.fp}`;
      if (r.state.kind !== "ready" || r.doc?.fingerprint === r.fp || tried.current.has(key)) continue;
      tried.current.add(key);
      const id = r.booking.id;
      setPending(p => ({ ...p, [id]: true }));
      gen({ data: { bookingId: id } })
        .then(() => { setErrors(({ [id]: _, ...rest }) => rest); return qc.invalidateQueries({ queryKey: ["admin"] }); })
        .catch((e: unknown) => { const m = delegaErrorMessage(e); setErrors(x => ({ ...x, [id]: m })); toast.error(`${r.booking.guest_name}: ${m}`); })
        .finally(() => setPending(p => ({ ...p, [id]: false })));
    }
  }, [data, gen, qc]);
  if (!data?.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="font-display text-2xl font-normal">Deleghe Domina</CardTitle></CardHeader>
      <CardContent><ul className="divide-y divide-border">{data.map(r => (
        <li key={r.booking.id} className="flex flex-wrap items-center gap-3 py-3">
          <span className="min-w-40">{r.booking.guest_name} <span className="text-xs text-muted-foreground">{fmtDate(r.booking.check_in)}</span></span>
          <span className="flex-1"><DelegaStatusLine state={r.state} hasDoc={!!r.doc && r.doc.fingerprint === r.fp} error={errors[r.booking.id]} pending={pending[r.booking.id]} /></span>
          {r.doc && <Button size="sm" variant="outline" onClick={() => openDocument(r.doc!)}><FileDown />Scarica</Button>}
          {r.doc && <Button size="sm" variant="outline" asChild><a href={dominaMailto(r.settings, r.doc.name)}><Mail />Prepara email al Domina</a></Button>}
        </li>))}</ul></CardContent>
    </Card>
  );
}
