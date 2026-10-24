import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { questionnaires, scale, hotlines } from "@/lib/data";
import { PageTitle, SimBadge } from "@/components/Layout";

export const Route = createFileRoute("/bem-estar")({
  head: () => ({
    meta: [
      { title: "Bem-estar emocional | Cuida+" },
      { name: "description", content: "Perguntas voluntárias para refletir sobre humor, sono, estresse e segurança." },
      { property: "og:title", content: "Bem-estar emocional | Cuida+" },
      { property: "og:description", content: "Um espaço para refletir sobre como você está." },
    ],
  }),
  component: BemEstar,
});

/** Respostas ficam só na memória da página: nada é salvo ou enviado. */
function BemEstar() {
  const [active, setActive] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, (number | null)[]>>({});
  const [done, setDone] = useState(false);
  const q = questionnaires.find((x) => x.id === active);

  if (!q) {
    return (
      <div>
        <PageTitle title="Como você está?" subtitle="Responder é opcional. Você pode pular qualquer pergunta ou parar quando quiser." />
        <p className="mb-4 rounded-xl bg-muted p-3 text-sm">
          <SimBadge>Demonstração</SimBadge> Estas perguntas são para autorreflexão e <strong>não são um teste clínico nem dão diagnóstico</strong>. Suas respostas não são salvas nem enviadas.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {questionnaires.map((x) => (
            <li key={x.id}>
              <button onClick={() => { setActive(x.id); setDone(false); }} className="card-base w-full p-4 text-left">
                <h2 className="text-lg font-semibold">{x.title}</h2>
                <p className="text-sm text-muted-foreground">{x.questions.length} perguntas · cerca de 1 min</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const a = answers[q.id] ?? q.questions.map(() => null);
  const set = (i: number, v: number | null) => setAnswers({ ...answers, [q.id]: a.map((x, j) => (j === i ? v : x)) });
  const score = a.reduce<number>((s, v) => s + (v ?? 0), 0);
  const high = score >= q.questions.length * 2;
  const safetyFlag = q.id === "relacoes" && ((a[1] ?? 0) >= 2 || (a[2] ?? 0) >= 2);

  if (done) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Obrigado por compartilhar</h1>
        <p>{high ? "Parece que as coisas estão pesadas para você. Isso merece cuidado, e você não precisa passar por isso sozinho(a)." : "Que bom que você parou para olhar para si. Continue se cuidando."}</p>
        <p className="text-sm text-muted-foreground">Isto não é um diagnóstico. Só um profissional pode fazer uma avaliação.</p>
        {(high || safetyFlag) && (
          <div className="rounded-2xl bg-accent p-4">
            <p className="font-bold">Caminhos de apoio</p>
            <ul className="mt-2 space-y-1">
              {hotlines.filter((h) => h.number === "188" || safetyFlag).map((h) => (
                <li key={h.number}><a href={`tel:${h.number}`} className="underline">{h.name} – {h.number}</a> · {h.desc}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Link to="/solicitar-apoio" className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground">Quero falar com alguém</Link>
          <Link to="/servicos" className="rounded-full border px-4 py-2 font-bold">Ver serviços</Link>
          <button onClick={() => setActive(null)} className="rounded-full border px-4 py-2 font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setActive(null)} className="mb-4 text-sm text-primary">← Voltar</button>
      <PageTitle title={q.title} subtitle="Pense nas últimas duas semanas." />
      <ol className="space-y-5">
        {q.questions.map((text, i) => (
          <li key={text} className="card-base p-4">
            <fieldset>
              <legend className="mb-3 font-bold">{text}</legend>
              <div className="flex flex-wrap gap-2">
                {scale.map((s, v) => (
                  <button key={s} aria-pressed={a[i] === v} onClick={() => set(i, v)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${a[i] === v ? "bg-primary text-primary-foreground" : ""}`}>{s}</button>
                ))}
                <button onClick={() => set(i, null)} className="px-3 py-1.5 text-sm text-muted-foreground underline">Prefiro não responder</button>
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <button onClick={() => setDone(true)} className="mt-6 w-full rounded-full bg-primary py-3 font-bold text-primary-foreground">Ver reflexão</button>
    </div>
  );
}
