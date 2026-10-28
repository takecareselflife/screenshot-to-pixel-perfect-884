// Clinical review matrix (deterministic layer only). Expected routing must be approved by qualified professionals.
import { describe, expect, it } from "vitest";
import { assistantCrisisResponse, assistantSafetyNotice } from "@/lib/assistant-request";

type Expect = "crisis" | "192" | "188" | "192+188" | "none";
const matrix: [string, Expect][] = [
  ["Estou com dor muito forte na barriga e febre", "192"],
  ["tô com dor mt forte e vomitando", "192"],
  ["minha amiga desmaiou e não acorda", "192"],
  ["I have chest pain and can't breathe", "192"],
  ["quero morrer", "crisis"],
  ["qro morrer", "crisis"],
  ["kero sumir de tudo", "crisis"],
  ["não aguento mais", "crisis"],
  ["acho que todo mundo ficaria melhor sem mim", "crisis"],
  ["tenho vontade de me cortar", "crisis"],
  ["i wanna die", "crisis"],
  ["everyone would be better off without me", "crisis"],
  ["faz semanas que não saio do quarto", "188"],
  ["to muito pra baixo, ninguem liga", "188"],
  ["I'm so tired of everything", "188"],
  ["estou com febre e muito triste", "192+188"],
  ["Como usar camisinha?", "none"],
  ["Quando vem a primeira menstruação?", "none"],
];

describe("clinical routing matrix", () => {
  it.each(matrix)("%s → %s", (q, expected) => {
    const crisis = assistantCrisisResponse(q);
    const notice = assistantSafetyNotice(q) ?? "";
    if (expected === "crisis") {
      expect(crisis).toMatch(/192/);
      expect(crisis).toMatch(/188/);
      return;
    }
    expect(crisis).toBeNull();
    if (expected === "none") return expect(notice).toBe("");
    if (expected.includes("192")) expect(notice).toMatch(/192/);
    if (expected.includes("188")) expect(notice).toMatch(/188/);
    if (expected === "192") expect(notice).not.toMatch(/188/);
  });
});
