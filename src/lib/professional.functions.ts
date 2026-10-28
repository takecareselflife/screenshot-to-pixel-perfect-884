import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { areaSchema, manageSchema, profileSchema, recordSchema, sessionSchema } from "./professional-schemas";
import { checkLimit } from "./rate-limit";
import { z } from "zod";

// Expected authentication failures must not leak internals or create raw-error logs.
const safeAuthErrors = createMiddleware({ type: "function" }).server(async ({ next }) => {
  try { return await next(); }
  catch { throw new Response("Access denied. Sign in again.", { status: 401 }); }
});
const verifiedSession = createMiddleware({ type: "function" })
  .middleware([safeAuthErrors, requireSupabaseAuth])
  .server(async ({ context, next }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data, error } = await context.supabase.auth.getUser();
    if (error || data.user?.id !== context.userId) throw new Response("Sign in again.", { status: 401 });
    const active = await context.supabase.rpc("has_active_session");
    if (active.error || !active.data) throw new Response("Sign in again.", { status: 401 });
    return next({ context });
  });

const failed = { ok: false as const, message: "Access denied or unavailable. Refresh your access or sign in again." };
const rpcError = (data: unknown) => typeof data === "object" && data !== null && "error" in data;

export const getProfessionalSession = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("professional_session");
    const parsed = sessionSchema.safeParse(data);
    return error || !parsed.success ? failed : { ok: true as const, session: parsed.data };
  });

export const saveOwnProfile = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ context, data }) => {
    const limit = await checkLimit(getRequest(), { scope: "profile", client: 10, global: 300 });
    if (limit !== "ok") return { ok: false as const, message: "Please wait a minute before trying again." };
    const { data: row, error } = await context.supabase.from("profiles")
      .update(data).eq("id", context.userId).select("id").maybeSingle();
    return error || !row ? failed : { ok: true as const };
  });

export const authorizeProfessionalArea = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).inputValidator((input) => areaSchema.parse(input))
  .handler(async ({ context, data }) => {
    const result = await context.supabase.rpc("authorize_professional", { _area: data });
    return result.error || rpcError(result.data) ? failed : { ok: true as const };
  });

export const getAdministrativeRecords = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("admin_professionals");
    const parsed = z.object({ records: z.array(recordSchema) }).safeParse(data);
    return error || !parsed.success ? failed : { ok: true as const, records: parsed.data.records };
  });

export const changeProfessionalAccess = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).inputValidator((input) => manageSchema.parse(input))
  .handler(async ({ context, data }) => {
    const limit = await checkLimit(getRequest(), { scope: "admin", client: 20, global: 300 });
    if (limit !== "ok") return { ok: false as const, message: "Please wait a minute before trying again." };
    const result = await context.supabase.rpc("manage_professional", { _target: data.target, _status: data.status, _roles: data.roles });
    return result.error || rpcError(result.data) ? failed : { ok: true as const };
  });

export const getAdministrativeAudit = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).handler(async ({ context }) => {
    const authorized = await context.supabase.rpc("authorize_professional", { _area: "administration" });
    if (authorized.error || rpcError(authorized.data)) return failed;
    const result = await context.supabase.from("security_audit")
      .select("id,actor_id,subject_id,action,occurred_at,details").order("occurred_at", { ascending: false }).limit(100);
    return result.error ? failed : { ok: true as const, events: result.data };
  });

export const getProfessionalIndicators = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).handler(async ({ context }) => {
    const authorized = await context.supabase.rpc("authorize_professional", { _area: "indicators" });
    if (authorized.error || rpcError(authorized.data)) return failed;
    const result = await context.supabase.rpc("impact_summary");
    return result.error ? failed : { ok: true as const, rows: result.data };
  });
const killSwitchSchema = z.object({ active: z.boolean(), reason: z.string().trim().min(10).max(300) });

export const getAiMonitoring = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("ai_monitoring");
    if (error || !data || rpcError(data)) return failed;
    return { ok: true as const, data: data as unknown as import("./ai-monitoring").MonitoringData & {
      day: string; history: { day: string; cost: number }[];
      interventions: { at: string; actor: string | null; action: string; reason: string | null }[];
    } };
  });

export const setAiKillSwitch = createServerFn({ method: "POST" })
  .middleware([verifiedSession]).inputValidator((input) => killSwitchSchema.parse(input))
  .handler(async ({ context, data }) => {
    const limit = await checkLimit(getRequest(), { scope: "admin", client: 20, global: 300 });
    if (limit !== "ok") return { ok: false as const, message: "Please wait a minute before trying again." };
    const result = await context.supabase.rpc("ai_set_kill_switch", { _active: data.active, _reason: data.reason });
    return result.error || rpcError(result.data) ? failed : { ok: true as const };
  });
