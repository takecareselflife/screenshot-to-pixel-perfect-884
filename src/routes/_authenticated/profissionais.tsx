import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listRequests, updateRequest } from "@/lib/requests-store";
import { services, type RequestStatus } from "@/lib/data";
import { PageTitle, SimBadge } from "@/components/Layout";
import { ImpactPanel } from "@/components/ImpactPanel";

export const Route = createFileRoute("/profissionais")({
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

type Role = "intake" | "manager";
const statuses: RequestStatus[] = ["New", "Contacted", "Received", "Referred", "In follow-up"];

function Painel() {
  const [role, setRole] = useState<Role | null>(null);
  const [, force] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const reqs = listRequests();
  const audit = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-US")} · ${role} · ${m}`, ...l]);

  if (!role) {
    return (
      <div>
        <PageTitle title="For professionals" subtitle="Restricted access for authorized professionals." />
        <p className="mb-4 text-sm"><SimBadge>Simulated login</SimBadge> The real version will have authentication and role-based access control.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => setRole("intake")} className="card-base p-4 text-left"><h2 className="font-semibold">Sign in as an intake professional</h2><p className="text-sm text-muted-foreground">Sees and manages referred requests.</p></button>
          <button onClick={() => setRole("manager")} className="card-base p-4 text-left"><h2 className="font-semibold">Sign in as a manager</h2><p className="text-sm text-muted-foreground">Sees only aggregated indicators.</p></button>
        </div>
      </div>
    );
  }

  const counts = statuses.map((s) => ({ s, n: reqs.filter((r) => r.status === s).length }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <PageTitle title={role === "manager" ? "Indicators" : "Requests"} />
        <button onClick={() => setRole(null)} className="text-sm underline">Sign out</button>
      </div>
      <p className="mb-4 text-sm"><SimBadge>Fictional data</SimBadge> Individual questionnaire answers and conversations never appear here.</p>

      <section className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {counts.map(({ s, n }) => (
          <div key={s} className="rounded-2xl bg-secondary p-3 text-center"><p className="text-2xl font-bold">{n}</p><p className="text-xs">{s}</p></div>
        ))}
      </section>

      {role === "manager" && <ImpactPanel />}

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
                  onChange={(e) => { updateRequest(r.id, { status: e.target.value as RequestStatus }); audit(`${r.id} → ${e.target.value}`); force((x) => x + 1); }}>
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select aria-label="Refer to" defaultValue="" className="rounded-xl border bg-card p-2 text-sm"
                  onChange={(e) => { if (!e.target.value) return; updateRequest(r.id, { status: "Referred", notes: [...r.notes, `Referred to ${e.target.value}`] }); audit(`${r.id} referred`); force((x) => x + 1); }}>
                  <option value="">Refer to…</option>
                  {services.filter((s) => s.city === r.city).map((s) => <option key={s.id}>{s.name}</option>)}
                </select>
              </div>
              <form className="mt-2 flex gap-2" onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget); const note = String(f.get("n") || "").trim();
                if (!note) return; updateRequest(r.id, { notes: [...r.notes, note] }); audit(`${r.id} note added`); e.currentTarget.reset(); force((x) => x + 1);
              }}>
                <input name="n" placeholder="Add a note…" className="flex-1 rounded-xl border bg-card p-2 text-sm" />
                <button className="rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground">Save</button>
              </form>
              {r.notes.length > 0 && <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">{r.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Administrative access log</h2>
        <ul className="rounded-xl bg-muted p-3 text-xs">
          <li>Session started as {role}</li>
          {log.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </section>
    </div>
  );
}
