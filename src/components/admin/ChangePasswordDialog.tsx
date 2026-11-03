import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordDialog() {
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
      <DialogTrigger asChild><Button variant="ghost" size="sm"><KeyRound /><span className="hidden sm:inline">Cambia password</span></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display text-2xl font-normal">Cambia password</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="new-pw">Nuova password</Label>
            <Input id="new-pw" type="password" autoComplete="new-password" minLength={8} required value={pw} onChange={e => setPw(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="confirm-pw">Conferma password</Label>
            <Input id="confirm-pw" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="submit" disabled={saving || pw.length < 8 || pw !== confirm}>{saving ? "Salvataggio…" : "Salva"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
