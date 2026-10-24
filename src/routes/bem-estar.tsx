import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { questionnaires, scale, hotlines } from "@/lib/data";
import { ListenButton } from "@/components/ListenButton";
import { PageTitle, SimBadge } from "@/components/Layout";

export const Route = createFileRoute("/bem-estar")({
  head: () => ({
    meta: [
      { title: "Emotional well-being | Cuida+" },
      { name: "description", content: "Voluntary questions to reflect on mood, sleep, stress and safety." },
      { property: "og:title", content: "Emotional well-being | Cuida+" },
      { property: "og:description", content: "A space to reflect on how you are doing." },
    ],
  }),
  component: BemEstar,
});

/** Answers stay only in page memory: nothing is saved or sent. */
function BemEstar() {
  const [active, setActive] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, (number | null)[]>>({});
  const [done, setDone] = useState(false);
  const q = questionnaires.find((x) => x.id === active);

  if (!q) {
    return (
      <div>
        <PageTitle title="How are you doing?" subtitle="Answering is optional. You can skip any question or stop whenever you want." />
        <p className="mb-4 rounded-xl bg-muted p-3 text-sm">
          <SimBadge>Demo</SimBadge> These questions are for self-reflection and <strong>are not a clinical test and give no diagnosis</strong>. Your answers are not saved or sent.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {questionnaires.map((x) => (
            <li key={x.id}>
              <button onClick={() => { setActive(x.id); setDone(false); }} className="card-base w-full p-4 text-left">
                <h2 className="text-lg font-semibold">{x.title}</h2>
                <p className="text-sm text-muted-foreground">{x.questions.length} questions · about 1 min</p>
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
    const reflection = high
      ? "It looks like things are weighing heavily on you. That deserves care, and you don't have to go through it alone."
      : "It's good that you stopped to look at yourself. Keep taking care of you.";
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Thanks for sharing</h1>
        <p>{reflection}</p>
        <ListenButton text={`Thanks for sharing. ${reflection} This is not a diagnosis. Only a professional can make an assessment.`} />
        <p className="text-sm text-muted-foreground">This is not a diagnosis. Only a professional can make an assessment.</p>
        {(high || safetyFlag) && (
          <div className="rounded-2xl bg-accent p-4">
            <p className="font-bold">Ways to get support</p>
            <ul className="mt-2 space-y-1">
              {hotlines.filter((h) => h.number === "188" || safetyFlag).map((h) => (
                <li key={h.number}><a href={`tel:${h.number}`} className="underline">{h.name} – {h.number}</a> · {h.desc}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Link to="/solicitar-apoio" className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground">I want to talk to someone</Link>
          <Link to="/servicos" className="rounded-full border px-4 py-2 font-bold">See services</Link>
          <button onClick={() => setActive(null)} className="rounded-full border px-4 py-2 font-bold">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setActive(null)} className="mb-4 text-sm text-primary">← Back</button>
      <PageTitle title={q.title} subtitle="Think about the last two weeks." />
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
                <button onClick={() => set(i, null)} className="px-3 py-1.5 text-sm text-muted-foreground underline">I'd rather not answer</button>
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <button onClick={() => setDone(true)} className="mt-6 w-full rounded-full bg-primary py-3 font-bold text-primary-foreground">See my reflection</button>
    </div>
  );
}
