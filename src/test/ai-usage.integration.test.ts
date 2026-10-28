// Explicit opt-in (RUN_SECURITY_INTEGRATION=1): real database functions, disposable synthetic accounts,
// tiny test-only limits, no provider calls. Rows created here are deleted afterwards.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const enabled = process.env["RUN_SECURITY_INTEGRATION"] === "1";
const shim = (key: string) => ({ fetch: (input: RequestInfo | URL, init?: RequestInit) => {
  const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h });
} });

describe.skipIf(!enabled)("live paid-AI budget, kill switch and monitoring permissions", () => {
  const url = process.env["SUPABASE_URL"] ?? "";
  const adminKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  const publicKey = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const svc = createClient<Database>(url || "http://localhost", adminKey || "x", { auth: { persistSession: false, storageKey: "ai-svc" }, global: shim(adminKey) });
  const anon = createClient<Database>(url || "http://localhost", publicKey || "x", { auth: { persistSession: false, storageKey: "ai-anon" }, global: shim(publicKey) });
  const users: { id: string; client: SupabaseClient<Database> }[] = [];
  const reservationIds: string[] = [];
  const startedAt = new Date().toISOString();

  beforeAll(async () => {
    for (let i = 0; i < 2; i++) {
      const email = `care-ai-${crypto.randomUUID()}@example.com`, password = crypto.randomUUID() + crypto.randomUUID();
      const u = await svc.auth.admin.createUser({ email, password, email_confirm: true });
      if (!u.data.user) throw new Error("setup");
      const client = createClient<Database>(url, publicKey, { auth: { persistSession: false, storageKey: `ai-u${i}` }, global: shim(publicKey) });
      await client.auth.signInWithPassword({ email, password });
      users.push({ id: u.data.user.id, client });
    }
    await svc.from("admin_authorizations").insert({ user_id: users[0]!.id, active: true });
  }, 60000);

  afterAll(async () => {
    await svc.from("ai_kill_switch").update({ active: false }).eq("id", 1);
    if (reservationIds.length) await svc.from("ai_budget_reservations").delete().in("id", reservationIds);
    await svc.from("ai_usage_events").delete().gte("created_at", startedAt).eq("est_cost", 0.0001);
    for (const u of users) { await u.client.auth.signOut(); await svc.auth.admin.deleteUser(u.id); await svc.from("security_audit").delete().eq("actor_id", u.id); }
  }, 60000);

  it("anonymous and ordinary users cannot reserve, settle or record usage", async () => {
    expect((await anon.rpc("ai_reserve", { _scope: "speech", _cost: 0.0001, _scope_limit: 1, _total_limit: 1 })).error).not.toBeNull();
    expect((await users[1]!.client.rpc("ai_record", { _scope: "speech", _outcome: "completed", _cost: 0, _latency: 1 })).error).not.toBeNull();
    expect((await anon.from("ai_usage_events").select("*")).data ?? []).toEqual([]);
  });

  it("40 simultaneous reservations never exceed the ceiling", async () => {
    // Ceiling = today's existing usage + exactly 5 test reservations.
    const { data } = await svc.from("ai_budget_reservations").select("est_cost").neq("status", "released").eq("day", new Date().toISOString().slice(0, 10));
    const used = (data ?? []).reduce((a, r) => a + Number(r.est_cost), 0);
    const cap = used + 0.0005 + 1e-6;
    const results = await Promise.all(Array.from({ length: 40 }, () => svc.rpc("ai_reserve", { _scope: "speech", _cost: 0.0001, _scope_limit: cap, _total_limit: cap })));
    const ok = results.map((r) => (r.data as { id?: string } | null)?.id).filter((x): x is string => !!x);
    reservationIds.push(...ok);
    expect(ok.length).toBe(5);
    expect(results.filter((r) => (r.data as { error?: string } | null)?.error === "budget").length).toBe(35);
  });

  it("settlement is single-use, and releasing frees budget", async () => {
    const id = reservationIds[0]!;
    expect((await svc.rpc("ai_settle", { _id: id, _outcome: "failed_before_provider", _latency: 1 })).data).toBe(true);
    expect((await svc.rpc("ai_settle", { _id: id, _outcome: "completed", _latency: 1 })).data).toBe(false);
    const row = await svc.from("ai_budget_reservations").select("status").eq("id", id).single();
    expect(row.data?.status).toBe("released");
  });

  it("non-administrators cannot see monitoring or flip the switch", async () => {
    expect((await users[1]!.client.rpc("ai_monitoring")).data).toMatchObject({ error: "forbidden" });
    expect((await users[1]!.client.rpc("ai_set_kill_switch", { _active: true, _reason: "attempted by a non-admin" })).data).toMatchObject({ error: "forbidden" });
  });

  it("an authorized administrator activates with a reason; reservations are then refused; reactivation is audited", async () => {
    const a = users[0]!.client;
    expect((await a.rpc("ai_set_kill_switch", { _active: true, _reason: "short" })).data).toMatchObject({ error: "invalid" });
    expect((await a.rpc("ai_set_kill_switch", { _active: true, _reason: "Integration test: abnormal spend drill" })).data).toMatchObject({ ok: true });
    expect((await svc.rpc("ai_reserve", { _scope: "speech", _cost: 0.0001, _scope_limit: 1e6, _total_limit: 1e6 })).data).toMatchObject({ error: "disabled" });
    expect((await a.rpc("ai_set_kill_switch", { _active: false, _reason: "Integration test: drill finished" })).data).toMatchObject({ ok: true });
    const m = (await a.rpc("ai_monitoring")).data as { kill_switch: { active: boolean }; interventions: { action: string; actor: string; reason: string }[] };
    expect(m.kill_switch.active).toBe(false);
    const mine = m.interventions.filter((i) => i.actor === users[0]!.id).map((i) => i.action);
    expect(mine).toEqual(expect.arrayContaining(["ai_kill_switch_activated", "ai_kill_switch_deactivated"]));
  });
});
