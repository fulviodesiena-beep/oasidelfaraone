import { createFileRoute } from "@tanstack/react-router";
import { UnsubscribePage } from "@/components/site/EmailPages";
import { translate } from "@/lib/i18n";
const title = translate("de", "Disiscrizione") + " — Oasi del Faraone";
const description = translate("de", "Vuoi smettere di ricevere newsletter e offerte da Oasi del Faraone?");
export const Route = createFileRoute("/de_/abmelden")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { name: "robots", content: "noindex" }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <UnsubscribePage language="de" />,
});
