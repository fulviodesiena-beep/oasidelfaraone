import { createFileRoute } from "@tanstack/react-router";
import { PublicGuide } from "@/components/site/PublicGuide";
import { pageHead } from "@/lib/public-head";
export const Route = createFileRoute("/de_/sharm-reisefuehrer")({
  head: () => pageHead("de", "guide"),
  component: Page,
});
function Page() {
  return <PublicGuide language="de" />;
}
