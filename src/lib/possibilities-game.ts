// Pure rules for the "Expand Your Possibilities" game. Feedback is pre-written
// (reviewable by health professionals); nothing is sent to a server or stored.
// One shared scenario pool for all players — no age separation.

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
  "Who could you talk to?",
  "Is there another way to see it?",
  "What would you need to know?",
  "What could you try differently?",
  "Do you need help with this?",
];

export const pauseOption: GameOption = { id: "pause", text: "Take a break, come back later.", category: "feelings" };

export const scenarios: Scenario[] = [
  {
    id: "friends-photos",
    title: "Left out",
    situation: "Your friends posted photos of a hangout without you. You think: “Nobody really wants me there.”",
    options: [
      { id: "a", text: "One moment isn't the whole story.", category: "perspective" },
      { id: "b", text: "Talk to a friend I trust.", category: "talk" },
      { id: "c", text: "Was it just this once?", category: "perspective" },
      { id: "d", text: "Meet people with my interests.", category: "practical" },
      { id: "e", text: "Feel upset first, decide later.", category: "feelings" },
      { id: "f", text: "Nobody will ever like me.", stuckThought: true },
      { id: "g", text: "Tell a trusted adult if it repeats.", category: "boundary" },
      { id: "h", text: "Name what I need from friends.", category: "feelings" },
    ],
  },
  {
    id: "test-fail",
    title: "A hard test",
    situation: "You got a low grade on a test. You think: “I'm bad at school. I'll fail everything.”",
    options: [
      { id: "a", text: "It's okay to feel disappointed.", category: "feelings" },
      { id: "b", text: "Ask the teacher what I missed.", category: "practical" },
      { id: "c", text: "Remember something that went well.", category: "perspective" },
      { id: "d", text: "Study with a friend or family.", category: "talk" },
      { id: "e", text: "Stop trying, it won't help.", stuckThought: true },
      { id: "f", text: "Try short study sessions.", category: "practical" },
      { id: "g", text: "Talk to the school counselor.", category: "professional" },
    ],
  },
  {
    id: "group-chat",
    title: "The group chat",
    situation: "Someone in a group chat mocks a photo you posted. You think: “Everyone is laughing at me.”",
    options: [
      { id: "a", text: "Take a break from the chat.", category: "boundary" },
      { id: "b", text: "Tell a trusted adult.", category: "talk" },
      { id: "c", text: "One comment isn't everyone's view.", category: "perspective" },
      { id: "d", text: "Save screenshots, just in case.", category: "practical" },
      { id: "e", text: "Never post again and hide.", stuckThought: true },
      { id: "f", text: "Block or report them.", category: "boundary" },
      { id: "g", text: "Name my feeling: sad, angry…", category: "feelings" },
    ],
  },
  {
    id: "future-pressure",
    title: "Future pressure",
    situation: "Everyone seems to know their plans after school. You don't. You think: “I'm already behind.”",
    options: [
      { id: "a", text: "Many people change plans.", category: "perspective" },
      { id: "b", text: "List things I enjoy.", category: "practical" },
      { id: "c", text: "Ask an older person how they chose.", category: "talk" },
      { id: "d", text: "Look up courses or jobs.", category: "practical" },
      { id: "e", text: "It's okay to feel unsure.", category: "feelings" },
      { id: "f", text: "I'll never be good at anything.", stuckThought: true },
      { id: "g", text: "Say no to decide-now pressure.", category: "boundary" },
      { id: "h", text: "Talk to a career counselor.", category: "professional" },
    ],
  },
  {
    id: "relationship-pressure",
    title: "Pressure in a relationship",
    situation: "The person you date wants your passwords and hates when you see friends. You think: “If I say no, they'll leave.”",
    options: [
      { id: "a", text: "Caring partners respect privacy.", category: "perspective" },
      { id: "b", text: "My passwords stay private.", category: "boundary" },
      { id: "c", text: "Tell a friend or trusted adult.", category: "talk" },
      { id: "d", text: "Notice my feeling: anxious, trapped?", category: "feelings" },
      { id: "e", text: "Give in so they don't get upset.", stuckThought: true },
      { id: "f", text: "Learn about healthy relationships.", category: "practical" },
      { id: "g", text: "If I feel scared, call a support line.", category: "professional" },
    ],
  },
];

export function categoriesOf(scenario: Scenario, selected: OptionId[]): Category[] {
  const set = new Set<Category>();
  for (const o of [...scenario.options, pauseOption]) if (selected.includes(o.id) && o.category) set.add(o.category);
  return [...set];
}

export function hasStuckThought(scenario: Scenario, selected: OptionId[]): boolean {
  return scenario.options.some((o) => o.stuckThought && selected.includes(o.id));
}

export const stuckThoughtFeedback =
  "When you're hurt, it can feel like things will always be this way. But one painful moment doesn't tell the whole story. Want to look for another possibility?";

export function feedbackFor(scenario: Scenario, selected: OptionId[]): string {
  const cats = categoriesOf(scenario, selected);
  if (cats.length === 0) return hasStuckThought(scenario, selected) ? stuckThoughtFeedback : "Take your time. Pick anything that might help, even a small step.";
  const names = cats.map((c) => categoryLabels[c].toLowerCase());
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  return `This is a hard situation, and there's no single right answer. You found paths like ${list}. One is enough to start.`;
}

export type Achievement = "new-paths" | "perspectives" | "support" | "next-step";
export const achievementLabels: Record<Achievement, { title: string; text: string }> = {
  "new-paths": { title: "New Paths", text: "You found another possible approach." },
  perspectives: { title: "Different Perspectives", text: "You saw the situation another way." },
  support: { title: "Support Seeker", text: "You found someone or a service that could help." },
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
