import { createFileRoute } from "@tanstack/react-router";
import { PublicGuide } from "@/components/site/PublicGuide";
import { pageHead } from "@/lib/public-head";
export const Route = createFileRoute("/guida-sharm")({
  head: () => pageHead("it", "guide"),
  component: Page,
});
function Page() {
  return <PublicGuide language="it" />;
}
