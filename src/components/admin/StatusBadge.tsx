import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABEL, INQUIRY_STATUS_LABEL } from "@/lib/admin";

const TONE: Record<string, string> = {
  confirmed: "border-primary/60 bg-primary/15 text-gold-light",
  converted: "border-primary/60 bg-primary/15 text-gold-light",
  pending: "border-border bg-secondary text-foreground",
  new: "border-primary bg-primary text-primary-foreground",
  contacted: "border-border bg-secondary text-foreground",
  cancelled: "border-destructive/50 bg-destructive/10 text-destructive",
  lost: "border-destructive/50 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const label = (BOOKING_STATUS_LABEL as Record<string, string>)[status] ?? (INQUIRY_STATUS_LABEL as Record<string, string>)[status] ?? status;
  return <Badge variant="outline" className={TONE[status] ?? ""}>{label}</Badge>;
}
