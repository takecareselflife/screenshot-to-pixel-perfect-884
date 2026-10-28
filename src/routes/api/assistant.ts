import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { articles } from "@/lib/data";
import { needs } from "@/lib/referral";
import { redact } from "@/lib/redact";

const MODEL = "openai/gpt-6-astra";

function instructions() {
  const kb = articles
    .map((a) => `## ${a.title} (/biblioteca/${a.slug})\n${[a.summary, ...a.explain, ...a.practical].join("\n")}\nWarning signs: ${a.warning.join("; ")}\nSources: ${a.sources.join("; ")}`)
    .join("\n\n");
  return `You are the Care+ Health Assistant for adolescents (sexual and reproductive health, well-being, safety).
RULES:
- Reply in the same language the user writes in (Brazilian Portuguese if they write in Portuguese).
- Cover puberty/menstruation, contraception, STIs, consent, relationships, emotional wellbeing and access to care. Say clearly when you are unsure. Never invent sources; the content is a draft not yet clinically validated.
- Never promise confidentiality.
- Answer ONLY from the reviewed knowledge base below. If it doesn't cover the question, say so and suggest a health professional.
- Never diagnose, never prescribe or give medication doses, never say whether someone "has" a condition. For symptoms, say which warning signs need care and refer to a service.
- Short, warm, plain English: 2–5 short sentences or bullets. No judgement.
- If there is risk (self-harm, violence, abuse, immediate danger): first give 190 (police), 192 (SAMU), 188 (CVV, 24h) and recommend the Help page.
- End with one line "Source: <source name>" taken from the knowledge base when you used it.
- Do not ask for names, addresses or other personal data.
- When a service would help, mention the Services page (/servicos). Needs it can match: ${needs.map((n) => n.label).join(", ")}.

KNOWLEDGE BASE:
${kb}`;
}

async function sha256(t: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

const PER_CLIENT_PER_MINUTE = 10;
const GLOBAL_PER_MINUTE = 300;

/**
 * Server-enforced limit stored in the database (atomic counter), so it holds across
 * workers and concurrent requests. The IP is never stored: only a salted hash that
 * changes every day.
 */
async function checkLimit(request: Request): Promise<"ok" | "rate" | "error"> {
  const salt = process.env["RATE_LIMIT_SALT"];
  if (!salt) return "error";
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const bucket = await sha256(`${salt}|${new Date().toISOString().slice(0, 10)}|${ip}`);
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [mine, all] = await Promise.all([
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: bucket, _window_seconds: 60 }),
      supabaseAdmin.rpc("hit_rate_limit", { _bucket: "global", _window_seconds: 60 }),
    ]);
    if (mine.error || all.error) return "error";
    return (mine.data ?? 0) > PER_CLIENT_PER_MINUTE || (all.data ?? 0) > GLOBAL_PER_MINUTE ? "rate" : "ok";
  } catch {
    return "error";
  }
}

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "setup" }, { status: 503 });
        const limit = await checkLimit(request);
        if (limit === "rate") return Response.json({ error: "rate" }, { status: 429, headers: { "Retry-After": "60" } });
        if (limit === "error") return Response.json({ error: "unavailable" }, { status: 503 });
        let messages: { role: "user" | "assistant"; content: string }[] = [];
        try {
          const body = (await request.json()) as { messages?: unknown };
          if (Array.isArray(body.messages)) {
            messages = body.messages
              .filter((m): m is { role: "user" | "assistant"; content: string } =>
                !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
              .slice(-12)
              .map((m) => ({ role: m.role, content: redact(m.content.slice(0, 2000)) }));
          }
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        if (!messages.length) return Response.json({ error: "Empty question." }, { status: 400 });

        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        const result = streamText({
          model: provider.responses(MODEL),
          instructions: instructions(),
          messages,
          abortSignal: request.signal,
          providerOptions: {
            openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
          },
        } as Parameters<typeof streamText>[0]);
        return result.toTextStreamResponse();
      },
    },
  },
});
