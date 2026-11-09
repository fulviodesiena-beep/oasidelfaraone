import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Fixed file names in the private "templates" bucket. */
export const TEMPLATE_FILES = [
  { path: "header.png", label: "Header Domina (PNG)", accept: "image/png" },
  { path: "signature.png", label: "Firma del titolare (PNG trasparente)", accept: "image/png" },
  { path: "scheda-gialla-it.pdf", label: "Scheda gialla — italiano", accept: "application/pdf,image/*" },
  { path: "scheda-gialla-ar.pdf", label: "Scheda gialla — arabo", accept: "application/pdf,image/*" },
  { path: "modulo-rosa-it.pdf", label: "Modulo rosa — italiano", accept: "application/pdf,image/*" },
  { path: "modulo-rosa-ar.pdf", label: "Modulo rosa — arabo", accept: "application/pdf,image/*" },
] as const;

export function TemplateUploads() {
  const qc = useQueryClient();
  const { data: present = [] } = useQuery({
    queryKey: ["admin", "templates"],
    queryFn: async () => { const { data, error } = await supabase.storage.from("templates").list(); if (error) throw error; return data.map(f => f.name); },
  });
  const up = useMutation({
    mutationFn: async ({ path, file }: { path: string; file: File }) => {
      if (path.endsWith(".png") && file.type !== "image/png") throw new Error("Serve un file PNG");
      const { error } = await supabase.storage.from("templates").upload(path, file, { upsert: true, ...(file.type ? { contentType: file.type } : {}) });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("File caricato"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const open = async (path: string) => {
    const { data, error } = await supabase.storage.from("templates").createSignedUrl(path, 300);
    if (error) toast.error(error.message); else window.open(data.signedUrl, "_blank", "noopener");
  };
  return (
    <ul className="divide-y divide-border text-sm">{TEMPLATE_FILES.map(t => (
      <li key={t.path} className="flex flex-wrap items-center gap-3 py-2">
        <span className="min-w-56 flex-1">{t.label} {present.includes(t.path) ? <span className="text-success">· caricato</span> : <span className="text-muted-foreground">· mancante</span>}</span>
        {present.includes(t.path) && <Button size="sm" variant="ghost" onClick={() => open(t.path)}>Apri</Button>}
        <Input type="file" accept={t.accept} className="w-56" aria-label={`Carica ${t.label}`} onChange={e => { const f = e.target.files?.[0]; if (f) up.mutate({ path: t.path, file: f }); e.target.value = ""; }} />
      </li>))}</ul>
  );
}
