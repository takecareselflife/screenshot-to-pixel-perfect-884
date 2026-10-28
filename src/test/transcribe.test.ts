import { afterEach, describe, expect, it, vi } from "vitest";
import { transcribe, transcribeConfig } from "@/lib/transcribe";

afterEach(() => vi.unstubAllGlobals());

describe("voice transcription request", () => {
  it("uses the documented endpoint with one version prefix and streaming", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(""));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["test audio"], "voice.wav", { type: "audio/wav" });
    await transcribe(transcribeConfig("test-key"), file);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://ai.gateway.lovable.dev/v1/audio/transcriptions");
    const body = fetchMock.mock.calls[0]?.[1].body as FormData;
    expect(body.get("model")).toBe("openai/gpt-transcribe");
    expect(body.get("stream")).toBe("true");
  });
});