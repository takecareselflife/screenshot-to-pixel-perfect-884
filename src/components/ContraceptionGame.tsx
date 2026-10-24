import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, CheckCircle2, Info, Lightbulb, ListChecks, RotateCcw, ShieldCheck, Syringe, Trophy, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListenButton } from "@/components/ListenButton";
import {
  METHODS,
  QUIZ,
  SAFETY_MESSAGES,
  TARGETS,
  checkMatch,
  methodById,
  pointsFor,
  type Method,
  type MethodId,
  type TargetId,
} from "@/lib/contraception-game";

type Phase = "play" | "quiz" | "end";
type Feedback = { kind: "correct" | "retry" | "info"; title: string; text: string };

const INSTRUCTIONS =
  "Where does it go? Discover contraceptive methods. Drag each method card to the place where it is used: a body area, or a special target for methods that are swallowed, injected or based on the cycle calendar. You can also tap a card and then tap a target. Tap a card to read its fact sheet. Wrong answers never lose points: you get a hint and can try again. When every card is placed, start the final challenge.";

const cardTones = ["bg-lilac text-lilac-foreground", "bg-sky text-sky-foreground", "bg-secondary text-secondary-foreground", "bg-accent text-accent-foreground"];

/* ---------- illustrations ---------- */

function MethodArt({ id }: { id: MethodId }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const art: Record<MethodId, ReactNode> = {
    "external-condom": <><path {...common} d="M20,52 v-24 a12,12 0 0 1 24,0 v24" /><ellipse {...common} cx="32" cy="54" rx="16" ry="5" /><circle cx="32" cy="14" r="3" fill="currentColor" /></>,
    "internal-condom": <><path {...common} d="M18,16 q14,-8 28,0 l-4,34 q-10,8 -20,0 z" /><ellipse {...common} cx="32" cy="16" rx="14" ry="4" /><circle {...common} cx="32" cy="46" r="5" /></>,
    pill: <><rect {...common} x="10" y="14" width="44" height="36" rx="6" />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <circle key={`${r}${c}`} cx={18 + c * 9.5} cy={22 + r * 10} r="3" fill="currentColor" />))}</>,
    "copper-iud": <><path {...common} d="M14,16 q18,8 36,0 M32,18 v32" /><path d="M28,24 h8 M28,30 h8 M28,36 h8" stroke="currentColor" strokeWidth="2" /><path {...common} strokeWidth="1.5" d="M32,50 v8" /></>,
    "hormonal-iud": <><path {...common} d="M14,16 q18,8 36,0 M32,18 v32" /><rect x="27" y="22" width="10" height="20" rx="4" fill="currentColor" opacity="0.5" /><path {...common} strokeWidth="1.5" d="M32,50 v8" /></>,
    patch: <><rect {...common} x="14" y="14" width="36" height="36" rx="6" transform="rotate(-10 32 32)" /><rect x="22" y="22" width="20" height="20" rx="3" fill="currentColor" opacity="0.35" transform="rotate(-10 32 32)" /></>,
    ring: <><circle {...common} strokeWidth="6" cx="32" cy="32" r="18" /></>,
    implant: <><rect {...common} x="8" y="28" width="48" height="8" rx="4" /><path d="M20,16 q12,-6 24,0" stroke="currentColor" strokeWidth="2" fill="none" /></>,
    injection: <><path {...common} d="M46,14 l6,6 M42,18 l6,6 M44,20 l-24,24 -6,0 0,-6 24,-24 M14,50 l-6,6" /><path d="M24,36 l8,-8" stroke="currentColor" strokeWidth="2" /></>,
    diaphragm: <><path {...common} d="M10,40 q22,-34 44,0" /><ellipse {...common} cx="32" cy="40" rx="22" ry="5" /></>,
    sponge: <><ellipse {...common} cx="32" cy="34" rx="20" ry="14" /><circle cx="32" cy="34" r="5" fill="currentColor" opacity="0.4" /><path {...common} strokeWidth="2" d="M32,48 q6,6 0,10" /></>,
    "fertility-awareness": <><rect {...common} x="10" y="14" width="44" height="40" rx="5" /><path {...common} d="M10,24 h44 M22,10 v8 M42,10 v8" />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={15 + c * 10} y={29 + r * 8} width="6" height="5" rx="1" fill="currentColor" opacity={r === 1 && c > 0 ? 0.9 : 0.3} />))}</>,
  };
  return <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden="true">{art[id]}</svg>;
}

function Person({ hair, skin, shirt, shorts, longHair }: { hair: string; skin: string; shirt: string; shorts: string; longHair?: boolean }) {
  return (
    <svg viewBox="0 0 200 380" className="h-full w-full" aria-hidden="true">
      {longHair && <path d="M62,50 q0,70 10,80 h56 q10,-10 10,-80 z" fill={hair} />}
      <rect x="70" y="262" width="26" height="100" rx="12" fill={skin} />
      <rect x="104" y="262" width="26" height="100" rx="12" fill={skin} />
      <rect x="34" y="104" width="22" height="130" rx="11" fill={skin} />
      <rect x="144" y="104" width="22" height="130" rx="11" fill={skin} />
      <rect x="91" y="78" width="18" height="26" rx="6" fill={skin} />
      <rect x="58" y="98" width="84" height="130" rx="20" fill={shirt} />
      <rect x="30" y="100" width="30" height="44" rx="12" fill={shirt} />
      <rect x="140" y="100" width="30" height="44" rx="12" fill={shirt} />
      <rect x="60" y="214" width="80" height="62" rx="14" fill={shorts} />
      <circle cx="100" cy="50" r="32" fill={skin} />
      <path d="M68,48 a32,32 0 0 1 64,0 q-30,-14 -64,0 z" fill={hair} />
      <circle cx="89" cy="54" r="3.5" fill="#2b2320" />
      <circle cx="111" cy="54" r="3.5" fill="#2b2320" />
      <path d="M90,66 q10,8 20,0" stroke="#2b2320" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function InsideView() {
  return (
    <svg viewBox="0 0 200 300" className="h-full w-full" aria-hidden="true">
      <path d="M30,40 q-14,-10 -18,6 q0,14 14,10 M170,40 q14,-10 18,6 q0,14 -14,10" className="fill-none stroke-warm" strokeWidth="5" strokeLinecap="round" />
      <path d="M40,36 q60,-16 120,0 q-6,70 -40,104 h-40 q-34,-34 -40,-104 z" className="fill-accent stroke-warm" strokeWidth="4" />
      <path d="M84,140 h32 l-4,40 h-24 z" className="fill-warm/60 stroke-warm" strokeWidth="4" />
      <path d="M86,182 h28 q8,50 4,96 h-36 q-4,-46 4,-96 z" className="fill-accent stroke-warm" strokeWidth="4" />
    </svg>
  );
}

/* ---------- small reusable parts ---------- */

function DropTarget({ id, label, className, style, active, count, onTap, children }: {
  id: TargetId; label: string; className?: string; style?: React.CSSProperties; active: boolean; count: number; onTap: () => void; children?: ReactNode;
}) {
  return (
    <button
      type="button"
      data-target={id}
      onClick={onTap}
      aria-label={`Target: ${label}${count ? `, ${count} placed` : ""}`}
      style={style}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed p-1 text-center text-[11px] font-bold leading-tight transition ${active ? "scale-105 border-primary bg-primary/25" : "border-foreground/40 bg-card/70"} ${className ?? ""}`}
    >
      {children}
      <span className="pointer-events-none">{label}</span>
      {count > 0 && <span className="pointer-events-none rounded-full bg-go px-1.5 text-[10px] text-go-foreground">✓ {count}</span>}
    </button>
  );
}

function ScoreBar({ points, done, total }: { points: number; done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="flex items-center gap-1"><Trophy className="h-4 w-4 text-warm" aria-hidden /> {points} points</span>
        <span>{done} of {total}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Game progress">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeedbackPanel({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;
  const tone = feedback.kind === "correct" ? "bg-secondary text-secondary-foreground" : feedback.kind === "retry" ? "bg-accent text-accent-foreground" : "bg-sky text-sky-foreground";
  const Icon = feedback.kind === "correct" ? CheckCircle2 : feedback.kind === "retry" ? Lightbulb : Info;
  return (
    <div aria-live="polite" className={`mt-3 rounded-2xl p-3 ${tone} ${feedback.kind === "correct" ? "animate-in zoom-in-95" : ""}`}>
      <p className="flex items-center gap-2 font-bold"><Icon className="h-5 w-5 shrink-0" aria-hidden />{feedback.title}</p>
      <p className="mt-1 text-sm">{feedback.text}</p>
    </div>
  );
}

function FactSheetPanel({ method }: { method: Method }) {
  const rows: [string, string][] = [
    ["How it works", method.sheet.howItWorks],
    ["How it is used", method.sheet.howUsed],
    ["Hormones", method.sheet.hormones],
    ["Effectiveness (typical use)", method.sheet.effectiveness],
    ["How long / how often", method.sheet.duration],
    ["Main advantages", method.sheet.advantages],
    ["Possible side effects", method.sheet.sideEffects],
    ["Health professional", method.sheet.professional],
    ["Protects against STIs?", method.sheet.sti],
  ];
  return (
    <section className="card-base mt-3 p-4" aria-label={`Fact sheet: ${method.name}`}>
      <div className="flex items-center gap-3">
        <span className="text-primary"><MethodArt id={method.id} /></span>
        <h3 className="text-lg font-semibold">{method.name}</h3>
      </div>
      {method.note && <p className="mt-1 text-sm font-bold text-muted-foreground">{method.note}</p>}
      <dl className="mt-2 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="font-bold">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">Effectiveness numbers describe groups of people, not a personal guarantee.</p>
      <ListenButton className="mt-2" text={[method.name, ...rows.map(([k, v]) => `${k}: ${v}`)].join(". ")} />
    </section>
  );
}

function SafetyBox() {
  return (
    <aside className="mt-6 rounded-2xl bg-sky p-4 text-sky-foreground">
      <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5" aria-hidden /> Good to know</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{SAFETY_MESSAGES.map((m) => <li key={m}>{m}</li>)}</ul>
    </aside>
  );
}

/* ---------- game ---------- */

export function ContraceptionGame() {
  const [phase, setPhase] = useState<Phase>("play");
  const [matched, setMatched] = useState<Partial<Record<MethodId, TargetId>>>({});
  const [selected, setSelected] = useState<MethodId | null>(null);
  const [sheet, setSheet] = useState<MethodId | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [points, setPoints] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [drag, setDrag] = useState<{ id: MethodId; x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<TargetId | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizPick, setQuizPick] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const wrong = useRef<Partial<Record<MethodId, number>>>({});
  const pointer = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  const doneCount = Object.keys(matched).length;
  const allDone = doneCount === METHODS.length;

  const reset = () => {
    setPhase("play"); setMatched({}); setSelected(null); setSheet(null); setFeedback(null);
    setPoints(0); setFirstTry(0); setQuizStep(0); setQuizPick(null); setQuizCorrect(0);
    wrong.current = {};
  };

  const tryMatch = (methodId: MethodId | null, targetId: TargetId) => {
    if (!methodId) {
      setFeedback({ kind: "info", title: "Pick a card first", text: "Tap or drag one of the method cards, then choose where it goes." });
      return;
    }
    if (matched[methodId]) return;
    const r = checkMatch(methodId, targetId);
    if (r.result === "correct") {
      const misses = wrong.current[methodId] ?? 0;
      setPoints((p) => p + pointsFor(misses));
      if (misses === 0) setFirstTry((n) => n + 1);
      setMatched((m) => ({ ...m, [methodId]: targetId }));
      setSelected(null);
      setSheet(methodId);
      setFeedback({ kind: "correct", title: "Well done! You got it!", text: r.message });
    } else {
      wrong.current[methodId] = (wrong.current[methodId] ?? 0) + 1;
      setFeedback({ kind: "retry", title: "Almost! Let's learn together?", text: r.message });
    }
  };

  const hitTarget = (x: number, y: number) =>
    (document.elementFromPoint(x, y)?.closest("[data-target]")?.getAttribute("data-target") as TargetId | null) ?? null;

  const onDown = (id: MethodId) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!e.isPrimary || e.button !== 0 || matched[id]) return;
    pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (id: MethodId) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) p.moved = true;
    if (!p.moved) return;
    setDrag({ id, x: e.clientX, y: e.clientY });
    setHovered(hitTarget(e.clientX, e.clientY));
  };
  const endDrag = () => { setDrag(null); setHovered(null); };
  const onUp = (id: MethodId) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    if (p.moved) {
      const t = hitTarget(e.clientX, e.clientY);
      if (t) tryMatch(id, t);
      else setFeedback({ kind: "info", title: "Drop it on a target", text: "Release the card over one of the dashed targets." });
    }
    endDrag();
  };
  const onCardClick = (id: MethodId) => {
    if (pointer.current?.moved) { pointer.current = null; return; }
    pointer.current = null;
    setSheet(id);
    if (!matched[id]) setSelected((s) => (s === id ? null : id));
  };

  const showHint = () => {
    const m = selected ? methodById(selected) : METHODS.find((x) => !matched[x.id]);
    if (!m) return;
    setFeedback({ kind: "info", title: `Hint: ${m.name}`, text: m.hint });
  };

  const checkAnswers = () => {
    const left = METHODS.filter((m) => !matched[m.id]).map((m) => m.name);
    setFeedback(left.length
      ? { kind: "info", title: `${doneCount} of ${METHODS.length} correct so far`, text: `Still to place: ${left.join(", ")}.` }
      : { kind: "correct", title: "All answers are correct!", text: "Every method is in the right place. You are ready for the final challenge." });
  };

  const count = (t: TargetId) => Object.values(matched).filter((v) => v === t).length;
  const target = (id: TargetId, className: string, style?: React.CSSProperties, icon?: ReactNode) => (
    <DropTarget id={id} label={TARGETS.find((t) => t.id === id)!.label} className={className} style={style}
      active={hovered === id} count={count(id)} onTap={() => tryMatch(selected, id)}>{icon}</DropTarget>
  );

  if (phase === "quiz") {
    const q = QUIZ[quizStep]!;
    const answered = quizPick !== null;
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Final challenge · question {quizStep + 1} of {QUIZ.length}</p>
        <ScoreBar points={points} done={quizStep + (answered ? 1 : 0)} total={QUIZ.length} />
        <h2 className="text-xl font-semibold">{q.q}</h2>
        <div className="mt-3 grid gap-2">
          {q.options.map((o, i) => {
            const state = !answered ? "" : i === q.answer ? "bg-go text-go-foreground" : i === quizPick ? "bg-accent text-accent-foreground" : "opacity-60";
            return (
              <Button key={o} variant="outline" type="button" disabled={answered}
                onClick={() => { setQuizPick(i); if (i === q.answer) { setQuizCorrect((n) => n + 1); setPoints((p) => p + 10); } }}
                className={`h-auto min-h-12 justify-start whitespace-normal rounded-2xl px-4 py-3 text-left text-base font-bold disabled:opacity-100 ${state}`}>
                {o}
              </Button>
            );
          })}
        </div>
        {answered && (
          <>
            <FeedbackPanel feedback={quizPick === q.answer
              ? { kind: "correct", title: "Well done! You got it!", text: q.explain }
              : { kind: "retry", title: "Almost! Let's learn together?", text: q.explain }} />
            <Button type="button" className="mt-3 rounded-full" onClick={() => {
              if (quizStep + 1 < QUIZ.length) { setQuizStep((s) => s + 1); setQuizPick(null); } else setPhase("end");
            }}>
              {quizStep + 1 < QUIZ.length ? "Next question" : "See my results"} <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </>
        )}
        <SafetyBox />
      </div>
    );
  }

  if (phase === "end") {
    const totalItems = METHODS.length + QUIZ.length;
    const pct = Math.round(((firstTry + quizCorrect) / totalItems) * 100);
    return (
      <div className="text-center">
        <Trophy className="mx-auto h-14 w-14 text-warm" aria-hidden />
        <h2 className="mt-2 text-2xl font-semibold">Challenge complete!</h2>
        <p className="mt-2 text-lg font-bold">{points} points</p>
        <p className="text-muted-foreground">{pct}% correct on the first try ({firstTry + quizCorrect} of {totalItems})</p>
        <div className="card-base mt-4 p-4 text-left">
          <h3 className="font-semibold">What you learned</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Where each of the 12 contraceptive methods is used.</li>
            {QUIZ.map((q) => <li key={q.topic}>{q.topic}</li>)}
          </ul>
        </div>
        <SafetyBox />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset} className="rounded-full"><RotateCcw className="h-4 w-4" aria-hidden /> Play again</Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/biblioteca">Explore other sexual and reproductive health content</Link>
          </Button>
        </div>
      </div>
    );
  }

  const sheetMethod = sheet ? methodById(sheet) : null;
  return (
    <div>
      <ScoreBar points={points} done={doneCount} total={METHODS.length} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ListenButton text={INSTRUCTIONS} />
        <p className="text-sm text-muted-foreground">Drag each card to where it is used — or tap a card, then a target.</p>
      </div>

      <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2" aria-label="Method cards">
        {METHODS.map((m, i) => {
          const done = !!matched[m.id];
          return (
            <li key={m.id} className="snap-start">
              <button
                type="button"
                data-method={m.id}
                aria-pressed={selected === m.id}
                aria-label={`${m.name}${done ? " (placed correctly)" : ""}: ${m.short}`}
                onPointerDown={onDown(m.id)}
                onPointerMove={onMove(m.id)}
                onPointerUp={onUp(m.id)}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onClick={() => onCardClick(m.id)}
                className={`relative flex h-36 w-28 touch-pan-x select-none flex-col items-center gap-1 rounded-2xl p-2 text-center shadow-soft transition ${cardTones[i % cardTones.length]} ${selected === m.id ? "ring-4 ring-ring" : ""} ${done ? "opacity-60" : "cursor-grab active:cursor-grabbing"} ${drag?.id === m.id ? "scale-95 opacity-50" : ""}`}
              >
                {done && <CheckCircle2 className="absolute right-1.5 top-1.5 h-5 w-5 text-go" aria-hidden />}
                <MethodArt id={m.id} />
                <span className="text-sm font-bold leading-tight">{m.name}</span>
                <span className="text-[11px] leading-tight opacity-90">{m.short}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-1 min-h-5 text-center text-sm font-bold">
        {selected ? `${methodById(selected).name} picked — now tap where it goes.` : "\u00a0"}
      </p>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <figure className="relative aspect-[200/380]">
          <Person skin="#8d5a3b" hair="#1f1611" shirt="#d98c6a" shorts="#6b5b95" longHair />
          {target("arm", "absolute", { left: "8%", top: "28%", width: "34%", height: "22%" })}
          {target("skin", "absolute", { left: "34%", top: "44%", width: "34%", height: "13%" })}
          <figcaption className="text-center text-xs font-bold">Female body</figcaption>
        </figure>
        <figure className="relative aspect-[200/380]">
          <div className="absolute inset-x-0 top-[6%] h-[80%]"><InsideView /></div>
          {target("uterus", "absolute", { left: "14%", top: "8%", width: "72%", height: "34%" })}
          {target("cervix", "absolute", { left: "26%", top: "43%", width: "48%", height: "13%" })}
          {target("vagina", "absolute", { left: "26%", top: "57%", width: "48%", height: "29%" })}
          <figcaption className="absolute inset-x-0 bottom-0 text-center text-xs font-bold">Inside view (female)</figcaption>
        </figure>
        <figure className="relative aspect-[200/380]">
          <Person skin="#e9bf98" hair="#6b3f1d" shirt="#4f8a8b" shorts="#3d4f7a" />
          {target("penis", "absolute", { left: "30%", top: "57%", width: "40%", height: "15%" })}
          <figcaption className="text-center text-xs font-bold">Male body</figcaption>
        </figure>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {target("oral", "min-h-20", undefined, <Pill className="h-6 w-6" aria-hidden />)}
        {target("injection", "min-h-20", undefined, <Syringe className="h-6 w-6" aria-hidden />)}
        {target("calendar", "min-h-20", undefined, <CalendarDays className="h-6 w-6" aria-hidden />)}
      </div>

      {drag && (
        <div aria-hidden="true" data-drag-preview className="pointer-events-none fixed z-50 flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl bg-primary p-2 text-center text-xs font-bold text-primary-foreground shadow-soft"
          style={{ left: drag.x, top: drag.y }}>
          <MethodArt id={drag.id} />
          {methodById(drag.id).name}
        </div>
      )}

      <FeedbackPanel feedback={feedback} />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={checkAnswers}><ListChecks className="h-4 w-4" aria-hidden /> Check answers</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={showHint}><Lightbulb className="h-4 w-4" aria-hidden /> Hint</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={reset}><RotateCcw className="h-4 w-4" aria-hidden /> Play again</Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/biblioteca/$slug" params={{ slug: "contraception" }}>Back to module</Link>
        </Button>
      </div>

      {allDone && (
        <Button type="button" className="mt-3 w-full rounded-full py-6 text-base" onClick={() => { setPhase("quiz"); setFeedback(null); }}>
          Start the FINAL CHALLENGE <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      )}

      {sheetMethod && <FactSheetPanel method={sheetMethod} />}
      <SafetyBox />
    </div>
  );
}
