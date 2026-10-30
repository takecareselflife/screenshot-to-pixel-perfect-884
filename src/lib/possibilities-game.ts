// Pure rules for the "Expand Your Possibilities" game. Feedback is pre-written
// (reviewable by health professionals); nothing is sent to a server or stored.

export type AgeGroup = "12-14" | "15-17";
export type Category = "feelings" | "practical" | "talk" | "perspective" | "boundary" | "professional";
export type OptionId = string;

export interface GameOption {
  id: OptionId;
  text: string;
  category?: Category;
  /** Hopeless "all-or-nothing" thought: answered gently, never penalized. */
  stuckThought?: boolean;
}

export interface Scenario {
  id: string;
  ages: AgeGroup[];
  title: string;
  situation: string;
  options: GameOption[];
}

export const categoryLabels: Record<Category, string> = {
  feelings: "Understanding my feelings",
  practical: "Taking a practical step",
  talk: "Talking to someone I trust",
  perspective: "Another way to look at it",
  boundary: "Setting a boundary",
  professional: "Asking for professional support",
};

export const hints = [
  "What could you do for yourself?",
  "Is there someone you trust who could help?",
  "Is there another way to look at the situation?",
  "What information might you need?",
  "Is there something you could try differently?",
  "Is this something you need help handling?",
];

export const pauseOption: GameOption = { id: "pause", text: "Take a break and come back when I feel ready.", category: "feelings" };

export const scenarios: Scenario[] = [
  {
    id: "friends-photos",
    ages: ["12-14", "15-17"],
    title: "Left out",
    situation: "You see photos of your friends hanging out without you. You start thinking, “Maybe nobody really wants me around.”",
    options: [
      { id: "a", text: "Remember that one situation doesn't tell the whole story about my friendships.", category: "perspective" },
      { id: "b", text: "Talk to a friend I trust about how I feel.", category: "talk" },
      { id: "c", text: "Think about whether this happened before or was a one-time thing.", category: "perspective" },
      { id: "d", text: "Find chances to connect with people who share my interests.", category: "practical" },
      { id: "e", text: "Give myself time to feel upset before deciding what to do.", category: "feelings" },
      { id: "f", text: "Decide that nobody will ever want to be my friend.", stuckThought: true },
      { id: "g", text: "If exclusion keeps happening, set boundaries or talk to a trusted adult.", category: "boundary" },
      { id: "h", text: "Ask myself what I need from friendships to feel respected and included.", category: "feelings" },
    ],
  },
  {
    id: "test-fail",
    ages: ["12-14"],
    title: "A hard test",
    situation: "You got a low grade on a test. You think, “I'm bad at school. I'm going to fail everything.”",
    options: [
      { id: "a", text: "Notice I feel disappointed — that's okay.", category: "feelings" },
      { id: "b", text: "Ask the teacher which parts I got wrong.", category: "practical" },
      { id: "c", text: "Remember a subject or task that went well for me.", category: "perspective" },
      { id: "d", text: "Ask a family member or friend to study with me.", category: "talk" },
      { id: "e", text: "Stop trying because it won't help.", stuckThought: true },
      { id: "f", text: "Try a new way of studying, like short sessions.", category: "practical" },
      { id: "g", text: "If school stress feels too heavy, talk to the school counselor.", category: "professional" },
    ],
  },
  {
    id: "group-chat",
    ages: ["12-14"],
    title: "The group chat",
    situation: "Someone in a group chat makes fun of a photo you posted. You think, “Everyone is laughing at me.”",
    options: [
      { id: "a", text: "Take a break from the chat for a while.", category: "boundary" },
      { id: "b", text: "Tell a trusted adult what happened.", category: "talk" },
      { id: "c", text: "Remember that one comment is not what everyone thinks.", category: "perspective" },
      { id: "d", text: "Save screenshots in case it keeps happening.", category: "practical" },
      { id: "e", text: "Never post anything again and hide from everyone.", stuckThought: true },
      { id: "f", text: "Block or report the person if it's mean.", category: "boundary" },
      { id: "g", text: "Name how I feel: embarrassed, sad, angry…", category: "feelings" },
    ],
  },
  {
    id: "future-pressure",
    ages: ["15-17"],
    title: "Future pressure",
    situation: "Everyone seems to know what they want to study or do after school. You don't, and you think, “I'm already behind in life.”",
    options: [
      { id: "a", text: "Recognize that many people change plans several times.", category: "perspective" },
      { id: "b", text: "Make a list of things I enjoy or am curious about.", category: "practical" },
      { id: "c", text: "Talk to someone older about how they decided.", category: "talk" },
      { id: "d", text: "Look for information on courses, jobs or short experiences.", category: "practical" },
      { id: "e", text: "Accept the uncertainty and the worry I feel right now.", category: "feelings" },
      { id: "f", text: "Conclude I'll never be good at anything.", stuckThought: true },
      { id: "g", text: "Say no to pressure to decide before I'm ready.", category: "boundary" },
      { id: "h", text: "Book a talk with a school or career counselor.", category: "professional" },
    ],
  },
  {
    id: "relationship-pressure",
    ages: ["15-17"],
    title: "Pressure in a relationship",
    situation: "The person you're dating keeps asking for your passwords and gets upset when you spend time with friends. You think, “If I say no, they'll leave and it'll be my fault.”",
    options: [
      { id: "a", text: "Remember that a caring relationship respects my privacy and friends.", category: "perspective" },
      { id: "b", text: "Say clearly that my passwords stay private.", category: "boundary" },
      { id: "c", text: "Talk with a friend or trusted adult about what's happening.", category: "talk" },
      { id: "d", text: "Notice how I feel when this happens — anxious, guilty, trapped?", category: "feelings" },
      { id: "e", text: "Give in to everything so they don't get upset.", stuckThought: true },
      { id: "f", text: "Look up information about healthy and controlling relationships.", category: "practical" },
      { id: "g", text: "If I feel scared or controlled, contact a health professional or support line.", category: "professional" },
    ],
  },
];

export function scenariosFor(age: AgeGroup): Scenario[] {
  return scenarios.filter((s) => s.ages.includes(age));
}

export function categoriesOf(scenario: Scenario, selected: OptionId[]): Category[] {
  const set = new Set<Category>();
  for (const o of [...scenario.options, pauseOption]) if (selected.includes(o.id) && o.category) set.add(o.category);
  return [...set];
}

export function hasStuckThought(scenario: Scenario, selected: OptionId[]): boolean {
  return scenario.options.some((o) => o.stuckThought && selected.includes(o.id));
}

export const stuckThoughtFeedback =
  "When you're hurt, it can feel like things will always be this way. But one painful moment doesn't tell you everything about your future. Would you like to explore another possibility?";

export function feedbackFor(scenario: Scenario, selected: OptionId[], age: AgeGroup): string {
  const cats = categoriesOf(scenario, selected);
  if (cats.length === 0) return hasStuckThought(scenario, selected) ? stuckThoughtFeedback : "Take your time. You can pick anything that might help, even a small step.";
  const names = cats.map((c) => categoryLabels[c].toLowerCase());
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  const open = age === "12-14" ? "That can really hurt." : "This is a hard situation, and there's no single right answer.";
  return `${open} You found ways that include ${list}. You don't have to figure everything out at once.`;
}

export type Achievement = "new-paths" | "perspectives" | "support" | "next-step";
export const achievementLabels: Record<Achievement, { title: string; text: string }> = {
  "new-paths": { title: "New Paths", text: "You discovered another possible approach." },
  perspectives: { title: "Different Perspectives", text: "You considered another way to understand the situation." },
  support: { title: "Support Seeker", text: "You identified someone or a service that could help." },
  "next-step": { title: "Next Step", text: "You chose a realistic action." },
};

/** Achievements reward exploration only; stuck thoughts never add or remove anything. */
export function achievementsFor(scenario: Scenario, firstPick: OptionId[], allPicks: OptionId[], nextSteps: OptionId[]): Achievement[] {
  const out: Achievement[] = [];
  const firstCats = new Set(categoriesOf(scenario, firstPick));
  const allCats = categoriesOf(scenario, allPicks);
  if (allCats.some((c) => !firstCats.has(c))) out.push("new-paths");
  if (allCats.includes("perspective")) out.push("perspectives");
  if (allCats.includes("talk") || allCats.includes("professional")) out.push("support");
  if (categoriesOf(scenario, nextSteps).length > 0) out.push("next-step");
  return out;
}

export const MAX_NEXT_STEPS = 2;
