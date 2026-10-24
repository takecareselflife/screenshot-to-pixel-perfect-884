import { createFileRoute } from "@tanstack/react-router";

const SPEECH_URL = "https://ai.gateway.lovable.dev/v1/audio/speech";
const SPEECH_MODEL = "google/gemini-3.1-flash-tts-preview";
const SPEECH_VOICE = "Kore";
const MAX_CHARS = 4000;

export const Route = createFileRoute("/api/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
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
            signal: request.signal,
          });
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return new Response(null, { status: 499 });
          return Response.json({ error: "Voice service unavailable." }, { status: 502 });
        }

        if (!upstream.ok || !upstream.body) {
          const message = await upstream.text().catch(() => "");
          return new Response(message || "Voice service unavailable.", {
            status: upstream.status || 502,
            headers: { "Cache-Control": "no-cache" },
          });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
