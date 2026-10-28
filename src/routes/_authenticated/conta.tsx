import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalAccount } from "@/components/ProfessionalAccount";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [
    { title: "Private professional profile | Care+" },
    { name: "description", content: "Manage your own private Care+ professional profile." },
    { property: "og:title", content: "Private professional profile | Care+" },
    { property: "og:description", content: "Private account details and access status." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }), component: ProfessionalAccount,
});