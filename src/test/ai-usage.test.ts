// Simulated: database RPCs are replaced by an in-memory fake that mirrors the SQL rules.
// The real SQL (locking, budget, kill switch, permissions) is covered by ai-usage.integration.test.ts.
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  calls: [] as { name: string; args: Record<string, unknown> }[],
  reservations: new Map<string, { scope: string; cost: number; status: string }>(),
  killed: false,
  rate: "ok" as "ok" | "rate" | "error",
}));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    rpc: async (name: string, args: Record<string, unknown>) => {
      db.calls.push({ name, args });
      if (name === "hit_rate_limit") return { data: db.rate === "rate" ? 9999 : 1, error: db.rate === "error" ? { message: "x" } : null };
      if (name === "ai_reserve") {
        if (db.killed) return { data: { error: "disabled" }, error: null };
        const used = (s?: string) => [...db.reservations.values()].filter((r) => r.status !== "released" && (!s || r.scope === s)).reduce((a, r) => a + Math.round(r.cost * 1e4), 0);
        const cost = args["_cost"] as number; const c4 = Math.round(cost * 1e4);
        if (used(args["_scope"] as string) + c4 > Math.round((args["_scope_limit"] as number) * 1e4) || used() + c4 > Math.round((args["_total_limit"] as number) * 1e4)) return { data: { error: "budget" }, error: null };
        const id = `r${db.reservations.size + 1}`;
        db.reservations.set(id, { scope: args["_scope"] as string, cost, status: "reserved" });
        return { data: { id }, error: null };
      }
      if (name === "ai_settle") {
        const r = db.reservations.get(args["_id"] as string);
        if (!r || r.status !== "reserved") return { data: false, error: null };
        r.status = args["_outcome"] === "failed_before_provider" ? "released" : "charged";
        return { data: true, error: null };
      }
      return { data: null, error: null };
    },
  },
}));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (o: unknown) => o }));

import { DAILY_BUDGET, EST_COST, reservePaidCall, settleWithStream } from "@/lib/ai-usage";
import { handleSpeechRequest } from "@/routes/api/speech";
import { monitoringAlerts, type MonitoringData } from "@/lib/ai-monitoring";

const speechReq = (text = "Olá") => new Request("http://x/api/speech", { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "1.2.3.4" }, body: JSON.stringify({ text }) });
const reserves = () => db.calls.filter((c) => c.name === "ai_reserve").length;
const realFetch = globalThis.fetch;

beforeEach(() => {
  db.calls = []; db.reservations.clear(); db.killed = false; db.rate = "ok";
  process.env["LOVABLE_API_KEY"] = "k"; process.env["RATE_LIMIT_SALT"] = "s"; delete process.env["PAID_AI_DISABLED"];
  globalThis.fetch = realFetch;
});

describe("blocked requests never reach the provider or the budget", () => {
  it("invalid request: no reservation, no provider call", async () => {
    const f = vi.fn(); globalThis.fetch = f as unknown as typeof fetch;
    expect((await handleSpeechRequest(speechReq(""))).status).toBe(400);
    expect(reserves()).toBe(0); expect(f).not.toHaveBeenCalled();
  });
  it("rate-limited request: no reservation, no provider call", async () => {
    db.rate = "rate"; const f = vi.fn(); globalThis.fetch = f as unknown as typeof fetch;
    expect((await handleSpeechRequest(speechReq())).status).toBe(429);
    expect(reserves()).toBe(0); expect(f).not.toHaveBeenCalled();
  });
  it("database switch ON: 503, provider not contacted, nothing charged", async () => {
    db.killed = true; const f = vi.fn(); globalThis.fetch = f as unknown as typeof fetch;
    expect((await handleSpeechRequest(speechReq())).status).toBe(503);
    expect(f).not.toHaveBeenCalled(); expect(db.reservations.size).toBe(0);
  });
  it("switch OFF again (reactivation): calls flow again", async () => {
    db.killed = false; globalThis.fetch = vi.fn(async () => new Response("data: x\n\n")) as typeof fetch;
    const r = await handleSpeechRequest(speechReq()); await r.text();
    expect(r.status).toBe(200);
  });
  it("deployment hard stop (PAID_AI_DISABLED=1) blocks before the database budget", async () => {
    process.env["PAID_AI_DISABLED"] = "1";
    expect((await reservePaidCall("assistant")).ok).toBe(false); expect(reserves()).toBe(0);
  });
});

describe("settlement before and after the provider", () => {
  it("failure before the provider releases the reservation (no cost)", async () => {
    const r = await reservePaidCall("voice"); if (!r.ok) throw new Error();
    await r.ticket.settle("failed_before_provider");
    expect([...db.reservations.values()][0]?.status).toBe("released");
  });
  it("provider network failure keeps the conservative charge", async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError("net"); }) as typeof fetch;
    expect((await handleSpeechRequest(speechReq())).status).toBe(502);
    expect([...db.reservations.values()][0]?.status).toBe("charged");
  });
  it("timeout is settled as timeout and charged", async () => {
    globalThis.fetch = vi.fn(async () => { throw new DOMException("t", "TimeoutError"); }) as typeof fetch;
    expect((await handleSpeechRequest(speechReq())).status).toBe(504);
    expect(db.calls.find((c) => c.name === "ai_settle")?.args["_outcome"]).toBe("timeout");
  });
  it("stream broken mid-way is recorded as provider failure, not completed", async () => {
    const r = await reservePaidCall("assistant"); if (!r.ok) throw new Error();
    const broken = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array([1])); }, pull(c) { c.error(new TypeError("cut")); } });
    await expect(new Response(settleWithStream(broken, r.ticket)).text()).rejects.toThrow();
    expect(db.calls.find((c) => c.name === "ai_settle")?.args["_outcome"]).toBe("failed_provider");
  });
  it("a reservation is settled only once even if settle is called repeatedly", async () => {
    const r = await reservePaidCall("assistant"); if (!r.ok) throw new Error();
    await r.ticket.settle("completed"); await r.ticket.settle("failed_before_provider");
    expect(db.calls.filter((c) => c.name === "ai_settle").length).toBe(1);
  });
});

describe("budget exhaustion and simultaneous requests", () => {
  it("the speech budget allows exactly floor(budget/cost) calls among 2100 simultaneous attempts", { timeout: 30000 }, async () => {
    const results = await Promise.all(Array.from({ length: 2100 }, () => reservePaidCall("speech")));
    console.log("REASONS", JSON.stringify(results.filter((r) => !r.ok).slice(0,2)), db.reservations.size);
    expect(results.filter((r) => r.ok).length).toBe(Math.floor(Math.round(DAILY_BUDGET.speech * 1e4) / Math.round(EST_COST.speech * 1e4)));
  });
});

const base: MonitoringData = { outcomes: [], spend: [], latency: [], kill_switch: { active: false, reason: null, changed_at: null } };
describe("monitoring alerts", () => {
  it("warns at 80% of a service budget", () => {
    const a = monitoringAlerts({ ...base, spend: [{ scope: "speech", charged: 48, reserved: 0 }] });
    expect(a.some((x) => x.level === "warning" && x.message.startsWith("Read aloud: 80%"))).toBe(true);
  });
  it("is critical when the whole-app budget is exhausted", () => {
    const a = monitoringAlerts({ ...base, spend: [{ scope: "assistant", charged: 150, reserved: 0 }, { scope: "speech", charged: 50, reserved: 0 }] });
    expect(a.some((x) => x.level === "critical" && x.message.startsWith("Whole app"))).toBe(true);
  });
  it("flags more than 10% provider failures", () => {
    const a = monitoringAlerts({ ...base, outcomes: [{ scope: "assistant", outcome: "completed", count: 8 }, { scope: "assistant", outcome: "timeout", count: 2 }] });
    expect(a.some((x) => x.message.includes("2 of 10"))).toBe(true);
  });
  it("shows the emergency stop", () => {
    expect(monitoringAlerts({ ...base, kill_switch: { active: true, reason: "test", changed_at: null } })[0]?.level).toBe("critical");
  });
  it("no alerts when quiet", () => expect(monitoringAlerts(base)).toEqual([]));
});

describe("financial records contain no identifiers or content", () => {
  it("never sends IP, question text or API key to usage RPCs", async () => {
    globalThis.fetch = vi.fn(async () => new Response("data: x\n\n")) as typeof fetch;
    await (await handleSpeechRequest(speechReq("Tenho febre e dor"))).text();
    const usage = JSON.stringify(db.calls.filter((c) => c.name.startsWith("ai_")));
    for (const s of ["1.2.3.4", "febre", "\"k\""]) expect(usage).not.toContain(s);
  });
});
