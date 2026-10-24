import { useEffect } from "react";
import { X } from "lucide-react";
import type { Guide } from "@/lib/guides";

/** Full-screen viewer for an illustrated guide. */
export function GuideViewer({ guide, onClose }: { guide: Guide | null; onClose: () => void }) {
  useEffect(() => {
    if (!guide) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [guide, onClose]);

  if (!guide) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={guide.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-auto rounded-2xl bg-card p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-card-foreground">{guide.title}</h2>
          <button autoFocus onClick={onClose} aria-label="Close guide" className="rounded-full bg-muted p-2">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <img src={guide.src} alt={guide.alt} className="w-full rounded-xl" />
        <p className="mt-2 text-xs text-muted-foreground">
          Educational illustration. Content to be reviewed by professionals before real use.
        </p>
      </div>
    </div>
  );
}
