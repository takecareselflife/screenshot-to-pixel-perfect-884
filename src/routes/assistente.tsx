import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { answer, type Reply } from "@/lib/assistant";
import { PageTitle, SimBadge } from "@/components/Layout";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente de Saúde | Cuida+" },
      { name: "description", content: "Tire dúvidas sobre saúde com respostas simples e fontes." },
      { property: "og:title", content: "Assistente de Saúde | Cuida+" },
      { property: "og:description", content: "Dúvidas sobre saúde respondidas com linguagem simples." },
    ],
  }),
  component: Assistente,
});

type Msg = { from: "user" | "bot"; text: string; reply?: Reply };
const suggestions = ["Como usar camisinha?", "O que é consentimento?", "Estou com ansiedade", "Vazaram uma foto minha"];

function Assistente() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Oi! Sou o Assistente de Saúde. Posso explicar temas de saúde e indicar onde buscar ajuda. Não faço diagnósticos e não substituo profissionais. Evite compartilhar dados pessoais." },
  ]);
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const r = answer(text);
    setMsgs((m) => [...m, { from: "user", text }, { from: "bot", text: r.text, reply: r }]);
    setInput("");
  };

  return (
    <div>
      <PageTitle title="Assistente de Saúde" />
      <p className="mb-4 text-sm text-muted-foreground"><SimBadge>Demonstrativo</SimBadge> Respostas vêm de uma base local. A conversa não é salva.</p>
      <div className="space-y-3" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl p-3 ${m.from === "user" ? "ml-auto bg-primary text-primary-foreground" : m.reply?.risk ? "bg-accent" : "card-base"}`}>
            <p>{m.text}</p>
            {m.reply && m.reply.sources.length > 0 && <p className="mt-2 text-xs opacity-80">Fontes: {m.reply.sources.join("; ")}</p>}
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
        <label htmlFor="msg" className="sr-only">Sua mensagem</label>
        <input id="msg" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escreva sua dúvida…" className="flex-1 rounded-full border bg-card px-4 py-3" />
        <button aria-label="Enviar" className="rounded-full bg-primary p-3 text-primary-foreground"><Send className="h-5 w-5" /></button>
      </form>
    </div>
  );
}
