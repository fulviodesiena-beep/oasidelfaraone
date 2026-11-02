import { useState } from "react";
import { Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWhatsAppText, messageSchedule, whatsappLink, type ScheduledMessage } from "@/lib/communications";
import { extrasList, fmtDate, type Booking } from "@/lib/admin";
import type { EmailBooking } from "@/lib/email-templates";

export function BookingCommunications({ booking }: { booking: Booking }) {
  const [preview, setPreview] = useState<ScheduledMessage | null>(null);
  const data: EmailBooking = {
    guest_name: booking.guest_name, check_in: fmtDate(booking.check_in), check_out: fmtDate(booking.check_out),
    total_nights: booking.total_nights, total_price: booking.total_price, deposit_paid: booking.deposit_paid,
    servizi: extrasList(booking.extras).join(", ") || undefined,
  };
  const phone = booking.guest_phone;
  return (
    <div className="space-y-2">
      {messageSchedule(booking).map(m => (
        <div key={m.code} className="flex flex-wrap items-center gap-2 border border-border p-3 text-sm">
          <div className="min-w-0 flex-1">
            <div className="font-medium">{m.code} · {m.name}</div>
            <div className="text-xs text-muted-foreground">{m.date ? `${fmtDate(m.date)} (${m.rule})` : m.rule}</div>
          </div>
          <div className="flex gap-1">{m.channels.map(c => <Badge key={c} variant="outline">{c}</Badge>)}</div>
          <Button size="sm" variant="outline" onClick={() => setPreview(m)}><Eye />Anteprima</Button>
          {phone ? (
            <Button size="sm" asChild><a href={whatsappLink(phone, getWhatsAppText(m.trigger, data))} target="_blank" rel="noopener noreferrer"><MessageCircle />Invia su WhatsApp</a></Button>
          ) : (
            <Button size="sm" disabled title="Telefono ospite mancante"><MessageCircle />Invia su WhatsApp</Button>
          )}
        </div>
      ))}
      {!phone && <p className="text-xs text-muted-foreground">Aggiungi il telefono dell'ospite per inviare su WhatsApp.</p>}
      <Dialog open={!!preview} onOpenChange={o => { if (!o) setPreview(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{preview?.code} · {preview?.name}</DialogTitle></DialogHeader>
          {preview && (
            <Tabs defaultValue="whatsapp">
              <TabsList>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                {preview.email && <TabsTrigger value="email">Email</TabsTrigger>}
              </TabsList>
              <TabsContent value="whatsapp"><pre className="whitespace-pre-wrap border border-border p-3 font-sans text-sm">{getWhatsAppText(preview.trigger, data)}</pre></TabsContent>
              {preview.email && <TabsContent value="email"><iframe title="Anteprima email" className="h-[60vh] w-full border border-border" srcDoc={preview.email(data)} sandbox="" /></TabsContent>}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
