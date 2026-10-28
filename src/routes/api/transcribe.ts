import { createFileRoute } from "@tanstack/react-router";
import { checkLimit } from "@/lib/rate-limit";
import { transcribe, transcribeConfig, TRANSCRIBE_MAX_BYTES } from "@/lib/transcribe";

/** Multipart framing adds overhead on top of the audio itself. */
const MAX_BODY_BYTES = TRANSCRIBE_MAX_BYTES + 256 * 1024;

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "Voice input isn't set up yet. You can still type your question." }, { status: 503 });

        // Bound the upload before request.formData() buffers it.
        const declared = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
          return Response.json({ error: "That message was too long. Please keep it under 30 seconds." }, { status: 413 });
        }

        const limit = await checkLimit(request, { scope: "voice", client: 8, global: 200, daily: 120 });
        if (limit === "rate") {
          return Response.json({ error: "Too many voice messages in a row. Please wait a minute and try again." }, { status: 429, headers: { "Retry-After": "60" } });
        }
        if (limit === "error") return Response.json({ error: "Voice input isn't available right now. You can still type your question." }, { status: 503 });

        let file: File | null = null;
        try {
          // Enforce actual bytes as well as Content-Length, including chunked uploads.
          const reader = request.body?.getReader();
          if (!reader) return Response.json({ error: "No audio was recorded." }, { status: 400 });
          const chunks: Uint8Array[] = [];
          let bytes = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > MAX_BODY_BYTES) {
              await reader.cancel();
              return Response.json({ error: "That message was too long. Please keep it under 30 seconds." }, { status: 413 });
            }
            chunks.push(value);
          }
          const body = new Uint8Array(bytes);
          let offset = 0;
          for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
          const form = await new Response(body, { headers: { "Content-Type": request.headers.get("Content-Type") ?? "" } }).formData();
          const entry = form.get("file");
          if (entry instanceof File) file = entry;
        } catch {
          return Response.json({ error: "Invalid voice message. Please try again." }, { status: 400 });
        }
        if (!file || !file.size) return Response.json({ error: "No audio was recorded. Please tap the microphone and speak again." }, { status: 400 });
        if (file.size > TRANSCRIBE_MAX_BYTES) {
          return Response.json({ error: "That message was too long. Please keep it under 30 seconds." }, { status: 413 });
        }

        let upstream: Response;
        try {
          upstream = await transcribe(transcribeConfig(apiKey), file, { signal: request.signal });
        } catch (cause) {
          if (cause instanceof DOMException && cause.name === "AbortError") return new Response(null, { status: 499 });
          return Response.json({ error: "The voice message couldn't be processed." }, { status: 400 });
        }
        if (!upstream.ok || !upstream.body) {
          // Never forward provider error bodies (may contain internal details).
          await upstream.body?.cancel().catch(() => {});
          return Response.json({ error: "The voice message couldn't be understood. Please try again or type your question." }, { status: upstream.status === 429 ? 429 : 502 });
        }
        // Pass the upstream status, content type and body through unchanged.
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
