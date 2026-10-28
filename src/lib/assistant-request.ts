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

/** A deterministic first-line safeguard, not an exhaustive clinical classifier. */
export function assistantCrisisResponse(question: string): string | null {
  const normalized = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const crisis = /\b(suicid\w*|kill myself|hurt myself|end my life|self[- ]harm|abuse\w*|rape\w*|forced me|blackmail\w*|quero morrer|me matar|me machucar|tirar minha vida|abuso\w*|estupr\w*|violencia|ameac\w*)\b/.test(normalized);
  if (!crisis) return null;
  const portuguese = /\b(quero|minha|morrer|matar|machucar|abuso\w*|estupr\w*|violencia|ameac\w*|suicidio)\b/.test(normalized);
  return portuguese
    ? "Se há perigo imediato no Brasil, ligue 190 (polícia) ou 192 (SAMU). Para apoio emocional, ligue 188 (CVV). Procure uma pessoa de confiança e um serviço de saúde agora. Não posso diagnosticar, prescrever ou prometer sigilo. Fora do Brasil, procure o número de emergência local. Veja /ajuda e /servicos."
    : "If there is immediate danger in Brazil, call 190 (police) or 192 (SAMU). For emotional support, call 188 (CVV). Contact a trusted person and a health service now. I cannot diagnose, prescribe or promise confidentiality. Outside Brazil, use your local emergency number. See /ajuda and /servicos.";
}
/**
 * Deterministic safety line prepended to the AI answer for urgent physical symptoms or
 * signs of emotional distress, so emergency numbers never depend on the model obeying a prompt.
 */
export function assistantSafetyNotice(question: string): string | null {
  const n = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const pt = /\b(estou|tenho|minha|meu|nao|dor|quero|faz)\b/.test(n);
  const urgent = /\b(dor (muito )?forte|febre|vomit\w*|sangramento (forte|intenso)|desmai\w*|falta de ar|severe pain|fever|vomiting|heavy bleeding|faint\w*|can'?t breathe)\b/.test(n);
  if (urgent) return pt
    ? "⚠️ Sinais como dor forte, febre, vômitos, sangramento intenso, desmaio ou falta de ar precisam de atendimento agora. Emergência: ligue 192 (SAMU).\n\n"
    : "⚠️ Severe pain, fever, vomiting, heavy bleeding, fainting or trouble breathing need care now. Emergency: call 192 (SAMU).\n\n";
  const distress = /\b(nao quero ver ninguem|isolad\w*|sem vontade|vontade de nada|triste\w*|sem esperanca|deprimid\w*|ansios\w*|sozinh\w*|hopeless|isolated|don'?t want to see anyone|no motivation|sad|depressed|lonely)\b/.test(n);
  if (distress) return pt
    ? "💬 Você não está sozinho(a). Para conversar agora, ligue 188 (CVV, 24h, gratuito). Em perigo imediato, ligue 192 (SAMU).\n\n"
    : "💬 You are not alone. To talk now, call 188 (CVV, 24h, free). In immediate danger, call 192 (SAMU).\n\n";
  return null;
}
