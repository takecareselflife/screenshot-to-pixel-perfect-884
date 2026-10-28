import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProfessionalSession, saveOwnProfile } from "@/lib/professional.functions";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/Layout";

export function SignOutButton() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true); setError(false);
    await client.cancelQueries();
    client.clear();
    const { error: failed } = await supabase.auth.signOut({ scope: "global" });
    if (failed) { setError(true); setBusy(false); return; }
    await navigate({ to: "/auth", search: { redirect: "/profissionais" }, replace: true });
  };
  return <div><Button variant="outline" disabled={busy} onClick={logout}>Sign out</Button>{error && <p role="alert" className="text-sm text-destructive">Sign-out failed. Try again; your session may still be active.</p>}</div>;
}

export function useProfessionalSession() {
  const getSession = useServerFn(getProfessionalSession);
  return useQuery({ queryKey: ["professional-session"], queryFn: () => getSession(), refetchInterval: 15000, refetchOnWindowFocus: "always", staleTime: 0 });
}

export function ProfessionalAccount() {
  const session = useProfessionalSession();
  const save = useServerFn(saveOwnProfile);
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const data = session.data?.ok ? session.data.session : null;
  const blocked = !data || data.status === "suspended" || data.status === "revoked";
  return <div>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><PageTitle title="My professional profile" /><SignOutButton /></div>
    {session.isPending ? <p>Checking your account…</p> : !data ? <p role="alert">Access unavailable. Sign in again.</p> : <>
      <p className="mb-4 text-sm">Access status: <strong>{data.status}</strong></p>
      <form key={`${data.profile?.display_name}|${data.profile?.registration}`} className="max-w-md space-y-4" onSubmit={async (e) => {
        e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); setMessage("");
        try {
          const result = await save({ data: { display_name: String(form.get("name") ?? ""), registration: String(form.get("registration") ?? "") } });
          setMessage(result.ok ? "Saved. Profile changes require renewed approval before professional access." : result.message);
          await client.invalidateQueries({ queryKey: ["professional-session"] });
        } catch { setMessage("Could not save. Check your access and try again."); }
        finally { setBusy(false); }
      }}>
        <label className="grid gap-1 text-sm">Professional name<input name="name" required maxLength={100} defaultValue={data.profile?.display_name ?? ""} disabled={blocked} className="rounded-md border bg-card px-3 py-2" /></label>
        <label className="grid gap-1 text-sm">Professional registration (council / region / number)<input name="registration" required maxLength={80} defaultValue={data.profile?.registration ?? ""} disabled={blocked} className="rounded-md border bg-card px-3 py-2" /></label>
        <Button disabled={blocked || busy} type="submit">Save profile</Button>
        {message && <p role="status" className="text-sm">{message}</p>}
      </form>
    </>}
    <Link to="/profissionais" className="mt-6 inline-block text-sm underline">Back to professional access</Link>
  </div>;
}