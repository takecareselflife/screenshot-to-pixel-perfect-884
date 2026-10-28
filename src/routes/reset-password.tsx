import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset your password | Care+" }, { name: "description", content: "Secure password recovery for Care+ professional accounts." },
    { property: "og:title", content: "Reset your password | Care+" }, { property: "og:description", content: "Set a new password using your recovery link." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }), component: ResetPassword,
});
function ResetPassword() {
  const [valid, setValid] = useState(false);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let active=true;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const recovery = hash.get("type") === "recovery";
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      setValid(recovery && !error && !!data.user); setChecked(true);
      window.history.replaceState(null,"",window.location.pathname);
    });
    return () => { active=false; };
  }, []);
  return <div className="mx-auto max-w-sm"><PageTitle title="Reset password" />
    {!checked ? <p>Checking recovery link…</p> : !valid ? <p role="alert">This recovery link is invalid or expired. Request a new one from sign-in.</p> : done ? <p role="status">Password changed. Sign in again with your new password.</p> :
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault(); const form=new FormData(e.currentTarget); const password=String(form.get("password") ?? "");
        if (password !== form.get("confirm")) { setMessage("Passwords do not match."); return; }
        setBusy(true); setMessage("");
        try { const { error }=await supabase.auth.updateUser({password});
          if (error) setMessage("Password could not be changed. Request a new link or try a stronger password.");
          else { const signout=await supabase.auth.signOut({scope:"global"}); setDone(true); if (signout.error) setMessage("Password changed, but sign-out could not be confirmed. Sign out before leaving this device."); }
        } catch { setMessage("Password recovery is unavailable. Try again later."); }
        finally { setBusy(false); }
      }}>
        <label className="grid gap-1 text-sm">New password<input name="password" required minLength={8} type="password" autoComplete="new-password" className="rounded-md border bg-card px-3 py-2" /></label>
        <label className="grid gap-1 text-sm">Confirm password<input name="confirm" required minLength={8} type="password" autoComplete="new-password" className="rounded-md border bg-card px-3 py-2" /></label>
        <Button type="submit" disabled={busy}>Set new password</Button>
      </form>}
    {message && <p role="status" className="mt-4 text-sm">{message}</p>}
    <Link to="/auth" search={{ redirect:"/profissionais" }} className="mt-6 inline-block text-sm underline">Back to sign-in</Link>
  </div>;
}