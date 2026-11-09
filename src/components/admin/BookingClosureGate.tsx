import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { fmtDate, todayKey } from "@/lib/admin";
import { needsBookingClosure } from "@/lib/ical";
import { markClosedOnBooking } from "@/lib/ical.functions";

export const useBookingsToClose = () => useQuery({
  queryKey: ["admin", "to-close-on-booking"],
  queryFn: async () => {
    const today = todayKey();
    const { data, error } = await supabase.from("bookings").select("id, guest_name, check_in, check_out, status, channel, ota_closed_at, is_personal_use")
      .is("ota_closed_at", null).gte("check_out", today).order("check_in");
    if (error) throw error;
    return data.filter(b => needsBookingClosure(b, today));
  },
});

/** Blocking reminder: Booking.com reads external calendars with delay, so dates must be closed there by hand. */
export function BookingClosureGate() {
  const qc = useQueryClient();
  const { data = [] } = useBookingsToClose();
  const mark = useServerFn(markClosedOnBooking);
  const done = useMutation({
    mutationFn: (id: string) => mark({ data: { bookingId: id } }),
    onSuccess: () => { toast.success("Registrato: date chiuse su Booking.com"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const b = data[0];
  if (!b) return null;
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-2xl font-normal text-destructive">Chiudi queste date su Booking.com</AlertDialogTitle>
          <AlertDialogDescription>
            {b.guest_name}: {fmtDate(b.check_in)} → {fmtDate(b.check_out)}. Booking.com legge il nostro calendario con ritardo:
            chiudi subito queste notti nell'extranet di Booking.com, poi premi "Fatto".{data.length > 1 && ` (${data.length - 1} altre in attesa)`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end"><Button disabled={done.isPending} onClick={() => done.mutate(b.id)}>Fatto</Button></div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
