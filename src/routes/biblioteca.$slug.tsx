import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, CheckCircle2, MapPin, BookMarked, Gamepad2 } from "lucide-react";
import { articles } from "@/lib/data";
import { ListenButton } from "@/components/ListenButton";

export const Route = createFileRoute("/biblioteca/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} | Cuida+` },
          { name: "description", content: loaderData.article.summary },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:description", content: loaderData.article.summary },
        ]
      : [{ title: "Content not found | Cuida+" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <p>Content not found. <Link to="/biblioteca" className="underline">Go back</Link></p>,
  component: ArticlePage,
});

function Block({ title, icon, items, tone }: { title: string; icon: React.ReactNode; items: string[]; tone: string }) {
  return (
    <section className={`rounded-2xl p-4 ${tone}`}>
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">{icon}{title}</h2>
      <ul className="list-disc space-y-1 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  );
}

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  return (
    <article className="space-y-4">
      <Link to="/biblioteca" className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" />Library</Link>
      <h1 className="text-3xl font-semibold">{a.title}</h1>
      <p className="text-lg text-muted-foreground">{a.summary}</p>
      <ListenButton
        text={[a.title, a.summary, ...a.explain, "In practice.", ...a.practical, "Warning signs.", ...a.warning, "Where to get help.", ...a.services].join(" ")}
      />
      {a.slug === "consent" && (
        <Link to="/consentimento" className="card-base flex items-center gap-4 bg-primary p-4 text-primary-foreground transition hover:-translate-y-0.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <Gamepad2 className="h-6 w-6" aria-hidden />
          </span>
          <span>
            <strong>Play: Touch Traffic Light</strong>
            <br />
            <span className="text-sm opacity-90">An interactive game about your body, your boundaries and consent.</span>
          </span>
        </Link>
      )}
      {a.explain.map((p) => <p key={p}>{p}</p>)}
      <Block title="In practice" icon={<CheckCircle2 className="h-5 w-5" />} items={a.practical} tone="bg-secondary" />
      <Block title="Warning signs" icon={<AlertTriangle className="h-5 w-5" />} items={a.warning} tone="bg-accent" />
      <Block title="Where to get help" icon={<MapPin className="h-5 w-5" />} items={a.services} tone="bg-sky" />
      <Block title="Sources" icon={<BookMarked className="h-5 w-5" />} items={a.sources} tone="bg-muted" />
      <div className="flex flex-wrap gap-2 pt-2">
        <Link to="/servicos" className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground">Find a service</Link>
        <Link to="/assistente" className="rounded-full border px-4 py-2 font-bold">Ask a question</Link>
      </div>
    </article>
  );
}
