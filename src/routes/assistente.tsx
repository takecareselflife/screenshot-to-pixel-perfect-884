import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { answer, type Reply } from "@/lib/assistant";
import { track } from "@/lib/impact";
import { ListenButton } from "@/components/ListenButton";
import { PageTitle, SimBadge } from "@/components/Layout";
import { SpeakButton } from "@/components/SpeakButton";
import { assistantQuestionSchema } from "@/lib/assistant-request";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Health Assistant | Care+" },
      { name: "description", content: "Ask health questions and get simple answers with sources and clear next steps." },
      { property: "og:title", content: "Health Assistant | Care+" },
      { property: "og:description", content: "Health questions answered in plain language, with sources and next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assistente,
});

type Msg = { from: "user" | "bot"; text: string; reply?: Reply };
const suggestions = ["How do I use a condom?", "What is consent?", "I'm feeling anxious", "Someone leaked a photo of me"];

function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Hi! Olá! I'm the Health Assistant. I can explain health topics and point you to where to get help. I don't make diagnoses and I don't replace professionals. Please avoid sharing personal data." },
  ]);
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Spoken words land in the box so the user can fix them before sending. */
  const addSpokenText = (text: string) => {
    setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
    inputRef.current?.focus();
  };
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  const [busy, setBusy] = useState(false);
  const send = async (text: string) => {
    const parsed = assistantQuestionSchema.safeParse({ question: text });
    if (!parsed.success || busy) return;
    text = parsed.data.question;
    const r = answer(text);
    track("assistant_question", r.links[0]?.to ?? "other");
    setInput("");
    // Risk messages answer instantly with hotlines; the AI still follows below.
    setMsgs((m) => [...m, { from: "user", text }, { from: "bot", text: r.risk ? r.text : "Thinking…", reply: { ...r, sources: r.risk ? r.sources : [] } }]);
    setBusy(true);
    const setLast = (t: string, reply?: Reply) => setMsgs((m) => { const c = [...m]; const last = c[c.length - 1]; if (!last) return m; c[c.length - 1] = { ...last, text: t, ...(reply ? { reply } : {}) }; return c; });
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: text }) });
      if (res.status === 400) { setLast("This question could not be validated. Please send a complete question of up to 2,000 characters without conversation history."); return; }
      if (res.status === 503 && (await res.clone().json().catch(() => ({}))).error === "setup") { setLast("The AI assistant is not set up yet. Here is our reviewed answer instead:\n\n" + r.text, r); return; }
      if (res.status === 429) { setLast("Too many questions in a row. Please wait a minute and try again.", r); return; }
      if (!res.ok || !res.body) throw new Error("unavailable");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let out = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        out += dec.decode(value, { stream: true });
        setLast(r.risk ? `${r.text}\n\n${out}` : out);
      }
      if (!out.trim()) throw new Error("empty");
    } catch {
      setLast("The AI assistant could not answer right now. Here is our reviewed answer instead:\n\n" + r.text, r);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle title="Health Assistant" />
      <p className="mb-4 text-sm text-muted-foreground"><SimBadge>AI</SimBadge> Educational information only — not a substitute for professional medical care. No diagnoses or prescriptions. Each question is answered independently; earlier messages are not sent to the AI. Care+ does not store conversations or voice recordings; provider retention is not yet verified. Avoid names, phones or addresses.</p>
      <div className="space-y-3" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl p-3 ${m.from === "user" ? "ml-auto bg-primary text-primary-foreground" : m.reply?.risk ? "bg-accent" : "card-base"}`}>
            <p className="whitespace-pre-line">{m.text.replace(/\*\*/g, "")}</p>
            {m.from === "bot" && <ListenButton text={m.text} className="mt-2" />}
            {m.reply && m.reply.sources.length > 0 && <p className="mt-2 text-xs opacity-80">Sources: {m.reply.sources.join("; ")}</p>}
            {m.reply && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.reply.links.map((l) => <Link key={l.to} to={l.to} className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">{l.label}</Link>)}
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border px-3 py-1 text-sm">{s}</button>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-20 mt-4 flex flex-wrap gap-2">
        <label htmlFor="msg" className="sr-only">Your message</label>
        <input ref={inputRef} id="msg" value={input} maxLength={2000} onChange={(e) => setInput(e.target.value)} placeholder="Write or speak your question…" className="min-w-[55%] flex-1 rounded-full border bg-card px-4 py-3" />
        <SpeakButton onTranscript={addSpokenText} />
        <button aria-label="Send" disabled={busy} className="rounded-full disabled:opacity-50 bg-primary p-3 text-primary-foreground"><Send className="h-5 w-5" /></button>
      </form>
    </div>
  );
}
