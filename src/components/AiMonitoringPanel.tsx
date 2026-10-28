import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getAiMonitoring, setAiKillSwitch } from "@/lib/professional.functions";
import { monitoringAlerts, summarize, SCOPE_LABEL } from "@/lib/ai-monitoring";
import { Button } from "@/components/ui/button";

const fmt = (n: number) => n.toFixed(2);

export function AiMonitoringPanel() {
  const load = useServerFn(getAiMonitoring);
  const toggle = useServerFn(setAiKillSwitch);
  const client = useQueryClient();
  const q = useQuery({ queryKey: ["ai-monitoring"], queryFn: () => load(), refetchInterval: 30000 });
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (q.isPending) return <p>Loading monitoring…</p>;
  if (!q.data?.ok) return <p role="alert">Monitoring unavailable or access denied.</p>;
  const d = q.data.data;
  const { rows, total, totalBudget } = summarize(d);
  const alerts = monitoringAlerts(d);
  const active = !!d.kill_switch?.active;

  const change = async () => {
    setBusy(true); setMessage("");
    try {
      const r = await toggle({ data: { active: !active, reason } });
      if (!r.ok) setMessage(r.message);
      else { setReason(""); await client.invalidateQueries({ queryKey: ["ai-monitoring"] }); }
    } catch { setMessage("Reason must be 10–300 characters, and only authorized administrators can change this."); }
    finally { setBusy(false); }
  };

  return <section className="space-y-6">
    <h2 className="text-xl font-semibold">Paid AI monitoring — today ({d.day}, UTC)</h2>
    <p className="text-sm text-muted-foreground">Costs are conservative estimates per call, not provider invoices. No questions, audio, transcripts or user identifiers are stored.</p>

    <div className="space-y-2">
      {alerts.length ? alerts.map((a) => <p key={a.message} role="alert" className={`rounded-md border p-3 text-sm ${a.level === "critical" ? "border-destructive text-destructive" : "border-primary"}`}>{a.level === "critical" ? "⛔" : "⚠️"} {a.message}</p>)
        : <p className="text-sm">No alerts.</p>}
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th className="p-2">Service</th><th className="p-2">Received</th><th className="p-2">Rejected</th><th className="p-2">Sent to provider</th><th className="p-2">Completed</th><th className="p-2">Failed / timeout</th><th className="p-2">Est. used / budget</th><th className="p-2">Latency avg / p95</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.scope} className="border-t">
          <td className="p-2">{SCOPE_LABEL[r.scope]}</td><td className="p-2">{r.received}</td><td className="p-2">{r.rejected}</td>
          <td className="p-2">{r.processed}</td><td className="p-2">{r.completed}{r.local ? ` (+${r.local} safety replies)` : ""}</td>
          <td className="p-2">{r.failed} / {r.timeouts}</td><td className="p-2">{fmt(r.used)} / {fmt(r.budget)}</td>
          <td className="p-2">{r.avgMs ?? "—"} / {r.p95Ms ?? "—"} ms</td>
        </tr>)}
        <tr className="border-t font-semibold"><td className="p-2">Whole app</td><td colSpan={5}></td><td className="p-2">{fmt(total)} / {fmt(totalBudget)}</td><td></td></tr></tbody>
      </table>
    </div>

    <div>
      <h3 className="font-semibold">Last 7 days (estimated)</h3>
      <ul className="text-sm">{d.history.map((h) => <li key={h.day}>{h.day}: {fmt(Number(h.cost))}</li>)}{!d.history.length && <li>No paid calls yet.</li>}</ul>
    </div>

    <div className="card-base space-y-3 p-4">
      <h3 className="font-semibold">Emergency stop: {active ? "ON — paid AI paused" : "OFF — paid AI running"}</h3>
      {d.kill_switch?.reason && <p className="text-sm">Last reason: {d.kill_switch.reason}</p>}
      <label className="block text-sm">Reason (required, recorded in the audit)
        <textarea className="mt-1 w-full rounded-md border bg-background p-2" rows={2} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <Button variant={active ? "default" : "destructive"} disabled={busy || reason.trim().length < 10} onClick={change}>{active ? "Reactivate paid AI" : "Pause all paid AI"}</Button>
      {message && <p role="alert" className="text-sm">{message}</p>}
    </div>

    <div>
      <h3 className="font-semibold">Interventions</h3>
      <ul className="space-y-1 text-xs">{d.interventions.map((i) => <li key={i.at + i.action} className="border-b py-1">{new Date(i.at).toLocaleString("en-US")} · {i.action} · {i.actor ?? "operator"}{i.reason ? ` · ${i.reason}` : ""}</li>)}{!d.interventions.length && <li>None.</li>}</ul>
    </div>
  </section>;
}
