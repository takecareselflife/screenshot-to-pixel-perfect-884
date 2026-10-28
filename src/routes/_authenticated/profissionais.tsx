import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { demoRequests } from "@/lib/data";
import { services, type RequestStatus } from "@/lib/data";
import { PageTitle, SimBadge } from "@/components/Layout";
import { ImpactPanel } from "@/components/ImpactPanel";
import { SignOutButton, useProfessionalSession } from "@/components/ProfessionalAccount";
import { ProfessionalAdministration } from "@/components/ProfessionalAdministration";
import { authorizeProfessionalArea } from "@/lib/professional.functions";
import { canAccess } from "@/lib/professional-schemas";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profissionais")({
  head: () => ({
    meta: [
      { title: "Professionals' panel | Care+" },
      { name: "description", content: "Demo area for authorized professionals to follow up requests." },
      { property: "og:title", content: "Professionals' panel | Care+" },
      { property: "og:description", content: "Managing intake and referrals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

type Role = "intake" | "manager" | "administration";
const statuses: RequestStatus[] = ["New", "Contacted", "Received", "Referred", "In follow-up"];

function Painel() {
  const session = useProfessionalSession();
  const authorize = useServerFn(authorizeProfessionalArea);
  const [role, setRole] = useState<Role | null>(null);
  const [, force] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  // Never read the public support form's memory; this panel only contains seeded examples.
  const [reqs, setReqs] = useState(() => demoRequests.map((r) => ({ ...r, notes: [...r.notes] })));
  const [error, setError] = useState("");
  const updateRequest = (id: string, patch: Partial<(typeof reqs)[number]>) => setReqs((rows) => rows.map((r) => r.id === id ? { ...r, ...patch } : r));
  const audit = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-US")} · ${role} · ${m}`, ...l]);
  const data = session.data?.ok ? session.data.session : null;
  const check = async (area: "intake" | "indicators" | "administration") => {
    try { const result = await authorize({ data: area }); if (result.ok) return true; }
    catch { /* safe denial */ }
    setError("Access denied. Refresh your access or sign in again."); setRole(null); await session.refetch(); return false;
  };
  const choose = async (next: Role) => { if (await check(next === "manager" ? "indicators" : next)) setRole(next); };
  const guardedDemo = async (action: () => void) => { if (await check("intake")) action(); };
  if (session.isPending) return <p>Checking access…</p>;

  if (!data || (!data.admin && data.roles.length === 0)) {
    return (
      <div>
        <PageTitle title="Access not authorized" subtitle={`Professional access: ${data?.status ?? "unavailable"}.`} />
        <p className="mb-4 text-sm">An authorized administrator must approve your professional access. No requests or indicators are shown.</p>
        <Link to="/conta" className="mb-4 block text-sm underline">My professional profile</Link>
        <SignOutButton />
      </div>
    );
  }

  if (!role || !canAccess(data, role === "manager" ? "indicators" : role)) {
    return (
      <div>
        <PageTitle title="For professionals" subtitle="Choose the area you are authorized for." />
        <div className="grid gap-3 sm:grid-cols-2">
          {canAccess(data,"intake") && <Button variant="outline" onClick={() => choose("intake")}>Demo intake</Button>}
          {canAccess(data,"indicators") && <Button variant="outline" onClick={() => choose("manager")}>Anonymous indicators</Button>}
          {canAccess(data,"administration") && <Button variant="outline" onClick={() => choose("administration")}>Professional approvals</Button>}
        </div>
        {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
        <Link to="/conta" className="my-4 block text-sm underline">My professional profile</Link><SignOutButton />
      </div>
    );
  }

  const counts = statuses.map((s) => ({ s, n: reqs.filter((r) => r.status === s).length }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle title={role === "manager" ? "Indicators" : role === "administration" ? "Administration" : "Demo requests"} />
        <SignOutButton />
      </div>
      <div className="mb-4 flex flex-wrap gap-4"><Button variant="link" className="p-0" onClick={() => setRole(null)}>Change area</Button><Link to="/conta" className="text-sm underline">My professional profile</Link><Button variant="link" className="p-0" onClick={() => session.refetch()}>Refresh access</Button></div>
      <p className="mb-4 text-sm"><SimBadge>Fictional data</SimBadge> Individual questionnaire answers and conversations never appear here.</p>

      {role === "intake" && <section className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {counts.map(({ s, n }) => (
          <div key={s} className="rounded-2xl bg-secondary p-3 text-center"><p className="text-2xl font-bold">{n}</p><p className="text-xs">{s}</p></div>
        ))}
      </section>}

      {role === "manager" && <ImpactPanel />}
      {role === "administration" && <ProfessionalAdministration />}

      {role === "intake" && (
        <ul className="space-y-3">
          {reqs.map((r) => (
            <li key={r.id} className="card-base p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{r.id}</strong><span className="text-xs text-muted-foreground">{r.createdAt} · {r.city}</span>
              </div>
              <p className="mt-1">{r.topic}</p>
              <p className="text-sm text-muted-foreground">Contact: {r.contact}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select aria-label="Status" value={r.status} className="rounded-xl border bg-card p-2 text-sm"
                  onChange={(e) => { const status=e.target.value as RequestStatus; void guardedDemo(() => { updateRequest(r.id,{status}); audit(`${r.id} → ${status}`); force((x)=>x+1); }); }}>
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select aria-label="Refer to" defaultValue="" className="rounded-xl border bg-card p-2 text-sm"
                  onChange={(e) => { const target=e.target.value; if (!target) return; void guardedDemo(() => { updateRequest(r.id, { status: "Referred", notes: [...r.notes, `Referred to ${target}`] }); audit(`${r.id} referred`); force((x) => x + 1); }); }}>
                  <option value="">Refer to…</option>
                  {services.filter((s) => s.city === r.city).map((s) => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
              <form className="mt-2 flex gap-2" onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget); const note = String(f.get("n") || "").trim();
                if (!note) return; const form=e.currentTarget; void guardedDemo(() => { updateRequest(r.id, { notes: [...r.notes, note] }); audit(`${r.id} note added`); form.reset(); force((x) => x + 1); });
              }}>
                <input name="n" placeholder="Add a note…" className="flex-1 rounded-xl border bg-card p-2 text-sm" />
                <button className="rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground">Save</button>
              </form>
              {r.notes.length > 0 && <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">{r.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
            </li>
          ))}
        </ul>
      )}

      {role === "intake" && <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Demo activity (not a security audit)</h2>
        <ul className="rounded-xl bg-muted p-3 text-xs">
          <li>Session started as {role}</li>
          {log.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </section>}
    </div>
  );
}
