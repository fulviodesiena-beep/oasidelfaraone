import { createFileRoute } from "@tanstack/react-router";
import { PublicHome } from "@/components/site/PublicHome";
import { publicHead } from "@/lib/public-head";
export const Route = createFileRoute("/")({ head: () => publicHead("it"), component: PublicHome });
