import { checkLimit, upstreamSignal } from "@/lib/rate-limit";
import { createFileRoute } from "@tanstack/react-router";

const SPEECH_URL = "https://ai.gateway.lovable.dev/v1/audio/speech";
const SPEECH_MODEL = "google/gemini-3.1-flash-tts-preview";
const SPEECH_VOICE = "Kore";
const MAX_CHARS = 4000;

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: ({ request }) => handleSpeechRequest(request),
    },
  },
});

export async function handleSpeechRequest(request: Request): Promise<Response> {{
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "Voice playback is not configured on the server." }, { status: 500 });
        }

        let text = "";
        try {
          const body = (await request.json()) as { text?: unknown };
          if (typeof body?.text === "string") text = body.text.trim();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        if (!text) return Response.json({ error: "Nothing to read." }, { status: 400 });
        const limit = await checkLimit(request, { scope: "speech", client: 12, global: 200, daily: 300 });
        if (limit === "rate") return Response.json({ error: "Too many Listen requests. Please wait a minute and try again." }, { status: 429, headers: { "Retry-After": "60" } });
        if (limit === "error") return Response.json({ error: "Voice playback isn't available right now." }, { status: 503 });
        if (text.length > MAX_CHARS) text = text.slice(0, MAX_CHARS);

        let upstream: Response;
        try {
          upstream = await fetch(SPEECH_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: SPEECH_MODEL,
              contents: [{ role: "user", parts: [{ text }] }],
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: SPEECH_VOICE } } },
              },
              stream_format: "sse",
            }),
            signal: upstreamSignal(request),
          });
        } catch (e) {
          if (e instanceof DOMException && e.name === "TimeoutError") return Response.json({ error: "Voice service took too long. Please try again." }, { status: 504 });
          if (e instanceof DOMException && e.name === "AbortError") return new Response(null, { status: 499 });
          return Response.json({ error: "Voice service unavailable." }, { status: 502 });
        }

        if (!upstream.ok || !upstream.body) {
          // Never forward provider error bodies (may contain internal details).
          await upstream.body?.cancel().catch(() => {});
          return Response.json({ error: "Voice service unavailable." }, { status: upstream.status === 429 ? 429 : 502, headers: { "Cache-Control": "no-store" } });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store" },
        });
}}
