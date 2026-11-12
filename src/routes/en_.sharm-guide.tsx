import { createFileRoute } from "@tanstack/react-router";
import { PublicGuide } from "@/components/site/PublicGuide";
import { pageHead } from "@/lib/public-head";
export const Route = createFileRoute("/en_/sharm-guide")({
  head: () => pageHead("en", "guide"),
  component: Page,
});
function Page() {
  return <PublicGuide language="en" />;
}
