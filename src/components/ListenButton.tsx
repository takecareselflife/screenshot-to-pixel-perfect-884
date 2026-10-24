import { useEffect, useRef, useState } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";
import { streamSpeech } from "@/lib/speech";
import { Button } from "@/components/ui/button";

type State = "idle" | "loading" | "playing";

/** Only one text plays at a time across the whole app. */
let activeController: AbortController | null = null;

export function ListenButton({ text, className = "" }: { text: string; className?: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    const controller = controllerRef.current;
    controller?.abort();
    if (activeController === controller) activeController = null;
    controllerRef.current = null;
  }, []);

  const stop = () => {
    if (activeController === controllerRef.current) activeController = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState("idle");
  };

  const play = async () => {
    activeController?.abort();
    setError(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    activeController = controller;
    setState("loading");
    try {
      await streamSpeech("/api/speech", text, controller.signal, () => {
        if (controllerRef.current === controller && !controller.signal.aborted) setState("playing");
      });
    } catch (cause) {
      if (!controller.signal.aborted && controllerRef.current === controller) {
        setError(cause instanceof Error ? cause.message : "Couldn't play the audio. Please try again later.");
      }
    } finally {
      if (activeController === controller) activeController = null;
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setState("idle");
      }
    }
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        type="button"
        onClick={state === "idle" ? play : stop}
        aria-label={state === "idle" ? "Listen to this text" : "Stop the audio"}
        className="min-h-11 gap-1.5 rounded-full bg-card px-4 text-sm font-bold text-card-foreground"
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : state === "playing" ? (
          <Square className="h-4 w-4" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
        {state === "loading" ? "Preparing…" : state === "playing" ? "Stop" : "Listen"}
      </Button>
      {error && (
        <span role="alert" className="text-sm text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
