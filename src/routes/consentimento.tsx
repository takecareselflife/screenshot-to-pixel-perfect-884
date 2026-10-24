import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/Layout";
import { TouchTrafficLight } from "@/components/TouchTrafficLight";

export const Route = createFileRoute("/consentimento")({
  head: () => ({
    meta: [
      { title: "Touch Traffic Light — Body Safety & Consent game | Cuida+" },
      { name: "description", content: "An interactive game about body autonomy, personal boundaries, consent and how to seek help." },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Touch Traffic Light — Body Safety & Consent" },
      { property: "og:description", content: "Learn about your body, your boundaries, and your right to feel safe." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  return (
    <div>
      <Link to="/biblioteca/$slug" params={{ slug: "consent" }} className="inline-flex items-center gap-1 text-sm text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Consent and healthy relationships
      </Link>
      <div className="mt-3">
        <PageTitle
          title="Touch Traffic Light"
          subtitle="Body Safety & Consent — an interactive game about body autonomy, boundaries, consent and how to seek help."
        />
      </div>
      <TouchTrafficLight />
    </div>
  );
}
