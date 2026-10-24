import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/Layout";
import { StiWisdomGame } from "@/components/StiWisdomGame";

export const Route = createFileRoute("/ist-jogo")({
  head: () => ({ meta: [
    { title: "STIs — Path of Wisdom game | Cuida+" },
    { name: "description", content: "Follow a ten-step true-or-false trail about STI prevention, testing, treatment and vaccination." },
    { property: "og:title", content: "STIs — Path of Wisdom | Cuida+" },
    { property: "og:description", content: "Learn about sexual health with welcoming explanations and earn the Knowledge Trophy." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <div>
    <Link to="/biblioteca/$slug" params={{ slug: "sti" }} className="mb-3 inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" aria-hidden />Back to Sexually transmitted infections</Link>
    <PageTitle title="STIs — Path of Wisdom" subtitle="Sexual health knowledge, one step at a time." />
    <StiWisdomGame />
  </div>,
});