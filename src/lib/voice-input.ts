/**
 * Voice input for the assistant: record with the browser's microphone, send the audio to
 * our own endpoint, and get the words back as text. The audio is never stored on the
 * device, and the transcript only appears in the question box for the user to review.
 */
import { createParser } from "eventsource-parser";

/** A voice note longer than this is stopped automatically. */
export const MAX_RECORD_SECONDS = 30;
export const MAX_AUDIO_BYTES = 4_000_000;

export const RECORD_MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

/** Prefer the best container this browser can actually encode. */
export function pickRecordingMime(isSupported: (type: string) => boolean): string | undefined {
  return RECORD_MIME_CANDIDATES.find((type) => isSupported(type));
}

/**
 * Transcription models answer with a placeholder when the recording held no speech.
 * Returning "" lets the caller ask for a retry instead of sending noise to the assistant.
 */
export function cleanTranscript(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "";
  const bare = text.replace(/^[[(]\s*|\s*[\])]\s*$/g, "").toLowerCase();
  if (["silence", "no speech", "no speech detected", "inaudible", "music", "applause", "static"].includes(bare)) return "";
  return text;
}

function micError(cause: unknown): string {
  const name = cause instanceof DOMException ? cause.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone access was blocked. Allow it in your browser settings, or type your question instead.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "We couldn't find a microphone on this device. You can type your question instead.";
  if (name === "NotReadableError") return "Your microphone is being used by another app. Close it and try again.";
  return "The microphone could not be started. Please try again or type your question.";
}

export type Recorder = {
  mime: string;
  elapsedSeconds: () => number;
  stop: () => Promise<File>;
  cancel: () => void;
};

/** Complete mono PCM WAV, including its container header (also works on iOS). */
export function encodeWav(chunks: readonly Float32Array[], sampleRate: number): Blob {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new ArrayBuffer(44 + length * 2);
  const view = new DataView(bytes);
  const tag = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  tag(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  tag(36, "data");
  view.setUint32(40, length * 2, true);
  let offset = 44;
  for (const chunk of chunks) for (const value of chunk) {
    const sample = Math.max(-1, Math.min(1, value));
    view.setInt16(offset, sample * (sample < 0 ? 32768 : 32767), true);
    offset += 2;
  }
  return new Blob([bytes], { type: "audio/wav" });
}

function setAudioSession(type: "play-and-record" | "auto") {
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = type;
  } catch { /* unsupported */ }
}

/** Ask for the microphone and start recording. Rejects with a message safe to show. */
export async function startRecording(): Promise<Recorder> {
  if (typeof AudioContext === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Voice input isn't available on this device or browser. You can still type your question.");
  }
  // Read-aloud switches iPhones to a "playback" audio session, which silences the microphone.
  // Switch to recording mode synchronously inside the tap, before asking for the mic.
  setAudioSession("play-and-record");
  // Resume inside the tap before awaiting microphone permission (iOS activation).
  const context = new AudioContext();
  const resume = context.resume();
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (cause) {
    await context.close();
    setAudioSession("auto");
    throw new Error(micError(cause));
  }
  try {
    await resume;
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    await context.close();
    setAudioSession("auto");
    throw new Error("Voice input isn't available on this browser. You can still type your question.");
  }
  const source = context.createMediaStreamSource(stream);
  const node = context.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  const maxSamples = Math.floor(Math.min(MAX_RECORD_SECONDS * context.sampleRate, (MAX_AUDIO_BYTES - 44) / 2));
  let samples = 0;
  let peak = 0;
  node.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    const remaining = maxSamples - samples;
    if (remaining > 0) {
      const copy = new Float32Array(input.subarray(0, remaining));
      chunks.push(copy);
      for (const v of copy) { const a = Math.abs(v); if (a > peak) peak = a; }
      samples += copy.length;
    }
  };
  source.connect(node);
  node.connect(context.destination);
  const startedAt = Date.now();
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    stream.getTracks().forEach((track) => track.stop());
    node.onaudioprocess = null;
    node.disconnect();
    source.disconnect();
    void context.close();
    setAudioSession("auto");
  };
  const autoRelease = window.setTimeout(release, MAX_RECORD_SECONDS * 1000);

  return {
    mime: "audio/wav",
    elapsedSeconds: () => Math.floor((Date.now() - startedAt) / 1000),
    async stop() {
      window.clearTimeout(autoRelease);
      release();
      const blob = encodeWav(chunks, context.sampleRate);
      chunks.length = 0;
      if (blob.size < 2048) throw new Error("The recording was too short. Please tap the microphone and speak again.");
      if (peak < 0.0005) throw new Error("Your microphone didn't send any sound. Check that it isn't muted or used by another app, then try again.");
      return new File([blob], "voice-note.wav", { type: "audio/wav" });
    },
    cancel() {
      window.clearTimeout(autoRelease);
      release();
      chunks.length = 0;
    },
  };
}

async function voiceError(response: Response): Promise<string> {
  const raw = await response.text().catch(() => "");
  let message = "";
  try {
    const data = JSON.parse(raw) as { message?: string; error?: string | { message?: string } };
    message = data.message || (typeof data.error === "string" ? data.error : data.error?.message) || "";
  } catch {
    /* not JSON: fall back to the status below */
  }
  if (message) return message;
  if (response.status === 429) return "Too many voice messages in a row. Please wait a minute and try again.";
  if (response.status === 413) return "That message was too long. Please keep it under 30 seconds.";
  if (response.status === 503) return "Voice input isn't available right now. You can still type your question.";
  return message || "The voice message couldn't be understood. Please try again or type your question.";
}

/** Upload a recording and return the recognized text, streaming partial words as they arrive. */
export async function transcribeRecording(
  file: File,
  signal: AbortSignal,
  onPartial?: (text: string) => void,
): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);
  const response = await fetch("/api/transcribe", { method: "POST", body: form, signal });
  if (!response.ok) throw new Error(await voiceError(response));
  if (!response.body) throw new Error("Voice input isn't available right now. You can still type your question.");

  let partial = "";
  let final = "";
  let completed = false;
  const parser = createParser({
    onEvent(event) {
      let payload: { type?: string; delta?: string; text?: string; error?: unknown };
      try {
        payload = JSON.parse(event.data) as typeof payload;
      } catch {
        return;
      }
      if (payload.error) {
        const error = payload.error as { message?: string };
        throw new Error(typeof payload.error === "string" ? payload.error : error.message || "The voice message couldn't be understood. You can type your question instead.");
      }
      if (payload.type === "transcript.text.delta" && typeof payload.delta === "string") {
        partial += payload.delta;
        onPartial?.(cleanTranscript(partial));
      } else if (payload.type === "transcript.text.done" && typeof payload.text === "string") {
        final = payload.text;
        completed = true;
      }
    },
  });

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      parser.feed(next.value);
    }
    parser.reset({ consume: true });
  } finally {
    reader.releaseLock();
  }

  if (!completed) throw new Error("The voice message was interrupted. Please record again or type your question.");
  const text = cleanTranscript(final);
  if (!text) throw new Error("I couldn't understand that recording. Please try again, speaking a little closer to the microphone.");
  return text;
}
