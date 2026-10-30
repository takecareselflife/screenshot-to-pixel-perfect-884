import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/Layout";
import { PossibilitiesGame } from "@/components/PossibilitiesGame";

export const Route = createFileRoute("/possibilidades")({
  head: () => ({ meta: [
    { title: "Expand Your Possibilities — well-being game | Care+" },
    { name: "description", content: "Explore real-life situations and discover more than one way forward. A gentle emotional well-being game for ages 12–17." },
    { property: "og:title", content: "Expand Your Possibilities | Care+" },
    { property: "og:description", content: "More than one way forward: explore options, earn badges, choose your next step." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <div>
    <Link to="/biblioteca" className="mb-3 inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" aria-hidden />Back to Library</Link>
    <PageTitle title="Expand Your Possibilities" subtitle="More than one way forward." />
    <PossibilitiesGame />
  </div>,
});
