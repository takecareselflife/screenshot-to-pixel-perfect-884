import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Smile, HelpCircle, LifeBuoy, MapPin, MessageCircle, Info } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Care+ | Health, support and information for teens" },
      { name: "description", content: "Trusted information, emotional support and access to health services for adolescents." },
      { property: "og:title", content: "Care+ | Teen Health" },
      { property: "og:description", content: "Trusted information, emotional support and access to health services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const options = [
  { to: "/biblioteca", label: "I want to take care of my health", icon: Heart, tone: "bg-secondary text-secondary-foreground" },
  { to: "/bem-estar", label: "I want to talk about my feelings", icon: Smile, tone: "bg-sky text-sky-foreground" },
  { to: "/assistente", label: "I have questions about sexuality", icon: HelpCircle, tone: "bg-lilac text-lilac-foreground" },
  { to: "/ajuda", label: "I need help", icon: LifeBuoy, tone: "bg-warm text-warm-foreground" },
  { to: "/servicos", label: "Find a health service", icon: MapPin, tone: "bg-secondary text-secondary-foreground" },
] as const;

function Index() {
  return (
    <div>
      <section className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wider text-warm">Hi, glad you're here</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight">How do you want to take care of yourself today?</h1>
        <p className="mt-3 text-muted-foreground">Pick a path. You don't have to identify yourself to explore.</p>
      </section>
      <ul className="grid gap-3 sm:grid-cols-2">
        {options.map(({ to, label, icon: Icon, tone }) => (
          <li key={label}>
            <Link to={to} className="card-base flex items-center gap-4 p-4 transition hover:-translate-y-0.5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="font-bold">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/assistente" className="mt-6 flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground">
        <MessageCircle className="h-6 w-6" aria-hidden />
        <span><strong>Health Assistant</strong><br /><span className="text-sm opacity-90">Get your questions answered with reviewed replies</span></span>
      </Link>
      <p className="mt-6 flex gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        The "Leave quickly" button opens another site right away, but it doesn't erase your history. Use private browsing or clear your history afterwards if you need to.
      </p>
    </div>
  );
}
