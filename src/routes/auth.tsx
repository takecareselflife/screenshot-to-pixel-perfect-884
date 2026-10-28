import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { safeRedirect } from "@/lib/professional-schemas";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: safeRedirect(s["redirect"]) }),
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
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try { if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      setMsg(error ? "The reset request could not be sent. Please wait and try again." : "If this email has an account, a password-reset link will arrive. Check your inbox.");
    } else if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Wrong email or password, or email not confirmed yet.");
      else navigate({ to: redirect });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? "Account creation could not be completed. Please check your details and try again." : "Check your email to confirm your account. Complete your private professional profile; an administrator must approve access.");
    }} catch { setMsg("The account service is unavailable. Please try again later."); }
    finally { setBusy(false); }
  };

  const field = "w-full rounded-xl border bg-card px-3 py-2";
  return (
    <div className="mx-auto max-w-sm">
      <PageTitle title="For professionals" subtitle="Restricted to authorized professionals. Adolescents don't need an account." />
      <form onSubmit={submit} className="space-y-3">
        <label className="grid text-sm">Email<input type="email" required autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        {mode !== "reset" && <label className="grid text-sm">Password<input type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} className={field} value={password} onChange={(e) => setPassword(e.target.value)} /></label>}
        <Button disabled={busy} type="submit" className="w-full">{mode === "reset" ? "Send reset link" : mode === "in" ? "Sign in" : "Create account"}</Button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </form>
      <Button variant="link" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="mt-3 h-auto whitespace-normal p-0 text-left">
        {mode === "in" ? "No account? Create one (requires approval)" : "Already have an account? Sign in"}
      </Button>
      {mode === "in" && <Button variant="link" className="mt-3 block h-auto p-0" onClick={() => { setMode("reset"); setMsg(""); }}>Forgot password?</Button>}
    </div>
  );
}
