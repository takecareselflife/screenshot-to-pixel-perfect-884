import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, BookOpen, MessageCircle, LifeBuoy, MapPin, X } from "lucide-react";

/** Quick exit: replaces the current page with a neutral site. */
export function quickExit() {
  window.location.replace("https://www.google.com/search?q=weather+forecast");
}

export function QuickExit() {
  return (
    <button
      onClick={quickExit}
      className="inline-flex items-center gap-1.5 rounded-full bg-warm px-4 py-2 text-sm font-bold text-warm-foreground shadow-soft"
      aria-label="Quick exit: leaves this site immediately"
    >
      <X className="h-4 w-4" aria-hidden /> Leave quickly
    </button>
  );
}

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/biblioteca", label: "Learn", icon: BookOpen },
  { to: "/assistente", label: "Assistant", icon: MessageCircle },
  { to: "/ajuda", label: "Help", icon: LifeBuoy },
  { to: "/servicos", label: "Services", icon: MapPin },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-24">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:p-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-lg font-semibold text-primary">
            Care<span className="text-warm">+</span>
          </Link>
          <QuickExit />
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-3xl px-4 pb-6 text-xs text-muted-foreground">
        <p>Demonstrative prototype with fictional data. It does not replace professional care.</p>
        <p className="mt-1 flex flex-wrap gap-3">
          <Link to="/privacidade" className="underline">Privacy</Link>
          <Link to="/profissionais" className="underline">For professionals</Link>
        </p>
      </footer>
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 border-t bg-card">
        <ul className="mx-auto grid max-w-3xl grid-cols-5">
          {nav.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex flex-col items-center gap-0.5 py-2.5 text-xs text-muted-foreground"
                activeProps={{ className: "text-primary font-bold" }}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function SimBadge({ children = "Simulation" }: { children?: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-lilac px-2.5 py-0.5 text-xs font-bold text-lilac-foreground">
      {children}
    </span>
  );
}
