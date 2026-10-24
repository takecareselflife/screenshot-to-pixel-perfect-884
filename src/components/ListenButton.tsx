import { useEffect, useRef, useState } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";
import { streamSpeech } from "@/lib/speech";

type State = "idle" | "loading" | "playing";

/** Only one text plays at a time across the whole app. */
let activeStop: (() => void) | null = null;

export function ListenButton({ text, className = "" }: { text: string; className?: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const stop = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState("idle");
  };

  const play = async () => {
    activeStop?.();
    setError(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    activeStop = () => controller.abort();
    setState("loading");
    try {
      await streamSpeech("/api/speech", text, controller.signal, () => setState("playing"));
    } catch {
      if (!controller.signal.aborted) setError("Couldn't play the audio. Please try again.");
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      if (activeStop && controller.signal.aborted) activeStop = null;
      setState("idle");
    }
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={state === "idle" ? play : stop}
        aria-label={state === "idle" ? "Listen to this text" : "Stop the audio"}
        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-bold text-card-foreground"
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : state === "playing" ? (
          <Square className="h-4 w-4" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
        {state === "loading" ? "Preparing…" : state === "playing" ? "Stop" : "Listen"}
      </button>
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
