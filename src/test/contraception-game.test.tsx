import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContraceptionGame } from "@/components/ContraceptionGame";
import { METHODS, QUIZ, checkMatch, pointsFor, type MethodId, type TargetId } from "@/lib/contraception-game";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/ListenButton", () => ({ ListenButton: () => null }));
afterEach(cleanup);

const expected: Record<MethodId, TargetId> = {
  "external-condom": "penis",
  "internal-condom": "vagina",
  pill: "oral",
  "copper-iud": "uterus",
  "hormonal-iud": "uterus",
  patch: "skin",
  ring: "vagina",
  implant: "arm",
  injection: "injection",
  diaphragm: "vagina",
  sponge: "vagina",
  "fertility-awareness": "calendar",
};

describe("contraception matching rules", () => {
  it("has the 12 methods from the brief", () => {
    expect(METHODS.map((m) => m.id).sort()).toEqual(Object.keys(expected).sort());
  });

  it.each(Object.entries(expected))("%s goes to %s", (method, target) => {
    expect(checkMatch(method as MethodId, target as TargetId).result).toBe("correct");
    expect(checkMatch(method as MethodId, target === "penis" ? "vagina" : "penis").result).not.toBe("correct");
  });

  it("diaphragm and sponge on the cervix are close, not correct", () => {
    expect(checkMatch("diaphragm", "cervix").result).toBe("close");
    expect(checkMatch("sponge", "cervix").result).toBe("close");
  });

  it("never removes points and gives less after a wrong try", () => {
    expect(pointsFor(0)).toBe(10);
    expect(pointsFor(1)).toBe(5);
    expect(pointsFor(5)).toBeGreaterThan(0);
  });

  it("has five final challenge questions", () => {
    expect(QUIZ).toHaveLength(5);
  });
});

function place(container: HTMLElement, method: MethodId, target: TargetId) {
  fireEvent.click(container.querySelector(`[data-method="${method}"]`)!);
  fireEvent.click(container.querySelector(`[data-target="${target}"]`)!);
}

describe("contraception game flow", () => {
  it("keeps points on a wrong try, then scores, runs the final challenge and restarts", () => {
    const { container } = render(<ContraceptionGame />);
    place(container, "pill", "uterus");
    expect(screen.getByText("Almost! Let's learn together?")).toBeInTheDocument();
    expect(screen.getByText("0 points")).toBeInTheDocument();
    place(container, "pill", "oral");
    expect(screen.getByText("Well done! You got it!")).toBeInTheDocument();
    expect(screen.getByText("5 points")).toBeInTheDocument();
    for (const [m, t] of Object.entries(expected)) if (m !== "pill") place(container, m as MethodId, t as TargetId);
    expect(screen.getByText("115 points")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Start the FINAL CHALLENGE/ }));
    QUIZ.forEach((q, i) => {
      fireEvent.click(screen.getByRole("button", { name: q.options[q.answer]! }));
      fireEvent.click(screen.getByRole("button", { name: i + 1 < QUIZ.length ? /Next question/ : /See my results/ }));
    });
    expect(screen.getByText("165 points")).toBeInTheDocument();
    expect(screen.getByText(/94% correct on the first try/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Play again/ }));
    expect(screen.getByText("0 points")).toBeInTheDocument();
    expect(screen.getByText("0 of 12")).toBeInTheDocument();
  });
});
