/**
 * Touch Traffic Light — interactive body safety and consent game.
 * Educational only; never stores or sends anything the player does.
 */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Info, LifeBuoy, RotateCcw, Trophy } from "lucide-react";
import { ListenButton } from "@/components/ListenButton";
import { Button } from "@/components/ui/button";
import { BODY_REGIONS as REGIONS, PRIVATE_REGIONS, matchesBodyColor, type RegionId, type TrafficColor } from "@/lib/body-game";
export { PRIVATE_REGIONS } from "@/lib/body-game";

type Phase = "intro" | "play" | "final";
type Feedback = { kind: "correct" | "retry" | "info"; text: string };
type Placement = { color: TrafficColor; region: RegionId; character: string };

const colorMeta: Record<TrafficColor, { label: string; hint: string; chip: string }> = {
  green: { label: "Green", hint: "Usually exposed parts", chip: "bg-go text-go-foreground" },
  yellow: { label: "Yellow", hint: "Attention zone", chip: "bg-caution text-caution-foreground" },
  red: { label: "Red", hint: "Private parts", chip: "bg-stop text-stop-foreground" },
};

/** Educational message shown after each correct placement, per color. */
const COLOR_FEEDBACK: Record<TrafficColor, string> = {
  green: "Well done! Remember to respect each person's boundaries.",
  yellow: "Attention! You can say no to a touch that makes you feel uncomfortable.",
  red: "Well done! Your private parts deserve protection. You can ask for help if something happens.",
};

const markerPositions: Record<RegionId, [number, number]> = {
  head: [100, 44], face: [100, 80], shoulders: [100, 131], arms: [48, 194],
  chest: [100, 164], abdomen: [100, 204], private: [100, 240], buttocks: [73, 240],
  upperBack: [100, 165], lowerBack: [100, 206], thighs: [85, 278], legs: [85, 326], feet: [85, 356],
};

const frontZones: { id: RegionId; d: string; emphasize?: boolean }[] = [
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
    id: "thighs",
    d: "M72,258 h26 v44 h-26 z M102,258 h26 v44 h-26 z",
  },
  { id: "legs", d: "M72,302 h26 v42 h-26 z M102,302 h26 v42 h-26 z" },
  { id: "feet", d: "M66,344 h38 v20 h-38 z M104,344 h30 v20 h-30 z" },
];

const backZones: { id: RegionId; d: string; emphasize?: boolean }[] = [
  { id: "head", d: "M62,64 A38,38 0 0 1 138,64 Z" },
  { id: "shoulders", d: "M62,118 h76 v26 h-76 z" },
  { id: "upperBack", d: "M62,144 h76 v42 h-76 z" },
  { id: "lowerBack", d: "M62,186 h76 v40 h-76 z" },
  { id: "buttocks", d: "M70,224 h60 v34 h-60 z", emphasize: true },
  {
    id: "arms",
    d: "M36,124 h24 v128 h-24 z M140,124 h24 v128 h-24 z M37,262 a11,11 0 1 0 22,0 a11,11 0 1 0 -22,0 M141,262 a11,11 0 1 0 22,0 a11,11 0 1 0 -22,0",
  },
  {
    id: "thighs",
    d: "M72,258 h26 v44 h-26 z M102,258 h26 v44 h-26 z",
  },
  { id: "legs", d: "M72,302 h26 v42 h-26 z M102,302 h26 v42 h-26 z" },
  { id: "feet", d: "M66,344 h38 v20 h-38 z M104,344 h30 v20 h-30 z" },
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
  view = "front",
}: {
  name: string;
  skin: string;
  skinShade: string;
  hair: string;
  outfit: string;
  hovered: string | null;
  placements: Placement[];
  onActivate: (region: RegionId) => void;
  view?: "front" | "back";
}) {
  const zones = view === "back" ? backZones : frontZones;
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
        {view === "back" ? (
          <>
            <circle cx="100" cy="64" r="38" fill={hair} />
            <path d="M78,96 q22,14 44,0" stroke={skin} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="100" cy="64" r="38" fill={skin} />
            <path d="M62,64 a38,38 0 0 1 76,0 z" fill={hair} />
            <circle cx="87" cy="72" r="4" fill="#2b2320" />
            <circle cx="113" cy="72" r="4" fill="#2b2320" />
            <path d="M87,86 q13,10 26,0" stroke="#2b2320" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="76" cy="82" r="5" fill={skinShade} opacity="0.5" />
            <circle cx="124" cy="82" r="5" fill={skinShade} opacity="0.5" />
          </>
        )}
        {/* interactive zones */}
        {zones.map((z) => {
          const active = hovered === z.id;
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

function FeedbackBox({ feedback }: { feedback: Feedback | null }) {
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
      {feedback.kind === "retry" && <p className="mt-2 text-sm">No worries — try again. You cannot lose here.</p>}
    </div>
  );
}

export function TouchTrafficLight() {
  const activityRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedColor, setSelectedColor] = useState<TrafficColor | null>(null);
  const [drag, setDrag] = useState<{ color: TrafficColor; x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragMoved = useRef(false);
  const activePointer = useRef<number | null>(null);

  const coveredCount = new Set(placements.map((p) => p.region)).size;
  const totalRegions = REGIONS.length;
  const progressPct = Math.round((coveredCount / totalRegions) * 100);

  useEffect(() => {
    if (phase !== "play") return;
    activityRef.current?.focus({ preventScroll: true });
    activityRef.current?.scrollIntoView({ block: "start" });
  }, [phase]);
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

  const activate = (color: TrafficColor | null, region: RegionId, character = "Sam") => {
    if (!color) {
      setFeedback({ kind: "info", text: "First pick a circle: green, yellow or red." });
      return;
    }
    if (placements.some((p) => p.region === region)) {
      setFeedback({ kind: "info", text: "This body part already has its color. Choose another one!" });
      return;
    }
    if (!matchesBodyColor(region, color)) {
      const expected = REGIONS.find((r) => r.id === region)?.color;
      setFeedback({
        kind: "retry",
        text: `Not quite — this body part is ${expected}. Think: private parts are red, attention zones are yellow, and usually exposed parts are green. Try again!`,
      });
      return;
    }
    const nextPlacements = [...placements, { color, region, character }];
    setPlacements(nextPlacements);
    setFeedback({ kind: "correct", text: COLOR_FEEDBACK[color] });
    if (new Set(nextPlacements.map((p) => p.region)).size === totalRegions) {
      setPhase("final");
      setFeedback(null);
    }
  };

  const restart = () => {
    setPhase("intro");
    setFeedback(null);
    setSelectedColor(null);
    setPlacements([]);
    clearDrag();
  };

  if (phase === "intro") {
    const instructions =
      "Touch Traffic Light. Drag the colored circles onto the matching body parts of the characters — one of them is seen from the back. Red means private parts: genitals, chest and buttocks. Yellow means attention zones: face, abdomen, lower back and thighs. Green means usually exposed parts: head, shoulders, arms, hands, upper back, lower legs and feet. Colors are a learning tool, not a rule: nobody may disrespect your boundaries, even on green parts. You can always try again.";
    return (
      <div>
        <p className="text-3xl font-semibold">Cover every body part with the right color — no way to lose.</p>
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
          <p><strong>Red — private parts:</strong> genitals, chest and buttocks. Nobody may touch them without a legitimate care or health reason, with privacy, respect and your consent. Abuse is never your fault — find a trusted adult.</p>
          <p><strong>Yellow — attention:</strong> face, abdomen, lower back and thighs. You set the limits on who can touch you and when. If a touch feels uncomfortable, you can say no and ask for help.</p>
          <p><strong>Green — usually exposed:</strong> head, shoulders, arms, hands, upper back and feet. Friendly social touch can be okay here — always respecting your boundaries and consent.</p>
          <p className="text-muted-foreground">Colors are a learning tool, not an absolute rule: even on green parts, nobody may disrespect your boundaries. Medical and hygiene care can be necessary and must happen with respect, privacy and protection.</p>
        </div>
        <div className="card-base mt-4 space-y-2 p-4 text-sm">
          <p className="font-bold">How to play</p>
          <p>1. Drag a circle from the bottom onto a body part — or tap the circle, then a body part.</p>
          <p>2. Use each color as many times as you need to cover every part.</p>
          <p>3. You get a friendly message after every answer. Wrong answers can always be retried.</p>
        </div>
        <button
          type="button"
          onClick={() => setPhase("play")}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-soft"
        >
          Start the game
        </button>
      </div>
    );
  }

  if (phase === "final") {
    const finalText =
      "Congratulations! You learned more about your body, your boundaries and how to protect yourself! If any touch makes you uncomfortable or someone crosses your boundaries, talk to a trusted adult or a health professional.";
    return (
      <div>
        <div className="card-base p-6 text-center">
          <Trophy className="mx-auto h-12 w-12 text-warm" aria-hidden />
          <h2 className="mt-2 text-2xl font-semibold">Congratulations!</h2>
          <p className="mt-2 font-bold">You learned more about your body, your boundaries and how to protect yourself!</p>
          <p className="mx-auto mt-3 max-w-md text-sm">
            If any touch makes you uncomfortable or someone crosses your boundaries, talk to a trusted adult or a health professional.
          </p>
          <ListenButton text={finalText} className="mt-3" />
          <ul className="mx-auto mt-4 max-w-md space-y-2 text-left text-sm">
            {[
              "Your body deserves respect.",
              "You can say NO to unwanted touching.",
              "You can change your mind at any time.",
              "If someone hurts you or crosses your boundaries, it is never your fault.",
            ].map((m) => (
              <li key={m} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                {m}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={restart} className="rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-soft">
              Play again
            </button>
            <Link to="/biblioteca/$slug" params={{ slug: "consent" }} className="rounded-full border bg-card px-5 py-2.5 font-bold">
              Learn More
            </Link>
          </div>
        </div>
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
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-lilac px-3 py-1 text-xs font-bold text-lilac-foreground">
            {coveredCount} of {totalRegions} body parts
          </span>
          <button type="button" onClick={restart} className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-xs font-bold">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restart
          </button>
          <Link to="/ajuda" className="inline-flex items-center gap-1 text-xs font-bold text-primary underline">
            <LifeBuoy className="h-3.5 w-3.5" aria-hidden /> Need help now?
          </Link>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Game progress">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <p className="text-lg font-bold">Drag each colored circle onto the matching body parts.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the same color as many times as you need. Placing on either character counts.
      </p>

      <div className="mt-3 grid grid-cols-3 items-end justify-items-center gap-1 sm:gap-8">
        <Character name="Sam" skin="#b97a56" skinShade="#a5684a" hair="#2f2318" outfit="#e8b13c" hovered={hovered} placements={placements} onActivate={(r) => activate(selectedColor, r, "Sam")} />
        <Character name="Alex" skin="#f0c39b" skinShade="#ddae87" hair="#5d3a1a" outfit="#4f8a8b" hovered={hovered} placements={placements} onActivate={(r) => activate(selectedColor, r, "Alex")} />
        <Character name="Chris" view="back" skin="#8a5a3b" skinShade="#75492e" hair="#1d1710" outfit="#7a6fc0" hovered={hovered} placements={placements} onActivate={(r) => activate(selectedColor, r, "Chris")} />
      </div>

      <div ref={feedbackRef}>
        <FeedbackBox feedback={feedback} />
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

      {/* Colored circles live at the bottom of the screen */}
      <div className="sticky bottom-20 z-10 mt-4 rounded-3xl border bg-card/95 p-3 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(["green", "yellow", "red"] as TrafficColor[]).map((c) => (
            <Button
              variant="ghost"
              key={c}
              type="button"
              data-color={c}
              aria-pressed={selectedColor === c}
              aria-label={`${colorMeta[c].label}: ${colorMeta[c].hint}`}
              onPointerDown={(e) => {
                if (!e.isPrimary || e.button !== 0) return;
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
        <p className="mt-2 min-h-5 text-center text-sm text-muted-foreground">
          {selectedColor
            ? `${colorMeta[selectedColor].label} is picked. Now choose where it goes.`
            : "Pick a circle, then a body part — or drag the circle onto a body part."}
        </p>
      </div>
      {drag && <div aria-hidden="true" data-drag-preview className={`pointer-events-none fixed z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-card font-bold shadow-soft ${colorMeta[drag.color].chip}`} style={{ left: drag.x - 24, top: drag.y - 24 }}>{drag.color.charAt(0).toUpperCase()}</div>}

      <p className="mt-6 text-center text-sm">
        <Link to="/biblioteca/$slug" params={{ slug: "consent" }} className="font-bold text-primary underline">
          Learn More about consent
        </Link>
      </p>
    </div>
  );
}
