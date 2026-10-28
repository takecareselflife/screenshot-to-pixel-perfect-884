import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//") ? s.redirect : "/profissionais" }),
  head: () => ({
    meta: [
      { title: "Professional sign-in | Care+" },
      { name: "description", content: "Sign-in for authorized Care+ professionals." },
      { property: "og:title", content: "Professional sign-in | Care+" },
      { property: "og:description", content: "Restricted access for authorized professionals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Wrong email or password, or email not confirmed yet.");
      else navigate({ to: redirect });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth" } });
      setMsg(error ? error.message : "Check your email to confirm your account. An administrator must then approve your access.");
    }
    setBusy(false);
  };

  const field = "w-full rounded-xl border bg-card px-3 py-2";
  return (
    <div className="mx-auto max-w-sm">
      <PageTitle title="For professionals" subtitle="Restricted to authorized professionals. Adolescents don't need an account." />
      <form onSubmit={submit} className="space-y-3">
        <label className="grid text-sm">Email<input type="email" required autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="grid text-sm">Password<input type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} className={field} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button disabled={busy} className="w-full rounded-xl bg-primary py-2 font-bold text-primary-foreground disabled:opacity-50">{mode === "in" ? "Sign in" : "Create account"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </form>
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="mt-3 text-sm underline">
        {mode === "in" ? "No account? Create one (requires approval)" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
