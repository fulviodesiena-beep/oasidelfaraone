import { createFileRoute } from "@tanstack/react-router";
import { redirectRitual } from "@/lib/ritual-redirect";
// Old ritual page, still printed on in-room QR codes: redirects to the ritual section of the home.
export const Route = createFileRoute("/en_/ritual")({ beforeLoad: ({ location }) => redirectRitual("en", location.searchStr) });
