import { createFileRoute } from "@tanstack/react-router";
import { PublicInvest } from "@/components/site/PublicInvest";
import { pageHead } from "@/lib/public-head";
export const Route = createFileRoute("/investire")({
  head: () => pageHead("it", "invest"),
  component: Page,
});
function Page() {
  return <PublicInvest language="it" />;
}
