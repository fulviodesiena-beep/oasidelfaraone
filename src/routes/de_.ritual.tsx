import { createFileRoute } from "@tanstack/react-router";
import { PublicRitual } from "@/components/site/PublicRitual";
import { ritualHead } from "@/lib/public-head";
// Opened from the in-room QR code; utm_* query params are read by captureAttribution, no search validation needed.
export const Route = createFileRoute("/de_/ritual")({ head: () => ritualHead("de"), component: Page });
function Page() { return <PublicRitual language="de" />; }
