/** Pure monitoring rules for the administrator panel, so thresholds can be reviewed and unit-tested. */
import { DAILY_BUDGET, TOTAL_DAILY_BUDGET, type PaidScope } from "./ai-usage";

export type MonitoringData = {
  outcomes: { scope: PaidScope; outcome: string; count: number }[];
  spend: { scope: PaidScope; charged: number | null; reserved: number | null }[];
  latency: { scope: PaidScope; avg: number | null; p95: number | null }[];
  kill_switch: { active: boolean; reason: string | null; changed_at: string | null } | null;
};
export type Alert = { level: "warning" | "critical"; message: string };

export const SCOPES: PaidScope[] = ["assistant", "voice", "speech"];
export const SCOPE_LABEL: Record<PaidScope, string> = { assistant: "AI assistant", voice: "Voice input", speech: "Read aloud" };
const PROCESSED = ["completed", "failed_provider", "timeout", "cancelled", "failed_before_provider"];

export function summarize(d: MonitoringData) {
  const rows = SCOPES.map((scope) => {
    const c = (o: string) => d.outcomes.filter((x) => x.scope === scope && x.outcome === o).reduce((a, x) => a + Number(x.count), 0);
    const all = d.outcomes.filter((x) => x.scope === scope).reduce((a, x) => a + Number(x.count), 0);
    const processed = PROCESSED.reduce((a, o) => a + c(o), 0);
    const s = d.spend.find((x) => x.scope === scope);
    const used = Number(s?.charged ?? 0) + Number(s?.reserved ?? 0);
    const l = d.latency.find((x) => x.scope === scope);
    return {
      scope, received: all, processed, completed: c("completed"), local: c("local"),
      rejected: c("rejected_invalid") + c("rejected_rate") + c("rejected_budget") + c("rejected_disabled") + c("rejected_error"),
      rateLimited: c("rejected_rate"), failed: c("failed_provider"), timeouts: c("timeout"),
      used, budget: DAILY_BUDGET[scope], avgMs: l?.avg ?? null, p95Ms: l?.p95 ?? null,
    };
  });
  return { rows, total: rows.reduce((a, r) => a + r.used, 0), totalBudget: TOTAL_DAILY_BUDGET };
}

export function monitoringAlerts(d: MonitoringData): Alert[] {
  const { rows, total, totalBudget } = summarize(d);
  const out: Alert[] = [];
  if (d.kill_switch?.active) out.push({ level: "critical", message: "Emergency stop is ON: paid AI is paused." });
  const budget = (label: string, used: number, cap: number) => {
    if (used >= cap) out.push({ level: "critical", message: `${label}: daily estimated budget exhausted.` });
    else if (used >= cap * 0.8) out.push({ level: "warning", message: `${label}: ${Math.round((used / cap) * 100)}% of the daily estimated budget used.` });
  };
  budget("Whole app", total, totalBudget);
  for (const r of rows) {
    budget(SCOPE_LABEL[r.scope], r.used, r.budget);
    const bad = r.failed + r.timeouts;
    if (r.processed >= 10 && bad / r.processed > 0.1) out.push({ level: "critical", message: `${SCOPE_LABEL[r.scope]}: ${bad} of ${r.processed} provider calls failed or timed out.` });
    if (r.rateLimited >= 50) out.push({ level: "warning", message: `${SCOPE_LABEL[r.scope]}: ${r.rateLimited} requests blocked by limits today (possible abuse).` });
  }
  return out;
}
