/**
 * Paid AI spending control. A budget reservation is made only immediately before the provider
 * is contacted, so rejected requests never consume budget. Costs are conservative per-call
 * ESTIMATES (not provider invoices). Records hold only service, outcome, estimated cost and latency:
 * no IP, user, question, audio or transcript.
 */
import { DAILY_BUDGET, EST_COST, TOTAL_DAILY_BUDGET, type PaidScope } from "./ai-budget";
export { DAILY_BUDGET, EST_COST, TOTAL_DAILY_BUDGET, type PaidScope };
export type RejectOutcome = "rejected_invalid" | "rejected_rate" | "rejected_error" | "local";
export type SettleOutcome = "completed" | "failed_before_provider" | "failed_provider" | "timeout" | "cancelled";

let adminModule: Promise<typeof import("@/integrations/supabase/client.server")> | undefined;
/** Load the privileged client once per worker (avoids concurrent duplicate module loads). */
async function admin() {
  adminModule ??= import("@/integrations/supabase/client.server");
  return (await adminModule).supabaseAdmin;
}

/** Best-effort aggregate record; never throws and never blocks the response on failure. */
export async function recordOutcome(scope: PaidScope, outcome: RejectOutcome) {
  try { await (await admin()).rpc("ai_record", { _scope: scope, _outcome: outcome, _cost: 0, _latency: null as unknown as number }); } catch { /* ignore */ }
}

export type Ticket = { settle: (outcome: SettleOutcome) => Promise<void> };
export type Reservation = { ok: true; ticket: Ticket } | { ok: false; reason: "disabled" | "budget" | "error" };

export async function reservePaidCall(scope: PaidScope): Promise<Reservation> {
  // Deployment-level hard stop (fails closed), in addition to the audited database switch.
  if (process.env["PAID_AI_DISABLED"] === "1") {
    try { await (await admin()).rpc("ai_record", { _scope: scope, _outcome: "rejected_disabled", _cost: 0, _latency: null as unknown as number }); } catch { /* ignore */ }
    return { ok: false, reason: "disabled" };
  }
  try {
    const db = await admin();
    const { data, error } = await db.rpc("ai_reserve", {
      _scope: scope, _cost: EST_COST[scope], _scope_limit: DAILY_BUDGET[scope], _total_limit: TOTAL_DAILY_BUDGET,
    });
    const r = data as { id?: string; error?: string } | null;
    if (error || !r) { await recordOutcome(scope, "rejected_error"); return { ok: false, reason: "error" }; }
    if (r.error === "disabled") return { ok: false, reason: "disabled" };
    if (r.error === "budget") return { ok: false, reason: "budget" };
    if (!r.id) return { ok: false, reason: "error" };
    const id = r.id;
    const started = Date.now();
    let settled = false;
    return {
      ok: true,
      ticket: {
        // Settles once. Anything except failed_before_provider keeps the estimated charge, because the
        // provider may bill a request that failed, timed out or was cancelled after it was sent.
        settle: async (outcome) => {
          if (settled) return;
          settled = true;
          try { await db.rpc("ai_settle", { _id: id, _outcome: outcome, _latency: Date.now() - started }); } catch { /* reservation stays charged */ }
        },
      },
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export const failureOutcome = (e: unknown): SettleOutcome =>
  e instanceof DOMException && e.name === "TimeoutError" ? "timeout"
  : e instanceof DOMException && e.name === "AbortError" ? "cancelled"
  : "failed_provider";

/** Pass a provider stream through and settle when it finishes, errors or is cancelled. */
export function settleWithStream(body: ReadableStream<Uint8Array>, ticket: Ticket, prefix?: Uint8Array, outcomeOnDone: () => SettleOutcome = () => "completed") {
  const reader = body.getReader();
  return new ReadableStream<Uint8Array>({
    start(controller) { if (prefix) controller.enqueue(prefix); },
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) { controller.close(); await ticket.settle(outcomeOnDone()); return; }
        controller.enqueue(value);
      } catch (e) {
        await ticket.settle(failureOutcome(e));
        controller.error(e);
      }
    },
    async cancel(reason) { await ticket.settle("cancelled"); await reader.cancel(reason); },
  });
}
