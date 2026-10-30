import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Lightbulb, LifeBuoy, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { hotlines } from "@/lib/data";
import {
  type AgeGroup, type OptionId, type Scenario, MAX_NEXT_STEPS, achievementLabels, achievementsFor,
  categoriesOf, categoryLabels, feedbackFor, hasStuckThought, hints, pauseOption, scenariosFor, stuckThoughtFeedback,
} from "@/lib/possibilities-game";

type Stage = 1 | 2 | 3 | 4 | 5;

function OptionCard({ text, selected, onToggle, disabled }: { text: string; selected: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left text-base transition-colors disabled:opacity-50 ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}>
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>
        {selected && <Check className="h-4 w-4" aria-hidden />}
      </span>
      <span>{text}</span>
    </button>
  );
}

function SafetyPanel({ onBack }: { onBack: () => void }) {
  return (
    <section role="alert" className="card-base space-y-3 border-2 border-destructive p-4">
      <h2 className="text-xl font-semibold">Let's pause the game</h2>
      <p>Thank you for telling us. What you're going through matters, and you deserve support from real people — this game can't replace that.</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Talk to an adult you trust: family, a teacher, a school counselor or a health professional.</li>
        <li>If you are in danger or thinking about hurting yourself, call now:</li>
      </ul>
      <ul className="grid gap-2">
        {hotlines.slice(0, 3).map((h) => (
          <li key={h.number}><a href={`tel:${h.number}`} className="block rounded-xl bg-destructive p-3 font-semibold text-destructive-foreground">{h.number} — {h.name}</a></li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">Nothing you do in this game is saved or sent to anyone.</p>
      <div className="flex flex-wrap gap-2">
        <Link to="/ajuda" className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground">More help options</Link>
        <button type="button" onClick={onBack} className="rounded-full border px-4 py-2">Back to the game</button>
      </div>
    </section>
  );
}

export function PossibilitiesGame() {
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>(1);
  const [first, setFirst] = useState<OptionId[]>([]);
  const [picks, setPicks] = useState<OptionId[]>([]);
  const [next, setNext] = useState<OptionId[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [safety, setSafety] = useState(false);
  const [earned, setEarned] = useState(0);

  if (!age) {
    return (
      <section className="card-base space-y-4 p-4">
        <p className="text-lg">Hard moments can feel like there's only one way forward. Let's look for more.</p>
        <h2 className="text-xl font-semibold">Choose your age group</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["12-14", "15-17"] as AgeGroup[]).map((a) => (
            <button key={a} type="button" onClick={() => setAge(a)} className="rounded-2xl bg-primary p-4 text-lg font-bold text-primary-foreground">{a} years</button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Your answers stay on this screen only. Nothing is saved or sent.</p>
      </section>
    );
  }

  const list = scenariosFor(age);
  const scenario: Scenario = list[index % list.length] ?? list[0]!;
  const toggle = (arr: OptionId[], set: (v: OptionId[]) => void, id: OptionId, max?: number) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : max && arr.length >= max ? arr : [...arr, id]);
  const resetRound = () => { setStage(1); setFirst([]); setPicks([]); setNext([]); setShowHints(false); };
  const achievements = achievementsFor(scenario, first, picks, next);

  if (safety) return <SafetyPanel onBack={() => setSafety(false)} />;

  const progress = (
    <div className="flex items-center gap-2" aria-label={`Stage ${Math.min(stage, 4)} of 4`}>
      {[1, 2, 3, 4].map((s) => <span key={s} className={`h-2 flex-1 rounded-full ${s <= stage ? "bg-primary" : "bg-muted"}`} />)}
    </div>
  );

  return (
    <div className="space-y-4">
      {progress}
      <section className="card-base space-y-2 bg-lilac p-4 text-lilac-foreground">
        <p className="text-xs font-bold uppercase tracking-wide">Scenario {index % list.length + 1} of {list.length} · {scenario.title}</p>
        <p className="text-lg">{scenario.situation}</p>
      </section>

      {stage === 1 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What are some things you could do in this situation?</h2>
          <p className="text-sm text-muted-foreground">Choose as many as you like.</p>
          {scenario.options.map((o) => <OptionCard key={o.id} text={o.text} selected={first.includes(o.id)} onToggle={() => toggle(first, setFirst, o.id)} />)}
          <button type="button" disabled={first.length === 0} onClick={() => { setPicks(first); setStage(2); }} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50">Continue</button>
        </section>
      )}

      {stage === 2 && (
        <section className="animate-in fade-in space-y-3">
          <p className="rounded-2xl bg-secondary p-3 text-secondary-foreground">{hasStuckThought(scenario, first) && categoriesOf(scenario, first).length === 0 ? stuckThoughtFeedback : feedbackFor(scenario, first, age)}</p>
          {hasStuckThought(scenario, first) && categoriesOf(scenario, first).length > 0 && <p className="rounded-2xl bg-muted p-3">{stuckThoughtFeedback}</p>}
          <h2 className="text-xl font-semibold">Nice start! Can you think of another possibility?</h2>
          <button type="button" onClick={() => setShowHints((v) => !v)} className="inline-flex items-center gap-2 text-primary underline"><Lightbulb className="h-4 w-4" aria-hidden />{showHints ? "Hide hints" : "Need a hint?"}</button>
          {showHints && <ul className="list-disc space-y-1 rounded-2xl bg-muted p-3 pl-8">{hints.map((h) => <li key={h}>{h}</li>)}</ul>}
          {scenario.options.filter((o) => !first.includes(o.id)).map((o) => <OptionCard key={o.id} text={o.text} selected={picks.includes(o.id)} onToggle={() => toggle(picks, setPicks, o.id)} />)}
          <button type="button" onClick={() => setStage(3)} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground">{picks.length > first.length ? "See my map" : "I'm okay with what I have"}</button>
        </section>
      )}

      {stage === 3 && (
        <section className="animate-in fade-in space-y-3">
          <h2 className="text-xl font-semibold">Your map of possibilities</h2>
          <p className="text-center text-sm text-muted-foreground">You are here ↓ — and the path opens in different directions.</p>
          <ul className="grid grid-cols-2 gap-2">
            {(Object.keys(categoryLabels) as (keyof typeof categoryLabels)[]).map((c) => {
              const found = categoriesOf(scenario, picks).includes(c);
              return <li key={c} className={`rounded-2xl border-2 p-3 text-sm ${found ? "border-primary bg-primary/10 font-semibold" : "border-dashed border-border text-muted-foreground"}`}>{found ? "✓ " : "○ "}{categoryLabels[c]}</li>;
            })}
          </ul>
          <p className="rounded-2xl bg-secondary p-3 text-secondary-foreground">{feedbackFor(scenario, picks, age)} Dashed paths are other directions you could explore later — you don't need all of them.</p>
          <button type="button" onClick={() => setStage(4)} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground">Choose my next move</button>
        </section>
      )}

      {stage === 4 && (
        <section className="animate-in fade-in space-y-3">
          <h2 className="text-xl font-semibold">Which option feels most helpful or realistic for you right now?</h2>
          <p className="text-sm text-muted-foreground">Pick one or two. Taking a break or asking for help are valid choices too.</p>
          {[...scenario.options.filter((o) => picks.includes(o.id) && !o.stuckThought), pauseOption].map((o) => (
            <OptionCard key={o.id} text={o.text} selected={next.includes(o.id)} disabled={!next.includes(o.id) && next.length >= MAX_NEXT_STEPS} onToggle={() => toggle(next, setNext, o.id, MAX_NEXT_STEPS)} />
          ))}
          <button type="button" disabled={next.length === 0} onClick={() => { setEarned((e) => e + achievements.length); setStage(5); }} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50">Done</button>
        </section>
      )}

      {stage === 5 && (
        <section className="animate-in fade-in card-base space-y-3 p-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Trophy className="h-6 w-6 text-primary" aria-hidden />Badges for this scenario</h2>
          {achievements.length === 0 ? <p>You explored this situation at your own pace — that counts.</p> : (
            <ul className="space-y-2">{achievements.map((a) => <li key={a} className="flex gap-2 rounded-2xl bg-secondary p-3 text-secondary-foreground"><Sparkles className="h-5 w-5 shrink-0" aria-hidden /><span><b>{achievementLabels[a].title}:</b> {achievementLabels[a].text}</span></li>)}</ul>
          )}
          <p className="text-sm text-muted-foreground">Total badges this session: {earned}. Badges show game progress only — not how you are doing emotionally.</p>
          <p className="text-lg font-semibold">You don't have to figure everything out at once. Sometimes, finding one more possibility is a great place to start.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setIndex((i) => i + 1); resetRound(); }} className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground">Next scenario</button>
            <button type="button" onClick={() => { setAge(null); setIndex(0); setEarned(0); resetRound(); }} className="inline-flex items-center gap-1 rounded-full border px-4 py-2"><RotateCcw className="h-4 w-4" aria-hidden />Start over</button>
          </div>
        </section>
      )}

      <button type="button" onClick={() => setSafety(true)} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-destructive py-3 font-semibold text-destructive">
        <LifeBuoy className="h-5 w-5" aria-hidden />Something serious is happening to me
      </button>
    </div>
  );
}
