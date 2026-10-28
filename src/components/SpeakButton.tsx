import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { MAX_RECORD_SECONDS, startRecording, transcribeRecording, type Recorder } from "@/lib/voice-input";
import { Button } from "@/components/ui/button";

type State = "idle" | "starting" | "recording" | "working";

/**
 * Speak instead of type: records a short voice note, turns it into text and hands the text
 * back so the user can check it before sending. The microphone is released as soon as the
 * recording stops.
 */
export function SpeakButton({ onTranscript, className = "" }: { onTranscript: (text: string) => void; className?: string }) {
  const [state, setState] = useState<State>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<Recorder | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      recorderRef.current?.cancel();
      recorderRef.current = null;
      controllerRef.current?.abort();
      controllerRef.current = null;
    },
    [],
  );

  const finish = () => {
    recorderRef.current = null;
    controllerRef.current = null;
    setState("idle");
    setSeconds(0);
  };

  const stop = async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    setState("working");
    let file: File;
    try {
      file = await recorder.stop();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      if (message !== "cancelled") setError(message || "The microphone stopped working. Please try again.");
      finish();
      return;
    }
    recorderRef.current = null;
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const text = await transcribeRecording(file, controller.signal);
      onTranscript(text);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : "The voice message couldn't be understood. Please try again.");
      }
    } finally {
      finish();
    }
  };

  const start = async () => {
    setError(null);
    setState("starting");
    try {
      const recorder = await startRecording();
      recorderRef.current = recorder;
      setState("recording");
      setSeconds(0);
      const timer = window.setInterval(() => {
        const elapsed = recorder.elapsedSeconds();
        setSeconds(elapsed);
        if (elapsed >= MAX_RECORD_SECONDS) void stop();
      }, 500);
      // Clear the interval when this recording is replaced or the page unmounts.
      window.setTimeout(() => window.clearInterval(timer), (MAX_RECORD_SECONDS + 2) * 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The microphone could not be started. Please try again.");
      setState("idle");
    }
  };

  const status =
    state === "starting"
      ? "Allow the microphone, then speak your question."
      : state === "recording"
        ? `Recording… ${MAX_RECORD_SECONDS - seconds} seconds left. Tap Stop when you finish.`
        : state === "working"
          ? "Turning your voice into text…"
          : "Tap the microphone to speak your question instead of typing.";

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={state === "recording" ? stop : state === "idle" ? start : undefined}
        disabled={state === "starting" || state === "working"}
        aria-label={state === "recording" ? "Stop recording" : "Speak your question"}
        aria-pressed={state === "recording"}
        className={`min-h-11 gap-1.5 rounded-full px-4 text-sm font-bold ${
          state === "recording" ? "border-destructive bg-destructive text-destructive-foreground" : "bg-card text-card-foreground"
        }`}
      >
        {state === "working" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : state === "recording" ? (
          <Square className="h-4 w-4" aria-hidden />
        ) : (
          <Mic className="h-4 w-4" aria-hidden />
        )}
        {state === "starting" ? "Allow mic…" : state === "recording" ? `Stop · ${seconds}s` : state === "working" ? "Listening…" : "Speak"}
      </Button>
      <span role="status" className="sr-only">
        {status}
      </span>
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
