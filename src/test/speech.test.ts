import { describe, expect, it, vi, afterEach } from "vitest";
import { createSampleQueue, decodePCM, streamSpeech } from "@/lib/speech";

afterEach(() => vi.unstubAllGlobals());

describe("Speech playback", () => {
  it("carries a split PCM sample into the next delta", () => {
    const first = decodePCM(new Uint8Array(0), new Uint8Array([0, 128, 255]));
    const next = decodePCM(first.pending, new Uint8Array([127]));
    expect(first.samples[0]).toBe(-1);
    expect(next.samples[0]).toBe(32767 / 32768);
    expect(next.pending.length).toBe(0);
  });

  it("combines tiny deltas without dropping the final samples", () => {
    const queue = createSampleQueue(4);
    expect(queue(new Float32Array([1, 2]))).toBeNull();
    expect(Array.from(queue(new Float32Array([3, 4])) ?? [])).toEqual([1, 2, 3, 4]);
    expect(queue(new Float32Array([5]))).toBeNull();
    expect(Array.from(queue(new Float32Array(0), true) ?? [])).toEqual([5]);
  });

  it("waits for every audio segment, not just the final one", async () => {
    const sources: { onended?: () => void; start: () => void; stop: () => void; playbackRate: { value: number } }[] = [];
    const close = vi.fn();
    vi.stubGlobal("AudioContext", class {
      state = "running";
      currentTime = 0;
      destination = {};
      close = close;
      createBuffer(_channels: number, length: number) { return { duration: length / 24000, copyToChannel: () => {} }; }
      createBufferSource() {
        const source = { connect: () => {}, start: () => {}, stop: () => {}, playbackRate: { value: 1 } };
        sources.push(source);
        return source;
      }
    });
    const audio = btoa(String.fromCharCode(...new Uint8Array(12000)));
    const data = [
      { type: "speech.audio.delta", audio },
      { type: "speech.audio.delta", audio },
      { type: "speech.audio.done" },
    ].map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(data)));
    const result = streamSpeech("/api/speech", "Welcome.");
    // sources[0] is the silent unlock blip played inside the tap.
    await vi.waitFor(() => expect(sources).toHaveLength(3));
    sources[2]?.onended?.();
    await Promise.resolve();
    expect(close).not.toHaveBeenCalled();
    sources[1]?.onended?.();
    await result;
    expect(close).toHaveBeenCalledOnce();
    expect(sources[1]?.playbackRate.value).toBe(0.85);
  });
});