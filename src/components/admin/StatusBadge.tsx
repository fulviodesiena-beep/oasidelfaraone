import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABEL, INQUIRY_STATUS_LABEL } from "@/lib/admin";

const TONE: Record<string, string> = {
  confirmed: "status-confirmed",
  personal: "status-personal",
  host_collab: "status-host",
  converted: "border-primary/60 bg-primary/15 text-gold-light",
  pending: "status-pending",
  new: "border-primary bg-primary text-primary-foreground",
  contacted: "border-border bg-secondary text-foreground",
  cancelled: "status-cancelled",
  lost: "border-destructive/50 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const label = (BOOKING_STATUS_LABEL as Record<string, string>)[status] ?? (INQUIRY_STATUS_LABEL as Record<string, string>)[status] ?? status;
  return <Badge variant="outline" className={TONE[status] ?? ""}>{label}</Badge>;
}
