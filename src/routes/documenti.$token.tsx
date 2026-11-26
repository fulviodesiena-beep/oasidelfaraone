import { createFileRoute } from "@tanstack/react-router";
import { GuestDocumentsPage } from "@/components/site/GuestDocuments";

// Private guest page: upload of travelers' documents and travel times, reached only with a signed, expiring link.
export const Route = createFileRoute("/documenti/$token")({
  head: () => ({ meta: [{ title: "Documenti per il tuo soggiorno — Oasi del Faraone" }, { name: "robots", content: "noindex, nofollow" }, { name: "referrer", content: "no-referrer" }] }),
  component: GuestDocumentsPage,
});
