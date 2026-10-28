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

/** Ask for the microphone and start recording. Rejects with a message safe to show. */
export async function startRecording(): Promise<Recorder> {
  if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Voice input isn't available on this device or browser. You can still type your question.");
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (cause) {
    throw new Error(micError(cause));
  }

  const mime =
    pickRecordingMime((type) => {
      try {
        return MediaRecorder.isTypeSupported(type);
      } catch {
        return false;
      }
    }) ?? "";
  let recorder: MediaRecorder;
  try {
    recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error("Voice input isn't available on this browser. You can still type your question.");
  }

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };
  const startedAt = Date.now();
  let released = false;
  let cancelled = false;
  const release = () => {
    if (released) return;
    released = true;
    stream.getTracks().forEach((track) => track.stop());
  };

  try {
    recorder.start();
  } catch {
    release();
    throw new Error("The microphone could not be started. Please try again or type your question.");
  }

  return {
    mime: mime || recorder.mimeType || "audio/webm",
    elapsedSeconds: () => Math.floor((Date.now() - startedAt) / 1000),
    stop() {
      const done = new Promise<File>((resolve, reject) => {
        recorder.onstop = () => {
          release();
          if (cancelled) {
            reject(new Error("cancelled"));
            return;
          }
          const type = mime || recorder.mimeType || "audio/webm";
          const blob = new Blob(chunks, { type });
          if (blob.size < 2000) {
            reject(new Error("The recording was too short. Please tap the microphone and speak again."));
            return;
          }
          if (blob.size > MAX_AUDIO_BYTES) {
            reject(new Error("Your message was too long. Please keep it under 30 seconds."));
            return;
          }
          resolve(new File([blob], "voice-note", { type }));
        };
        recorder.onerror = () => {
          release();
          reject(new Error("The microphone stopped working. Please try again."));
        };
      });
      try {
        recorder.stop();
      } catch {
        release();
        throw new Error("The microphone stopped working. Please try again.");
      }
      return done;
    },
    cancel() {
      cancelled = true;
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {
        /* the microphone is released below anyway */
      }
      release();
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
  const parser = createParser({
    onEvent(event) {
      let payload: { type?: string; delta?: string; text?: string; error?: unknown };
      try {
        payload = JSON.parse(event.data) as typeof payload;
      } catch {
        return;
      }
      if (payload.error) throw new Error("The voice message couldn't be understood. Please try again or type your question.");
      if (payload.type === "transcript.text.delta" && typeof payload.delta === "string") {
        partial += payload.delta;
        onPartial?.(cleanTranscript(partial));
      } else if (payload.type === "transcript.text.done" && typeof payload.text === "string") {
        final = payload.text;
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

  const text = cleanTranscript(final || partial);
  if (!text) throw new Error("I couldn't understand that recording. Please try again, speaking a little closer to the microphone.");
  return text;
}
