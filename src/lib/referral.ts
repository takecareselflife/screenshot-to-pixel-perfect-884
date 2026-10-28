import type { Service, ServiceType } from "./data";

export type NeedId = "contraception" | "emergency-pill" | "sti-test" | "pep" | "emotional" | "violence" | "online" | "gender";

export type Need = { id: NeedId; label: string; types: ServiceType[]; urgent?: string; tip: string };

// Smart referral rules: each need maps to the service types that can help, in priority order.
export const needs: Need[] = [
  { id: "contraception", label: "Contraception or condoms", types: ["Health center"], tip: "Free condoms and methods at health centers." },
  { id: "emergency-pill", label: "Morning-after pill", types: ["Health center"], urgent: "Go today: it works best in the first 3 days.", tip: "A pharmacy can also help." },
  { id: "sti-test", label: "STI test or genital sore", types: ["Health center"], tip: "Ask for a rapid test. It's confidential." },
  { id: "pep", label: "Possible HIV exposure (PEP)", types: ["Health center", "Violence response"], urgent: "PEP must start within 72 hours.", tip: "Say it's about PEP when you arrive." },
  { id: "emotional", label: "Sad, anxious or isolated", types: ["Mental health", "Health center"], tip: "Need to talk now? CVV: 188." },
  { id: "violence", label: "Violence or abuse", types: ["Violence response", "Protection"], urgent: "In danger now? Call 190.", tip: "Care without a police report." },
  { id: "online", label: "Online threats or leaked photos", types: ["Protection", "Violence response"], tip: "Keep evidence if it's safe." },
  { id: "gender", label: "Gender care or hormones", types: ["Health center"], tip: "Ask for primary care follow-up." },
];

export function recommend(list: Service[], needId: NeedId, city?: string): Service[] {
  const need = needs.find((n) => n.id === needId);
  if (!need) return [];
  return list
    .filter((s) => need.types.includes(s.type) && (!city || s.city === city))
    .sort((a, b) =>
      need.types.indexOf(a.type) - need.types.indexOf(b.type) ||
      Number(b.verified) - Number(a.verified),
    );
}
