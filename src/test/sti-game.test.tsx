import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STI_QUESTIONS, answerSti, continueSti, initialStiState, stiAccuracy } from "@/lib/sti-game";
import { StiWisdomGame } from "@/components/StiWisdomGame";
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/ListenButton", () => ({ ListenButton: () => null }));
afterEach(cleanup);

describe("STI trail rules", () => {
  it("uses the ten answers from the brief", () => {
    expect(STI_QUESTIONS.map(q => q.answer)).toEqual([true, false, true, true, true, true, false, true, false, true]);
  });
  it("only advances one step after a correct answer and cannot count a double tap", () => {
    const answered = answerSti(initialStiState(), true);
    expect(answerSti(answered, true)).toEqual(answered);
    expect(continueSti(answered).position).toBe(1);
    expect(answered.correct).toBe(1);
  });
  it("an incorrect answer stays on the same step without losing progress", () => {
    const state = continueSti(answerSti(initialStiState(), true));
    const retry = continueSti(answerSti(state, true));
    expect(retry.position).toBe(1);
    expect(retry.correct).toBe(1);
    expect(retry.attempts).toBe(2);
  });
  it("completes all ten steps and calculates accuracy including retries", () => {
    let state = continueSti(answerSti(initialStiState(), false));
    for (const q of STI_QUESTIONS) state = continueSti(answerSti(state, q.answer));
    expect(state.position).toBe(10);
    expect(state.correct).toBe(10);
    expect(state.attempts).toBe(11);
    expect(stiAccuracy(state)).toBe(91);
  });
  it("requires feedback before moving and can restart after the trophy", () => {
    render(<StiWisdomGame />);
    fireEvent.click(screen.getByRole("button", { name: "False", exact: true }));
    expect(screen.getByRole("button", { name: "True", exact: true })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    for (const q of STI_QUESTIONS) {
      fireEvent.click(screen.getByRole("button", { name: q.answer ? "True" : "False", exact: true }));
      fireEvent.click(screen.getByRole("button", { name: q === STI_QUESTIONS.at(-1) ? "Collect trophy" : "Next question" }));
    }
    expect(screen.getByText("91%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(screen.getByRole("button", { name: "True", exact: true })).toBeEnabled();
    expect(screen.getByText("10 steps to the trophy")).toBeInTheDocument();
  });
});