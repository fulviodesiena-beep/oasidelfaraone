import { createFileRoute } from "@tanstack/react-router";
import { PublicPrivacy } from "@/components/site/PublicPrivacy";
import { publicHead } from "@/lib/public-head";
export const Route = createFileRoute("/privacy")({ head: () => publicHead("it","privacy"), component: Page });
function Page() { return <PublicPrivacy language="it" />; }
