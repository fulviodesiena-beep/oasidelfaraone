import { createFileRoute } from "@tanstack/react-router";
import { PublicPrivacy } from "@/components/site/PublicPrivacy";
import { publicHead } from "@/lib/public-head";
export const Route = createFileRoute("/de_/privacy")({ head: () => publicHead("de","privacy"), component: Page });
function Page() { return <PublicPrivacy language="de" />; }
