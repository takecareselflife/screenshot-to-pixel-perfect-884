import { createParser } from "eventsource-parser";

export function decodePCM(pending: Uint8Array, incoming: Uint8Array) {
  const bytes = new Uint8Array(pending.length + incoming.length);
  bytes.set(pending);
  bytes.set(incoming, pending.length);
  const usable = bytes.length - (bytes.length % 2);
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(usable / 2);
  for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
  return { samples, pending: bytes.slice(usable) };
}

/** Coalesce tiny transport deltas instead of creating hundreds of audio nodes. */
export function createSampleQueue(minSamples = 6000) {
  let chunks: Float32Array[] = [];
  let count = 0;
  return (samples: Float32Array, flush = false): Float32Array | null => {
    if (samples.length) { chunks.push(samples); count += samples.length; }
    if (!count || (!flush && count < minSamples)) return null;
    const joined = new Float32Array(count);
    let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.length; }
    chunks = [];
    count = 0;
    return joined;
  };
}

function speechError(raw: string) {
  try {
    const data = JSON.parse(raw) as { message?: string; error?: string | { message?: string } };
    return data.message || (typeof data.error === "string" ? data.error : data.error?.message) || "Audio could not be played.";
  } catch {
    return "Audio could not be played. Please try again later.";
  }
}

/** A short silent WAV, looped through an <audio> element while speech plays. */
function silentWavUrl() {
  const samples = 4000;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const write = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) bytes[offset + i] = s.charCodeAt(i); };
  write(0, "RIFF"); view.setUint32(4, 36 + samples, true); write(8, "WAVE"); write(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true); view.setUint32(28, 8000, true); view.setUint16(32, 1, true); view.setUint16(34, 8, true);
  write(36, "data"); view.setUint32(40, samples, true);
  bytes.fill(128, 44);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/**
 * iPhones mute Web Audio when the ringer switch is on silent. Marking the session as
 * "playback" and keeping a silent media element playing routes speech to the speaker.
 * Must run synchronously inside the tap that started playback.
 */
function unlockMediaPlayback(): () => void {
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
  } catch { /* unsupported */ }
  if (typeof Audio === "undefined") return () => {};
  let element: HTMLAudioElement | null = null;
  try {
    element = new Audio(silentWavUrl());
    element.loop = true;
    element.setAttribute("playsinline", "");
    void element.play()?.catch(() => {});
  } catch { element = null; }
  return () => {
    if (!element) return;
    try { element.pause(); element.removeAttribute("src"); element.load(); } catch { /* ignore */ }
  };
}

/** Streams speech from the app's speech endpoint and plays it as it arrives (24 kHz PCM). */
export async function streamSpeech(
  endpoint: string,
  text: string,
  signal?: AbortSignal,
  onFirstAudio?: () => void,
): Promise<void> {
  signal?.throwIfAborted();
  const releaseMedia = unlockMediaPlayback();
  // Use the device's native rate (fixed 24 kHz contexts are unreliable on some phones);
  // buffers below are tagged 24 kHz and resampled by the browser.
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const context = new AudioCtx();
  // Play a tiny silent buffer inside the tap so the browser unlocks sound output.
  try {
    const unlock = context.createBufferSource();
    unlock.buffer = context.createBuffer(1, 1, 24000);
    unlock.connect(context.destination);
    unlock.start(0);
  } catch { /* ignore */ }
  const sources = new Set<AudioBufferSourceNode>();
  let playhead = 0;
  let pending = new Uint8Array(0);
  let completed = false;
  let samplesPlayed = 0;
  let announced = false;
  const queueSamples = createSampleQueue();
  const playback: Promise<void>[] = [];
  const playbackRate = 0.85;
  const controller = new AbortController();
  const abort = () => {
    controller.abort(signal?.reason);
    for (const source of sources) source.stop();
  };
  signal?.addEventListener("abort", abort, { once: true });
  const schedule = (samples: Float32Array | null) => {
    if (!samples?.length) return;
    signal?.throwIfAborted();
    const buffer = context.createBuffer(1, samples.length, 24000);
    buffer.copyToChannel(new Float32Array(samples), 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(context.destination);
    sources.add(source);
    playback.push(new Promise<void>((resolve) => {
      source.onended = () => { sources.delete(source); resolve(); };
    }));
    playhead = Math.max(playhead, context.currentTime + 0.15);
    source.start(playhead);
    playhead += buffer.duration / playbackRate;
    if (!announced) { announced = true; onFirstAudio?.(); }
  };
  try {
    if (context.state === "suspended") await context.resume();
    signal?.throwIfAborted();
    if (context.state !== "running") throw new Error("Audio is paused by your device. Tap Listen again to enable sound.");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) throw new Error(speechError(await response.text()));
    const parser = createParser({
      onEvent(event) {
        const payload = JSON.parse(event.data) as { type: string; audio?: string; error?: unknown };
        if (payload.type === "error" || payload.type === "denied" || payload.error) throw new Error(speechError(event.data));
        if (payload.type === "speech.audio.done") {
          completed = true;
          return;
        }
        if (payload.type !== "speech.audio.delta") return;
        if (completed || !payload.audio) throw new Error("Invalid speech audio event");
        const decoded = decodePCM(
          pending,
          Uint8Array.from(atob(payload.audio), (c) => c.charCodeAt(0)),
        );
        pending = new Uint8Array(decoded.pending);
        if (!decoded.samples.length) return;
        samplesPlayed += decoded.samples.length;
        schedule(queueSamples(decoded.samples));
      },
    });
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        parser.feed(next.value);
      }
      parser.reset({ consume: true });
    } finally {
      reader.releaseLock();
    }
    if (!completed || !samplesPlayed || pending.length) throw new Error("Incomplete speech stream");
    schedule(queueSamples(new Float32Array(0), true));
    await Promise.all(playback);
    signal?.throwIfAborted();
  } finally {
    signal?.removeEventListener("abort", abort);
    controller.abort();
    for (const source of sources) source.stop();
    await context.close();
  }
}
