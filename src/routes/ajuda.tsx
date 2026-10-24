import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone } from "lucide-react";
import { hotlines } from "@/lib/data";
import { ListenButton } from "@/components/ListenButton";
import { PageTitle } from "@/components/Layout";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "I need help | Cuida+" },
      { name: "description", content: "Initial safety guidance and ways to reach human support." },
      { property: "og:title", content: "I need help | Cuida+" },
      { property: "og:description", content: "You are not alone. See ways to get support." },
    ],
  }),
  component: Ajuda,
});

// Demonstration protocols — must be reviewed by professionals before real use.
const situations: { label: string; urgent?: boolean; steps: string[] }[] = [
  { label: "I'm feeling unsafe", steps: ["If you can, go somewhere you feel safer.", "Talk to a trusted adult.", "You can ask a professional to contact you."] },
  { label: "Someone is threatening me", urgent: true, steps: ["If the danger is right now, call 190.", "Avoid being alone with that person.", "Keep the messages if it is safe to do so.", "Disque 100 takes reports."] },
  { label: "I'm experiencing violence online", steps: ["Don't answer blackmail or send anything else.", "Take screenshots if it is safe.", "Block and report on the platform.", "SaferNet Brazil gives guidance on removing content."] },
  { label: "I went through a sexual situation that made me uncomfortable", urgent: true, steps: ["It was not your fault.", "Health services provide care without requiring a police report. Going as soon as possible (ideally within 72 hours) allows preventive care.", "You don't need to tell every detail to ask for help."] },
  { label: "I'm afraid of someone", steps: ["Your fear is valid.", "Tell someone you trust.", "The Child Protection Council can protect you."] },
  { label: "I want to talk to a professional", steps: ["You can go to the nearest health center.", "Or ask someone to contact you."] },
  { label: "I don't know what's happening, but I need help", steps: ["It's fine not to know how to explain it.", "CVV (188) listens 24/7, for free.", "You can ask a professional to contact you."] },
];

function Ajuda() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <PageTitle title="You are not alone" subtitle="Pick the one closest to what you're going through. We don't ask for details or proof." />
      <section className="mb-6 rounded-2xl bg-warm p-4 text-warm-foreground">
        <p className="font-bold">In danger right now?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {hotlines.map((h) => (
            <a key={h.number} href={`tel:${h.number}`} className="flex items-center gap-2 rounded-xl bg-card p-3 text-card-foreground">
              <Phone className="h-4 w-4 text-warm" aria-hidden />
              <span><strong>{h.number}</strong> {h.name}<br /><span className="text-xs text-muted-foreground">{h.desc}</span></span>
            </a>
          ))}
        </div>
        <p className="mt-2 text-xs opacity-90">When you tap, your phone opens the call. The app doesn't place calls for you.</p>
      </section>
      <ul className="space-y-2">
        {situations.map((s, i) => (
          <li key={s.label} className="card-base overflow-hidden">
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="w-full p-4 text-left font-bold">
              {s.label}
            </button>
            {open === i && (
              <div className="border-t bg-muted p-4">
                {s.urgent && <p className="mb-2 text-sm font-bold text-destructive">If there is immediate risk, call 190 or 192.</p>}
                <ListenButton
                  text={`${s.label}. ${s.urgent ? "If there is immediate risk, call 190 or 192. " : ""}${s.steps.join(" ")}`}
                  className="mb-2"
                />
                <ul className="list-disc space-y-1 pl-5">{s.steps.map((x) => <li key={x}>{x}</li>)}</ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/solicitar-apoio" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Ask to be contacted</Link>
                  <Link to="/servicos" className="rounded-full border bg-card px-4 py-2 text-sm font-bold">See services</Link>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
