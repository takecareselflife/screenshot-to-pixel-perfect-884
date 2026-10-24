import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/Layout";
import { ContraceptionGame } from "@/components/ContraceptionGame";

export const Route = createFileRoute("/anticoncepcao")({
  head: () => ({
    meta: [
      { title: "Where does it go? — Contraceptive methods game | Care+" },
      { name: "description", content: "Drag, discover and learn how to prevent an unplanned pregnancy with 12 contraceptive methods and a final challenge." },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Where does it go? — Discover contraceptive methods" },
      { property: "og:description", content: "An interactive game about contraceptive methods, condoms and double protection." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  return (
    <div>
      <Link to="/biblioteca/$slug" params={{ slug: "contraception" }} className="inline-flex items-center gap-1 text-sm text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Contraceptive methods
      </Link>
      <div className="mt-3">
        <PageTitle title="Where does it go?" subtitle="Discover contraceptive methods — drag, discover and learn how to prevent an unplanned pregnancy!" />
      </div>
      <ContraceptionGame />
    </div>
  );
}
