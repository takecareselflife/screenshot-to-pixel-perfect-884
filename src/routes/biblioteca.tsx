import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ChevronRight, Gamepad2 } from "lucide-react";
import { libraryArticles } from "@/lib/library";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Health library | Cuida+" },
      { name: "description", content: "Content on sexuality, mental health, violence, digital safety and rights." },
      { property: "og:title", content: "Health library | Cuida+" },
      { property: "og:description", content: "Clear content with trustworthy sources for adolescents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Biblioteca,
});

function Biblioteca() {
  const match = useMatchRoute();
  if (match({ to: "/biblioteca/$slug", fuzzy: true })) return <Outlet />;
  return (
    <div>
      <PageTitle title="Library" subtitle="Simple information, with trustworthy sources. Demo content to be reviewed by professionals." />
      <ul className="grid gap-3">
        <li>
          <Link to="/consentimento" className="card-base flex items-center gap-3 bg-lilac p-4 text-lilac-foreground">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lilac-foreground/10">
              <Gamepad2 className="h-6 w-6" aria-hidden />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Touch Traffic Light — body safety game</h2>
              <p className="text-sm opacity-90">An interactive game about boundaries, consent and getting help.</p>
            </div>
            <ChevronRight className="h-5 w-5 opacity-70" aria-hidden />
          </Link>
        </li>
        {libraryArticles.map((a) => (
          <li key={a.slug}>
            <Link to="/biblioteca/$slug" params={{ slug: a.slug }} className="card-base flex items-center gap-3 p-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{a.title}</h2>
                <p className="text-sm text-muted-foreground">{a.summary}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
