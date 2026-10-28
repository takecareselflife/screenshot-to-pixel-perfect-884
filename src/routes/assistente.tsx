import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon } from "lucide-react";
import { answer, type Reply } from "@/lib/assistant";
import { track } from "@/lib/impact";
import { guides, guideById, type Guide } from "@/lib/guides";
import { GuideViewer } from "@/components/GuideViewer";
import { ListenButton } from "@/components/ListenButton";
import { PageTitle, SimBadge } from "@/components/Layout";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Health Assistant | Care+" },
      { name: "description", content: "Ask health questions and get simple answers, sources and illustrated guides." },
      { property: "og:title", content: "Health Assistant | Care+" },
      { property: "og:description", content: "Health questions answered in plain language, with illustrated guides." },
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
  const [openGuide, setOpenGuide] = useState<Guide | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  const [busy, setBusy] = useState(false);
  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const r = answer(text);
    track("assistant_question", r.links[0]?.to ?? "other");
    const history = [...msgs.slice(1), { from: "user" as const, text }].map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
    setInput("");
    // Risk messages answer instantly with hotlines; the AI still follows below.
    setMsgs((m) => [...m, { from: "user", text }, { from: "bot", text: r.risk ? r.text : "Thinking…", reply: { ...r, sources: r.risk ? r.sources : [] } }]);
    setBusy(true);
    const setLast = (t: string, reply?: Reply) => setMsgs((m) => { const c = [...m]; c[c.length - 1] = { ...c[c.length - 1]!, text: t, ...(reply ? { reply } : {}) }; return c; });
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
      if (res.status === 503) { setLast("The AI assistant is not set up yet. Here is our reviewed answer instead:\n\n" + r.text, r); return; }
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
      <p className="mb-4 text-sm text-muted-foreground"><SimBadge>AI</SimBadge> Educational information only — not a substitute for professional medical care. No diagnoses or prescriptions. Ask in English or Portuguese. Conversations are not saved; avoid names, phones or addresses.</p>
      <div className="space-y-3" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl p-3 ${m.from === "user" ? "ml-auto bg-primary text-primary-foreground" : m.reply?.risk ? "bg-accent" : "card-base"}`}>
            <p className="whitespace-pre-line">{m.text.replace(/\*\*/g, "")}</p>
            {m.from === "bot" && <ListenButton text={m.text} className="mt-2" />}
            {m.reply && m.reply.sources.length > 0 && <p className="mt-2 text-xs opacity-80">Sources: {m.reply.sources.join("; ")}</p>}
            {m.reply?.guide && guideById(m.reply.guide) && (
              <button onClick={() => setOpenGuide(guideById(m.reply!.guide)!)} className="mt-2 flex items-center gap-2 rounded-full bg-warm px-3 py-1 text-sm font-bold text-warm-foreground">
                <ImageIcon className="h-4 w-4" aria-hidden /> Open the {guideById(m.reply.guide)!.title.toLowerCase()}
              </button>
            )}
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
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-20 mt-4 flex gap-2">
        <label htmlFor="msg" className="sr-only">Your message</label>
        <input id="msg" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write your question…" className="flex-1 rounded-full border bg-card px-4 py-3" />
        <button aria-label="Send" disabled={busy} className="rounded-full disabled:opacity-50 bg-primary p-3 text-primary-foreground"><Send className="h-5 w-5" /></button>
      </form>

      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold">Illustrated guides</h2>
        <p className="mb-3 text-sm text-muted-foreground">Tap a card to see the full drawing. You can also zoom in with two fingers.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {guides.map((g) => (
            <li key={g.id}>
              <button onClick={() => setOpenGuide(g)} className="card-base w-full overflow-hidden p-0 text-left">
                <img src={g.src} alt="" className="h-32 w-full object-cover object-top" />
                <span className="block p-3">
                  <span className="block font-bold">{g.title}</span>
                  <span className="block text-sm text-muted-foreground">{g.blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <GuideViewer guide={openGuide} onClose={() => setOpenGuide(null)} />
    </div>
  );
}
