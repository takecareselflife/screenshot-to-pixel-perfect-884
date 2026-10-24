/**
 * Demo assistant based on rules over the local knowledge base.
 * Ready to be swapped for an AI model with retrieval (RAG) in the future.
 */
import { articles } from "./data";

export type Reply = { text: string; sources: string[]; links: { to: string; label: string }[]; risk: boolean };

const riskWords = ["kill myself", "suicid", "hurt myself", "end my life", "die", "abuse", "rap", "forced me", "threat", "blackmail", "nude leak", "leaked", "afraid of"];

const topics: { keys: string[]; slug: string }[] = [
  { keys: ["condom", "pill", "birth control", "contracep", "pregnan", "iud"], slug: "contraception" },
  { keys: ["sti", "std", "hiv", "aids", "syphilis", "hpv", "test"], slug: "sti" },
  { keys: ["consent", "dating", "relationship", "jealous"], slug: "consent" },
  { keys: ["anxiety", "anxious", "depress", "sad", "alon", "stress"], slug: "mental-health" },
  { keys: ["bullying", "teased", "humilia"], slug: "bullying" },
  { keys: ["photo", "nude", "internet", "instagram", "online", "on-line", "password"], slug: "digital-safety" },
  { keys: ["grooming", "gift", "secret", "adult"], slug: "grooming" },
  { keys: ["puberty", "period", "body", "hair", "sexuality"], slug: "puberty" },
  { keys: ["right", "confidential", "parents", "protection council"], slug: "rights" },
];

export function answer(input: string): Reply {
  const t = input.toLowerCase();
  const risk = riskWords.some((w) => t.includes(w));
  const topic = topics.find((x) => x.keys.some((k) => t.includes(k)));
  const art = topic && articles.find((a) => a.slug === topic.slug);

  if (risk) {
    return {
      risk: true,
      text: "Thank you for trusting me. What you are feeling matters, and you deserve support from a person right now. If you are in immediate danger, call 190 (police) or 192 (SAMU). To talk to someone, CVV answers 24/7 at 188. I am an automatic assistant and I don't replace a professional.",
      sources: ["CVV", "Ministry of Health"],
      links: [{ to: "/ajuda", label: "I need help" }, { to: "/solicitar-apoio", label: "Talk to a professional" }],
    };
  }
  if (art) {
    return {
      risk: false,
      text: `${art.summary} ${art.explain[0]} Tip: ${art.practical[0]}`,
      sources: art.sources,
      links: [{ to: `/biblioteca/${art.slug}`, label: `Read: ${art.title}` }, { to: "/servicos", label: "Find a service" }],
    };
  }
  return {
    risk: false,
    text: "I don't have a reviewed answer about that yet. You can rephrase it, explore the library, or talk to a professional at a health center.",
    sources: [],
    links: [{ to: "/biblioteca", label: "Open the library" }],
  };
}
