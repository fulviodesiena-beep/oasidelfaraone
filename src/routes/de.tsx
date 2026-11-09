import { createFileRoute } from "@tanstack/react-router";
import { PublicHome } from "@/components/site/PublicHome";
import { publicHead } from "@/lib/public-head";
export const Route = createFileRoute("/de")({ head: () => publicHead("de"), component: Page });
function Page() { return <PublicHome language="de" />; }
