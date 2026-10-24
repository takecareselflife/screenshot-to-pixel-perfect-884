import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { articles } from "@/lib/data";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Health library | Cuida+" },
      { name: "description", content: "Content on sexuality, mental health, violence, digital safety and rights." },
      { property: "og:title", content: "Health library | Cuida+" },
      { property: "og:description", content: "Clear content with trustworthy sources for adolescents." },
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
        {articles.map((a) => (
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
