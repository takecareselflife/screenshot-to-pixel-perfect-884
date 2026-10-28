import { z } from "zod";
import { redact } from "./redact";

export const MAX_ASSISTANT_BODY_BYTES = 12_000;
export const assistantQuestionSchema = z.object({
  question: z.string().trim().min(1).max(2000),
}).strict();

/** No history, roles, identities or conversation references are accepted. */
export function parseAssistantQuestion(input: unknown): string | null {
  const parsed = assistantQuestionSchema.safeParse(input);
  return parsed.success ? redact(parsed.data.question) : null;
}

/** Bound the actual bytes, including chunked requests without Content-Length. */
export async function readAssistantQuestion(request: Request): Promise<string | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_ASSISTANT_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return parseAssistantQuestion(JSON.parse(text));
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

const norm = (q: string) =>
  q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ");

// Includes colloquial spellings, abbreviations and indirect phrasing observed in the clinical review matrix.
const CRISIS = /\b(suicid\w*|kill myself|kms|hurt myself|end my life|end it all|want to die|wanna die|don'?t want to (live|be here)|better off without me|cut(ting)? myself|self[- ]harm\w*|overdose|abuse\w*|rape\w*|forced me|blackmail\w*|(quero|qro|kero|queria) (morrer|sumir)|me matar|me mata|me machucar|me cortar|me cortando|automutil\w*|tirar (a )?minha vida|nao (quero|kero|qro) mais viver|nao aguento mais|melhor sem mim|tomar todos os remedios|abuso\w*|estupr\w*|violencia|ameac\w*)\b/;
const PT = /\b(estou|to|tô|tenho|minha|meu|nao|dor|quero|qro|kero|faz|morrer|matar|sumir|aguento|machucar|cortar|remedios|abuso\w*|estupr\w*|violencia|ameac\w*|suicidio|vc|voce)\b/;
const URGENT = /\b(dor (muito |mt |mto )?(forte|intensa)|febre|vomit\w*|sangrando muito|sangramento (forte|intenso)|desmai\w*|desacordad\w*|convuls\w*|dor no peito|falta de ar|nao consigo respirar|severe pain|fever|vomiting|heavy bleeding|bleeding a lot|faint\w*|passed out|unconscious|seizure|chest pain|can'?t breathe)\b/;
const DISTRESS = /\b(nao quero ver ninguem|isolad\w*|sem vontade|vontade de nada|triste\w*|sem esperanca|deprimid\w*|depre|ansios\w*|sozinh\w*|pra baixo|chorando todo dia|nao saio do quarto|ninguem liga|cansad\w* de tudo|hopeless|isolated|don'?t want to see anyone|no motivation|sad|depressed|lonely|tired of everything|can'?t stop crying|nobody cares)\b/;

/** A deterministic first-line safeguard, not an exhaustive clinical classifier. */
export function assistantCrisisResponse(question: string): string | null {
  const normalized = norm(question);
  if (!CRISIS.test(normalized)) return null;
  return PT.test(normalized)
    ? "Se há perigo imediato no Brasil, ligue 190 (polícia) ou 192 (SAMU). Para apoio emocional, ligue 188 (CVV). Procure uma pessoa de confiança e um serviço de saúde agora. Não posso diagnosticar, prescrever ou prometer sigilo. Fora do Brasil, procure o número de emergência local. Veja /ajuda e /servicos."
    : "If there is immediate danger in Brazil, call 190 (police) or 192 (SAMU). For emotional support, call 188 (CVV). Contact a trusted person and a health service now. I cannot diagnose, prescribe or promise confidentiality. Outside Brazil, use your local emergency number. See /ajuda and /servicos.";
}
/**
 * Deterministic safety line prepended to the AI answer for urgent physical symptoms or
 * signs of emotional distress, so emergency numbers never depend on the model obeying a prompt.
 * 192 (SAMU) is for medical emergencies; 188 (CVV) is emotional support and never replaces emergency care.
 */
export function assistantSafetyNotice(question: string): string | null {
  const n = norm(question);
  const pt = PT.test(n);
  const urgent = URGENT.test(n);
  const distress = DISTRESS.test(n);
  if (urgent && distress) return pt
    ? "⚠️ Dor forte, febre, vômitos, sangramento intenso, desmaio ou falta de ar precisam de atendimento agora: ligue 192 (SAMU). Para apoio emocional, ligue 188 (CVV).\n\n"
    : "⚠️ Severe pain, fever, vomiting, heavy bleeding, fainting or trouble breathing need care now: call 192 (SAMU). For emotional support, call 188 (CVV).\n\n";
  if (urgent) return pt
    ? "⚠️ Sinais como dor forte, febre, vômitos, sangramento intenso, desmaio ou falta de ar precisam de atendimento agora. Emergência: ligue 192 (SAMU).\n\n"
    : "⚠️ Severe pain, fever, vomiting, heavy bleeding, fainting or trouble breathing need care now. Emergency: call 192 (SAMU).\n\n";
  if (distress) return pt
    ? "💬 Você não está sozinho(a). Para conversar agora, ligue 188 (CVV, 24h, gratuito). Em perigo imediato, ligue 192 (SAMU).\n\n"
    : "💬 You are not alone. To talk now, call 188 (CVV, 24h, free). In immediate danger, call 192 (SAMU).\n\n";
  return null;
}
