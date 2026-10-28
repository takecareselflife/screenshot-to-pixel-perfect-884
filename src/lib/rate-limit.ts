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

export async function checkLimit(
  request: Request,
  options: { scope: string; client?: number; global?: number; daily?: number } = { scope: "assistant" },
): Promise<"ok" | "rate" | "error"> {
  const salt = process.env["RATE_LIMIT_SALT"];
  if (!salt) return "error";
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const bucket = await sha256(`${salt}|${day}|${options.scope}|${ip}`);
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [mine, all, day24] = await Promise.all([
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: bucket, _window_seconds: 60 }),
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: "global", _window_seconds: 60 }),
      options.daily
        ? supabaseAdmin.rpc("hit_rate_limit", { _bucket: `${bucket}:day`, _window_seconds: 86400 })
        : Promise.resolve({ data: 0, error: null }),
    ]);
    if (mine.error || all.error || day24.error) return "error";
    if (options.daily && (day24.data ?? 0) > options.daily) return "rate";
    const client = options.client ?? PER_CLIENT_PER_MINUTE;
    const global = options.global ?? GLOBAL_PER_MINUTE;
    return (mine.data ?? 0) > client || (all.data ?? 0) > global ? "rate" : "ok";
  } catch {
    return "error";
  }
}
