/**
 * Touch Traffic Light — interactive body safety and consent game.
 * Educational only; never stores or sends anything the player does.
 */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Info, LifeBuoy, RotateCcw, Star, Trophy } from "lucide-react";
import { ListenButton } from "@/components/ListenButton";
import { Button } from "@/components/ui/button";

type TrafficColor = "green" | "yellow" | "red";
type Phase = "intro" | "l1" | "l2" | "l3" | "trusted" | "final";
type Feedback = { kind: "correct" | "retry" | "info"; text: string };

const REGIONS = [
  { id: "head", label: "Head and hair" },
  { id: "face", label: "Face" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms and hands" },
  { id: "chest", label: "Chest" },
  { id: "abdomen", label: "Abdomen" },
  { id: "private", label: "Private parts" },
  { id: "buttocks", label: "Buttocks" },
  { id: "legs", label: "Legs and feet" },
] as const;
type RegionId = (typeof REGIONS)[number]["id"];

const colorMeta: Record<TrafficColor, { label: string; hint: string; chip: string }> = {
  green: { label: "Green", hint: "Safe or welcome touch", chip: "bg-go text-go-foreground" },
  yellow: { label: "Yellow", hint: "Pause: check boundaries and consent", chip: "bg-caution text-caution-foreground" },
  red: { label: "Red", hint: "Unsafe or inappropriate touch — seek help", chip: "bg-stop text-stop-foreground" },
};

const GREEN_MSG = "A welcome touch respects your boundaries. You can always change your mind!";
const YELLOW_MSG = "Pay attention to how you feel. You can say NO, move away, and ask for help.";
const RED_MSG =
  "Your body belongs to you. No one should involve you in unwanted sexual touching. If someone makes you feel unsafe, tell a trusted adult. It is never your fault.";

/** Private areas (outlined in red on the characters) take the red circle. */
export const PRIVATE_REGIONS: RegionId[] = ["chest", "private", "buttocks"];
const isPrivate = (region: RegionId) => PRIVATE_REGIONS.includes(region);

const l1Tasks = REGIONS.map((region) => ({
  target: region.id,
  requiresRed: isPrivate(region.id),
  prompt: isPrivate(region.id)
    ? `Private area: place the RED circle on: ${region.label}.`
    : `Place a colored circle on: ${region.label}.`,
  feedback: isPrivate(region.id)
    ? "You found it! Private areas deserve protection. Nobody should touch them without your consent. Appropriate healthcare must be explained and respectful, with a trusted adult present. Unwanted sexual touching is never your fault."
    : "You found it! Your body belongs to you. Whether a touch is welcome depends on the situation and your consent, not just the body part or color.",
}));

const markerPositions: Record<RegionId, [number, number]> = {
  head: [100, 44], face: [100, 80], shoulders: [100, 131], arms: [48, 194],
  chest: [100, 164], abdomen: [100, 204], private: [100, 240], buttocks: [73, 240], legs: [85, 310],
};
type Placement = { color: TrafficColor; region: RegionId; character: string };

const l2Situations: { text: string; color: TrafficColor; region: RegionId; feedback: string }[] = [
  { text: "A hug from someone you are happy to hug", color: "green", region: "shoulders", feedback: GREEN_MSG },
  { text: "A high-five that both people welcome", color: "green", region: "arms", feedback: GREEN_MSG },
  { text: "Someone keeps tickling you after you asked them to stop", color: "yellow", region: "abdomen", feedback: YELLOW_MSG },
  { text: "Someone insists on hugging you when you do not want a hug", color: "yellow", region: "shoulders", feedback: YELLOW_MSG },
  { text: "Someone touches your private parts and says it is a secret", color: "red", region: "private", feedback: RED_MSG },
  { text: "Someone touches your chest without your consent", color: "red", region: "chest", feedback: RED_MSG },
];

const scenarios = [
  {
    q: "Someone wants to hug you, but you do not want a hug. What can you do?",
    options: ["Accept the hug even if you do not want it.", "Say no and choose another greeting.", "Feel guilty for refusing."],
    answer: 1,
    feedback: "You have the right to decide whether you want a hug.",
  },
  {
    q: "Someone touches your private parts and tells you to keep it a secret. What should you do?",
    options: ["Keep the secret.", "Tell a trusted adult.", "Blame yourself."],
    answer: 1,
    feedback: "You deserve to be safe. Tell a trusted adult. You are not to blame.",
  },
  {
    q: "A healthcare professional needs to examine a private area during a medical appointment. What should happen?",
    options: [
      "The professional should explain the examination, respect your privacy, and follow appropriate safeguards.",
      "You should never ask questions.",
      "You must agree to every kind of touching without an explanation.",
    ],
    answer: 0,
    feedback: "You can ask questions and express discomfort. Appropriate healthcare should respect your dignity, safety, and rights.",
  },
];

const trustedOptions = [
  { id: "t1", label: "A parent or family member you trust", safe: true },
  { id: "t2", label: "A teacher or school counselor", safe: true },
  { id: "t3", label: "A doctor or nurse", safe: true },
  { id: "t4", label: "A coach or club leader", safe: true },
  { id: "t5", label: "A stranger who offers you gifts", safe: false },
  { id: "t6", label: "Someone who asks you to keep secrets", safe: false },
];

const zoneShapes: { id: RegionId; d: string; emphasize?: boolean }[] = [
  { id: "head", d: "M62,64 A38,38 0 0 1 138,64 Z" },
  { id: "face", d: "M62,64 A38,38 0 0 0 138,64 Z" },
  { id: "shoulders", d: "M62,118 h76 v26 h-76 z" },
  { id: "chest", d: "M62,144 h76 v42 h-76 z", emphasize: true },
  { id: "abdomen", d: "M62,186 h76 v40 h-76 z" },
  { id: "private", d: "M84,224 h32 v34 h-32 z", emphasize: true },
  { id: "buttocks", d: "M62,224 h22 v34 h-22 z M116,224 h22 v34 h-22 z", emphasize: true },
  {
    id: "arms",
    d: "M36,124 h24 v128 h-24 z M140,124 h24 v128 h-24 z M37,262 a11,11 0 1 0 22,0 a11,11 0 1 0 -22,0 M141,262 a11,11 0 1 0 22,0 a11,11 0 1 0 -22,0",
  },
  {
    id: "legs",
    d: "M72,254 h26 v100 h-26 z M102,254 h26 v100 h-26 z M66,354 a19,10 0 1 0 38,0 a19,10 0 1 0 -38,0 M96,354 a19,10 0 1 0 38,0 a19,10 0 1 0 -38,0",
  },
];

function Character({
  name,
  skin,
  skinShade,
  hair,
  outfit,
  hovered,
  placements,
  onActivate,
  targetRegion,
}: {
  name: string;
  skin: string;
  skinShade: string;
  hair: string;
  outfit: string;
  hovered: string | null;
  placements: Placement[];
  onActivate: (region: RegionId) => void;
  targetRegion: RegionId | undefined;
}) {
  return (
    <div className="text-center">
      <svg data-character={name} viewBox="0 0 200 400" className="h-[270px] w-full sm:h-[400px] sm:w-[200px]" aria-hidden="true">
        {/* legs and feet */}
        <rect x="72" y="254" width="26" height="100" rx="13" fill={skin} />
        <rect x="102" y="254" width="26" height="100" rx="13" fill={skin} />
        <ellipse cx="85" cy="354" rx="19" ry="10" fill={skinShade} />
        <ellipse cx="115" cy="354" rx="19" ry="10" fill={skinShade} />
        {/* arms and hands */}
        <rect x="38" y="126" width="20" height="126" rx="10" fill={skin} />
        <rect x="142" y="126" width="20" height="126" rx="10" fill={skin} />
        <circle cx="48" cy="262" r="11" fill={skin} />
        <circle cx="152" cy="262" r="11" fill={skin} />
        {/* neck and torso */}
        <rect x="91" y="98" width="18" height="24" rx="6" fill={skinShade} />
        <rect x="62" y="118" width="76" height="140" rx="18" fill={skin} />
        {/* swimsuit top and underwear keep private areas covered */}
        <rect x="62" y="224" width="76" height="32" rx="12" fill={outfit} />
        <rect x="62" y="146" width="76" height="24" rx="12" fill={outfit} />
        {/* head and face */}
        <circle cx="100" cy="64" r="38" fill={skin} />
        <path d="M62,64 a38,38 0 0 1 76,0 z" fill={hair} />
        <circle cx="87" cy="72" r="4" fill="#2b2320" />
        <circle cx="113" cy="72" r="4" fill="#2b2320" />
        <path d="M87,86 q13,10 26,0" stroke="#2b2320" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="76" cy="82" r="5" fill={skinShade} opacity="0.5" />
        <circle cx="124" cy="82" r="5" fill={skinShade} opacity="0.5" />
        {/* interactive zones */}
        {zoneShapes.map((z) => {
          const active = hovered === z.id || targetRegion === z.id;
          const strokeClass = z.emphasize ? "stroke-stop" : active ? "stroke-foreground" : "";
          return (
            <path
              key={z.id}
              d={z.d}
              data-region={z.id}
              fill="transparent"
              strokeWidth={z.emphasize || active ? 3 : 0}
              strokeDasharray="6 5"
              className={`cursor-pointer [pointer-events:fill] ${strokeClass} ${active ? "fill-primary/20" : ""}`}
              onClick={() => onActivate(z.id)}
            />
          );
        })}
        {placements.filter((p) => p.character === name).map((p) => (
          <g key={p.region} className="pointer-events-none" data-placed-region={p.region} data-placed-color={p.color}>
            <circle cx={markerPositions[p.region][0]} cy={markerPositions[p.region][1]} r="12" className={`${p.color === "green" ? "fill-go" : p.color === "yellow" ? "fill-caution" : "fill-stop"} stroke-card`} strokeWidth="2" />
            <text x={markerPositions[p.region][0]} y={markerPositions[p.region][1] + 4} textAnchor="middle" className="fill-foreground text-[11px] font-bold">{p.color.charAt(0).toUpperCase()}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-sm font-bold">{name}</p>
    </div>
  );
}

function PlayHeader({ levelLabel, points, stars, progressPct }: { levelLabel: string; points: number; stars: boolean[]; progressPct: number }) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-lilac px-3 py-1 text-xs font-bold text-lilac-foreground">{levelLabel}</span>
        <span className="flex items-center gap-1 text-sm font-bold">
          <Trophy className="h-4 w-4 text-warm" aria-hidden /> {points} points
        </span>
        <span className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <Star key={i} className={`h-5 w-5 ${stars[i] ? "fill-warm text-warm" : "text-muted-foreground"}`} aria-label={stars[i] ? `Star ${i + 1} earned` : `Star ${i + 1} not yet earned`} />
          ))}
        </span>
        <Link to="/ajuda" className="inline-flex items-center gap-1 text-xs font-bold text-primary underline">
          <LifeBuoy className="h-3.5 w-3.5" aria-hidden /> Need help now?
        </Link>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Game progress">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}

function FeedbackBox({ feedback, onNext, nextLabel }: { feedback: Feedback | null; onNext?: () => void; nextLabel?: string }) {
  if (!feedback) return null;
  const tone =
    feedback.kind === "correct"
      ? "bg-secondary text-secondary-foreground"
      : feedback.kind === "retry"
        ? "bg-accent text-accent-foreground"
        : "bg-sky text-sky-foreground";
  const Icon = feedback.kind === "correct" ? CheckCircle2 : feedback.kind === "retry" ? RotateCcw : Info;
  return (
    <div aria-live="polite" className={`mt-4 rounded-2xl p-4 ${tone}`}>
      <p className="flex items-start gap-2 font-bold">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        {feedback.text}
      </p>
      {feedback.kind === "correct" && onNext && (
        <Button type="button" onClick={onNext} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          {nextLabel ?? "Next"} <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      )}
      {feedback.kind === "retry" && <p className="mt-2 text-sm">No worries — try again. You cannot lose here.</p>}
    </div>
  );
}

export function TouchTrafficLight() {
  const activityRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [points, setPoints] = useState(0);
  const [stars, setStars] = useState<boolean[]>([false, false, false]);
  const [l1Step, setL1Step] = useState(0);
  const [l2Step, setL2Step] = useState(0);
  const [l3Step, setL3Step] = useState(0);
  const [trustedPicked, setTrustedPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedColor, setSelectedColor] = useState<TrafficColor | null>(null);
  const [drag, setDrag] = useState<{ color: TrafficColor; x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [showTrustedPanel, setShowTrustedPanel] = useState(false);
  const attempts = useRef(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragMoved = useRef(false);
  const activePointer = useRef<number | null>(null);
  useEffect(() => {
    if (phase === "intro" || phase === "final") return;
    activityRef.current?.focus({ preventScroll: true });
    activityRef.current?.scrollIntoView({ block: "start" });
  }, [phase, l1Step, l2Step, l3Step]);
  useEffect(() => {
    if (feedback?.kind === "correct" || feedback?.kind === "retry") {
      feedbackRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [feedback]);
  const hitRegion = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest("[data-region]");
    const region = REGIONS.find((r) => r.id === el?.getAttribute("data-region"))?.id;
    const character = el?.closest("[data-character]")?.getAttribute("data-character");
    return region && character ? { region, character } : null;
  };
  const clearDrag = () => {
    activePointer.current = null;
    setDrag(null);
    setHovered(null);
  };
  const moveDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== e.pointerId) return;
    const start = dragStart.current;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) dragMoved.current = true;
    setDrag((d) => d ? { ...d, x: e.clientX, y: e.clientY } : null);
    setHovered(hitRegion(e.clientX, e.clientY)?.region ?? null);
  };

  const addPoints = () => {
    setPoints((p) => p + (attempts.current === 0 ? 10 : 5));
    attempts.current = 0;
  };

  const activate = (color: TrafficColor | null, region: RegionId, character = "Sam") => {
    if (feedback?.kind === "correct") return;
    if (!color) {
      setFeedback({ kind: "info", text: "First pick a circle: green, yellow or red." });
      return;
    }
    const place = () => setPlacements((prev) => [...prev.filter((p) => p.region !== region || p.character !== character), { color, region, character }]);
    if (phase === "l1") {
      const task = l1Tasks[l1Step];
      if (!task) return;
      if (region === task.target && task.requiresRed && color !== "red") {
        attempts.current += 1;
        setFeedback({ kind: "retry", text: "Right place! This is a private area, so use the red circle: nobody should touch it without your consent." });
      } else if (region === task.target) {
        place();
        addPoints();
        setFeedback({ kind: "correct", text: task.feedback });
      } else {
        attempts.current += 1;
        setFeedback({ kind: "retry", text: "Not quite — try another body part. Take your time!" });
      }
      return;
    }
    if (phase !== "l2") return;
    const sit = l2Situations[l2Step];
    if (!sit) return;
    if (color !== sit.color) {
      attempts.current += 1;
      setFeedback({ kind: "retry", text: "Not quite. Ask yourself: is this touch welcome (green), something to pause and check (yellow), or unsafe (red)? Try again!" });
      return;
    }
    const regionFits = region === sit.region || (sit.color === "red" && isPrivate(sit.region) && isPrivate(region));
    if (!regionFits) {
      attempts.current += 1;
      setFeedback({ kind: "info", text: "Right color! Now place it on the body area the situation is about." });
      return;
    }
    place();
    addPoints();
    setFeedback({ kind: "correct", text: `Great job! ${sit.feedback}` });
  };

  const awardStar = (i: number) => setStars((prev) => prev.map((s, idx) => (idx === i ? true : s)));

  const next = () => {
    setFeedback(null);
    setSelectedColor(null);
    attempts.current = 0;
    if (phase === "l1") {
      if (l1Step < l1Tasks.length - 1) setL1Step(l1Step + 1);
      else {
        awardStar(0);
        setPlacements([]);
        setPhase("l2");
        setFeedback({ kind: "info", text: "Level 1 complete — you earned a star! Now: My Boundaries." });
      }
    } else if (phase === "l2") {
      if (l2Step < l2Situations.length - 1) setL2Step(l2Step + 1);
      else {
        awardStar(1);
        setPhase("l3");
        setFeedback({ kind: "info", text: "Level 2 complete — another star! Now: Staying Safe." });
      }
    } else if (phase === "l3") {
      if (l3Step < scenarios.length - 1) setL3Step(l3Step + 1);
      else setPhase("trusted");
    }
  };

  const answerScenario = (i: number) => {
    const sc = scenarios[l3Step];
    if (!sc || feedback?.kind === "correct") return;
    if (i === sc.answer) {
      addPoints();
      setFeedback({ kind: "correct", text: sc.feedback });
    } else {
      attempts.current += 1;
      setFeedback({ kind: "retry", text: "Not quite — there is always a way to stay safer. Try another answer." });
    }
  };

  const checkTrusted = () => {
    if (feedback?.kind === "correct") return;
    const safeIds = trustedOptions.filter((o) => o.safe).map((o) => o.id);
    const ok = trustedPicked.length === safeIds.length && safeIds.every((id) => trustedPicked.includes(id));
    if (ok) {
      addPoints();
      setFeedback({ kind: "correct", text: "Great choices! Trusted adults are people you know who respect you, listen to you and never ask you to keep secrets. You can go to any of them for help." });
    } else {
      attempts.current += 1;
      setFeedback({ kind: "retry", text: "Look again: a trusted adult is someone you know who respects you and never asks you to keep secrets or gives you gifts in exchange for something." });
    }
  };

  const finish = () => {
    awardStar(2);
    setPhase("final");
    setFeedback(null);
  };

  const restart = () => {
    setPhase("intro");
    setPoints(0);
    setStars([false, false, false]);
    setL1Step(0);
    setL2Step(0);
    setL3Step(0);
    setTrustedPicked([]);
    setFeedback(null);
    setSelectedColor(null);
    setShowTrustedPanel(false);
    setPlacements([]);
    clearDrag();
    attempts.current = 0;
  };

  const progressPct = (() => {
    let done = 0;
    if (phase === "intro") done = 0;
    else if (phase === "l1") done = l1Step;
    else if (phase === "l2") done = l1Tasks.length + l2Step;
    else if (phase === "l3") done = l1Tasks.length + l2Situations.length + l3Step;
    else if (phase === "trusted") done = l1Tasks.length + l2Situations.length + scenarios.length;
    else done = l1Tasks.length + l2Situations.length + scenarios.length + 1;
    return Math.round((done / (l1Tasks.length + l2Situations.length + scenarios.length + 1)) * 100);
  })();

  const levelLabel =
    phase === "l1" ? "Level 1 — My Body" : phase === "l2" ? "Level 2 — My Boundaries" : "Level 3 — Staying Safe";

  const toggleTrusted = (id: string) =>
    setTrustedPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (phase === "intro") {
    const instructions =
      "Touch Traffic Light. Learn about your body, your boundaries, and your right to feel safe. Green means a safe or welcome touch. Yellow means pause and check your boundaries and consent. Red means an unsafe or inappropriate touch: seek help. Read each situation, then drag a colored circle onto the body area it is about, or tap a circle and then tap a body part. You will get a friendly explanation after every answer, and you can always try again. There is no way to lose this game.";
    return (
      <div>
      <p className="text-3xl font-semibold">Three levels, stars and friendly explanations — no way to lose.</p>
      <p className="mt-1 text-muted-foreground">Green, yellow or red: learn what each color means before you start.</p>
        <ListenButton text={instructions} className="mt-3" />
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {(Object.keys(colorMeta) as TrafficColor[]).map((c) => (
            <li key={c} className={`flex items-center gap-3 rounded-2xl p-3 ${colorMeta[c].chip}`}>
              <span className="h-8 w-8 shrink-0 rounded-full bg-white/40" aria-hidden />
              <span className="text-sm font-bold">
                {colorMeta[c].label}
                <br />
                <span className="font-normal">{colorMeta[c].hint}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="card-base mt-4 space-y-2 p-4 text-sm">
          <p className="font-bold">How to play</p>
          <p>1. Read the situation.</p>
          <p>2. Pick a circle: drag it onto the body area on either character, or tap the circle and then tap a body part. You can also use the body-part buttons.</p>
          <p>3. You get a friendly explanation after every answer.</p>
          <p className="text-muted-foreground">Take your time. If an answer is not right, you can always try again — no rush, no pressure, and nothing about you is saved.</p>
        </div>
        <button
          type="button"
          onClick={() => setPhase("l1")}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft"
        >
          Start the game <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  if (phase === "final") {
    return (
      <div>
        <div className="card-base p-6 text-center">
          <Trophy className="mx-auto h-10 w-10 text-warm" aria-hidden />
          <h2 className="mt-2 text-2xl font-semibold">YOU ARE THE BOSS OF YOUR BODY!</h2>
          <p className="mt-2 flex items-center justify-center gap-2 font-bold">
            <Trophy className="h-4 w-4 text-warm" aria-hidden /> {points} points
            <span className="ml-2 flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <Star key={i} className={`h-5 w-5 ${stars[i] ? "fill-warm text-warm" : "text-muted-foreground"}`} aria-hidden />
              ))}
            </span>
          </p>
          <ul className="mx-auto mt-4 max-w-md space-y-2 text-left">
            {[
              "Your body deserves respect.",
              "You can say NO to unwanted touching.",
              "You can change your mind at any time.",
              "You can talk to a trusted adult.",
              "If someone hurts you or crosses your boundaries, it is never your fault.",
            ].map((m) => (
              <li key={m} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                {m}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setShowTrustedPanel((s) => !s)} className="rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-soft">
              Meet My Trusted Adults
            </button>
            <Link to="/biblioteca/$slug" params={{ slug: "consent" }} className="rounded-full border bg-card px-5 py-2.5 font-bold">
              Learn More
            </Link>
            <button type="button" onClick={restart} className="rounded-full border bg-card px-5 py-2.5 font-bold">
              Play again
            </button>
          </div>
        </div>
        {showTrustedPanel && (
          <div className="card-base mt-4 p-4">
            <h3 className="text-lg font-semibold">My trusted adults</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Write the names of grown-ups you could go to if something feels wrong. This list stays on your screen only: nothing is saved or sent anywhere, and it disappears when you leave this page.
            </p>
            <div className="mt-3 grid gap-2">
              {[1, 2, 3].map((n) => (
                <label key={n} className="text-sm font-bold">
                  Trusted adult {n}
                  <input type="text" name={`trusted-${n}`} className="mt-1 w-full rounded-xl border bg-card px-3 py-2 text-base font-normal" autoComplete="off" />
                </label>
              ))}
            </div>
          </div>
        )}
        <p className="mt-6 text-center text-sm">
          <Link to="/ajuda" className="font-bold text-primary underline">
            If you need help now, open the Help section.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div ref={activityRef} tabIndex={-1} className="scroll-mt-20 outline-none">
      <PlayHeader levelLabel={levelLabel} points={points} stars={stars} progressPct={progressPct} />

      {(phase === "l1" || phase === "l2") && (
        <div>
          {phase === "l1" ? (
            <p className="text-lg font-bold">{l1Tasks[l1Step]?.prompt}</p>
          ) : (
            <div className="card-base p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Situation {l2Step + 1} of {l2Situations.length}
              </p>
              <p className="mt-1 text-lg font-bold">{l2Situations[l2Step]?.text}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Which color fits, and which body area is it about? Drag the circle onto a character, or tap a circle and then tap a body part.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {(["green", "yellow", "red"] as TrafficColor[]).map((c) => (
              <Button
                variant="ghost"
                key={c}
                type="button"
                data-color={c}
                aria-pressed={selectedColor === c}
                aria-label={`${colorMeta[c].label}: ${colorMeta[c].hint}`}
                onPointerDown={(e) => {
                  if (!e.isPrimary || e.button !== 0 || feedback?.kind === "correct") return;
                  activePointer.current = e.pointerId;
                  dragStart.current = { x: e.clientX, y: e.clientY };
                  dragMoved.current = false;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setSelectedColor(c);
                  setDrag({ color: c, x: e.clientX, y: e.clientY });
                }}
                onPointerMove={moveDrag}
                onPointerUp={(e) => {
                  if (activePointer.current !== e.pointerId) return;
                  const target = hitRegion(e.clientX, e.clientY);
                  if (dragMoved.current && target) activate(c, target.region, target.character);
                  else if (dragMoved.current) setFeedback({ kind: "info", text: "Place the circle directly on a body region. Try again." });
                  clearDrag();
                }}
                onPointerCancel={clearDrag}
                onLostPointerCapture={clearDrag}
                onClick={(e) => {
                  if (dragMoved.current) {
                    dragMoved.current = false;
                    return;
                  }
                  if (e.detail === 0) setSelectedColor(c);
                }}
                className={`h-16 w-16 shrink-0 touch-none select-none rounded-full p-0 text-sm font-bold shadow-soft cursor-grab active:cursor-grabbing ${colorMeta[c].chip} ${selectedColor === c ? "ring-4 ring-ring" : ""}`}
              >
                {colorMeta[c].label}
              </Button>
            ))}
          </div>
          <p className="mt-2 min-h-10 text-center text-sm text-muted-foreground">
            {selectedColor
              ? `${colorMeta[selectedColor].label} is picked. Now choose where it goes.`
              : "Pick a circle, then a body part — or drag the circle onto a body part."}
          </p>
          <ListenButton text={phase === "l1" ? l1Tasks[l1Step]?.prompt ?? "" : l2Situations[l2Step]?.text ?? ""} />
          <div className="mt-3 grid grid-cols-2 items-end justify-items-center gap-2 sm:gap-8">
            <Character name="Sam" skin="#b97a56" skinShade="#a5684a" hair="#2f2318" outfit="#e8b13c" hovered={hovered} targetRegion={phase === "l1" ? l1Tasks[l1Step]?.target : l2Situations[l2Step]?.region} placements={placements} onActivate={(r) => activate(selectedColor, r, "Sam")} />
            <Character name="Alex" skin="#f0c39b" skinShade="#ddae87" hair="#5d3a1a" outfit="#4f8a8b" hovered={hovered} targetRegion={phase === "l1" ? l1Tasks[l1Step]?.target : l2Situations[l2Step]?.region} placements={placements} onActivate={(r) => activate(selectedColor, r, "Alex")} />
          </div>
          {drag && <div aria-hidden="true" data-drag-preview className={`pointer-events-none fixed z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-card font-bold shadow-soft ${colorMeta[drag.color].chip}`} style={{ left: drag.x - 24, top: drag.y - 24 }}>{drag.color.charAt(0).toUpperCase()}</div>}
          <div ref={feedbackRef}>
            <FeedbackBox feedback={feedback} onNext={next} />
            {feedback && <ListenButton text={feedback.text} className="mt-2" />}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-bold">Choose a body part</summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <Button variant="outline" key={r.id} type="button" onClick={() => activate(selectedColor, r.id)} className="rounded-full border bg-card px-3 py-1.5 text-sm font-bold">
                  {r.label}
                </Button>
              ))}
            </div>
          </details>
        </div>
      )}

      {phase === "l3" && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Situation {l3Step + 1} of {scenarios.length}
          </p>
          <p className="mt-1 text-lg font-bold">{scenarios[l3Step]?.q}</p>
          <div className="mt-3 grid gap-2">
            {scenarios[l3Step]?.options.map((opt, i) => (
              <button key={opt} type="button" onClick={() => answerScenario(i)} className="card-base p-3 text-left font-bold transition hover:-translate-y-0.5">
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "trusted" && (
        <div>
          <p className="text-lg font-bold">Who could be a trusted adult?</p>
          <p className="text-sm text-muted-foreground">Choose every person who could be a safe adult to go to for help. You can change your choices before checking.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {trustedOptions.map((o) => (
              <Button variant="outline" key={o.id} type="button" disabled={feedback?.kind === "correct"} aria-pressed={trustedPicked.includes(o.id)} onClick={() => toggleTrusted(o.id)} className={`card-base h-auto whitespace-normal justify-start p-3 text-left font-bold transition ${trustedPicked.includes(o.id) ? "ring-2 ring-ring" : ""}`}>
                {o.label}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            onClick={checkTrusted}
            disabled={trustedPicked.length === 0 || feedback?.kind === "correct"}
            className="mt-3 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-soft disabled:opacity-50"
          >
            Check my choices
          </Button>
        </div>
      )}

      {phase !== "l1" && phase !== "l2" && (
        <div ref={feedbackRef}>
          <FeedbackBox feedback={feedback} onNext={phase === "trusted" ? finish : next} nextLabel={phase === "trusted" ? "Finish Game" : "Next"} />
          {feedback && <ListenButton text={feedback.text} className="mt-2" />}
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to="/biblioteca/$slug" params={{ slug: "consent" }} className="font-bold text-primary underline">
          Learn More about consent
        </Link>
      </p>
    </div>
  );
}
