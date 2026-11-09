import { createFileRoute } from "@tanstack/react-router";
import { ConfirmPage } from "@/components/site/EmailPages";
export const Route = createFileRoute("/newsletter/conferma")({
  ssr: false,
  head: () => ({ meta: [{ title: "Conferma iscrizione — Lettere dall'Oasi" }, { name: "description", content: "Conferma l'iscrizione alla newsletter Lettere dall'Oasi di Oasi del Faraone." }, { name: "robots", content: "noindex" }, { property: "og:title", content: "Conferma iscrizione — Lettere dall'Oasi" }, { property: "og:description", content: "Conferma l'iscrizione alla newsletter di Oasi del Faraone." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ConfirmPage,
});
