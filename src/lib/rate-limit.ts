/**
 * Server-enforced limits stored in the database (atomic counter), so they hold across
 * workers and concurrent requests. The IP is never stored: only a salted hash that
 * changes every day, so the same connection cannot be tracked between days.
 */
async function sha256(t: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

const PER_CLIENT_PER_MINUTE = 10;
const GLOBAL_PER_MINUTE = 300;
/** Maximum paid calls per service per rolling day for the whole app (pilot budget). */
export const DAILY_BUDGET: Record<string, number> = { assistant: 3000, voice: 1000, speech: 2000 };
export const TOTAL_DAILY_BUDGET = 5000;
/** Upstream AI calls are aborted after this long so a stalled provider cannot hold workers open. */
export const UPSTREAM_TIMEOUT_MS = 45_000;
export const upstreamSignal = (request: Request) =>
  AbortSignal.any([request.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]);

export async function checkLimit(
  request: Request,
  options: { scope: string; client?: number; global?: number; daily?: number } = { scope: "assistant" },
): Promise<"ok" | "rate" | "error"> {
  // Emergency stop: setting PAID_AI_DISABLED=1 on the server pauses every paid AI call (fail closed).
  if (process.env["PAID_AI_DISABLED"] === "1") return "error";
  const salt = process.env["RATE_LIMIT_SALT"];
  if (!salt) return "error";
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const bucket = await sha256(`${salt}|${day}|${options.scope}|${ip}`);
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const budget = DAILY_BUDGET[options.scope] ?? 500;
    const [mine, all, day24, scopeDay, totalDay] = await Promise.all([
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: bucket, _window_seconds: 60 }),
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: "global", _window_seconds: 60 }),
      options.daily
        ? supabaseAdmin.rpc("hit_rate_limit", { _bucket: `${bucket}:day`, _window_seconds: 86400 })
        : Promise.resolve({ data: 0, error: null }),
      // App-wide daily budgets do not depend on IP, so they cap spending even if per-client limits are evaded.
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: `budget:${options.scope}:day`, _window_seconds: 86400 }),
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: "budget:all:day", _window_seconds: 86400 }),
    ]);
    if (mine.error || all.error || day24.error || scopeDay.error || totalDay.error) return "error";
    // Budget exhausted: pause the service (503) rather than ask one person to wait.
    if ((scopeDay.data ?? 0) > budget || (totalDay.data ?? 0) > TOTAL_DAILY_BUDGET) return "error";
    if (options.daily && (day24.data ?? 0) > options.daily) return "rate";
    const client = options.client ?? PER_CLIENT_PER_MINUTE;
    const global = options.global ?? GLOBAL_PER_MINUTE;
    return (mine.data ?? 0) > client || (all.data ?? 0) > global ? "rate" : "ok";
  } catch {
    return "error";
  }
}
