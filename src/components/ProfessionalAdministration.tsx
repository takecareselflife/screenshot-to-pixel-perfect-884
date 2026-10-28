import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { changeProfessionalAccess, getAdministrativeAudit, getAdministrativeRecords } from "@/lib/professional.functions";
import { Button } from "@/components/ui/button";
import { AiMonitoringPanel } from "@/components/AiMonitoringPanel";
import type { ProfessionalRecord } from "@/lib/professional-schemas";

function AccessRow({ record, onSaved }: { record: ProfessionalRecord; onSaved: () => Promise<void> }) {
  const change = useServerFn(changeProfessionalAccess);
  const [roles, setRoles] = useState<("professional" | "manager")[]>(record.roles);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const update = async (status: "approved" | "suspended" | "revoked") => {
    setBusy(true); setMessage("");
    try {
      const result = await change({ data: { target: record.id, status, roles } });
      if (!result.ok) setMessage(result.message); else await onSaved();
    } catch { setMessage("Access change denied or unavailable."); }
    finally { setBusy(false); }
  };
  return <li className="card-base space-y-3 p-4">
    <h3 className="font-semibold">{record.display_name || "Profile not completed"}</h3>
    <p className="text-sm">{record.registration || "Registration not provided"} · {record.status}</p>
    <div className="flex flex-wrap gap-4 text-sm">{(["professional", "manager"] as const).map((role) => <label key={role} className="flex items-center gap-2"><input type="checkbox" checked={roles.includes(role)} onChange={(e) => setRoles((r) => e.target.checked ? [...r, role] : r.filter((x) => x !== role))} />{role === "professional" ? "Demo intake" : "Anonymous indicators"}</label>)}</div>
    <div className="flex flex-wrap gap-2">
      <Button disabled={busy || !roles.length || !record.display_name || !record.registration} onClick={() => update("approved")}>Approve selected access</Button>
      <Button variant="outline" disabled={busy} onClick={() => update("suspended")}>Suspend</Button>
      <Button variant="destructive" disabled={busy} onClick={() => update("revoked")}>Revoke</Button>
    </div>{message && <p role="alert" className="text-sm">{message}</p>}
  </li>;
}

export function ProfessionalAdministration() {
  const recordsFn = useServerFn(getAdministrativeRecords);
  const auditFn = useServerFn(getAdministrativeAudit);
  const client = useQueryClient();
  const records = useQuery({ queryKey: ["admin-professionals"], queryFn: () => recordsFn(), refetchInterval: 15000 });
  const audit = useQuery({ queryKey: ["admin-audit"], queryFn: () => auditFn() });
  const refresh = async () => { await client.invalidateQueries({ queryKey: ["admin-professionals"] }); await client.invalidateQueries({ queryKey: ["admin-audit"] }); };
  return <section className="space-y-6">
    <AiMonitoringPanel />
    <h2 className="text-xl font-semibold">Professional approvals</h2>
    {records.isPending ? <p>Checking permissions…</p> : records.data?.ok ? <ul className="space-y-3">{records.data.records.map((record) => <AccessRow key={`${record.id}-${record.status}-${record.roles.join()}`} record={record} onSaved={refresh} />)}{!records.data.records.length && <li>No pending professional profiles.</li>}</ul> : <p role="alert">Administrator access denied or unavailable.</p>}
    <h2 className="text-xl font-semibold">Security audit — latest 100 events</h2>
    {audit.data?.ok ? <ul className="space-y-2 text-xs">{audit.data.events.map((event) => <li key={event.id} className="border-b py-2"><p>{new Date(event.occurred_at).toLocaleString("en-US")} · {event.action}</p><p className="break-all">Actor: {event.actor_id ?? "Controlled operator"} · Subject: {event.subject_id ?? "—"}</p></li>)}</ul> : <p className="text-sm">Audit unavailable or access denied.</p>}
  </section>;
}