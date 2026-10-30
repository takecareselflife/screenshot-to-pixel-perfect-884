import { describe, expect, it } from "vitest";
import { achievementsFor, feedbackFor, hasStuckThought, scenarios, stuckThoughtFeedback } from "@/lib/possibilities-game";

const friends = scenarios.find((s) => s.id === "friends-photos")!;

describe("Expand Your Possibilities rules", () => {
  it("uses one shared scenario pool with no age split", () => {
    expect(scenarios.map((s) => s.id)).toEqual(["friends-photos", "test-fail", "group-chat", "future-pressure", "relationship-pressure"]);
    expect(scenarios.every((s) => !("ages" in s))).toBe(true);
  });
  it("keeps situations and options short enough to scan", () => {
    for (const s of scenarios) {
      expect(s.situation.length).toBeLessThanOrEqual(130);
      for (const o of s.options) expect(o.text.length).toBeLessThanOrEqual(40);
    }
  });
  it("answers option F gently instead of rewarding or penalizing it", () => {
    expect(hasStuckThought(friends, ["f"])).toBe(true);
    expect(feedbackFor(friends, ["f"])).toBe(stuckThoughtFeedback);
    expect(achievementsFor(friends, ["a"], ["a", "f"], ["a"])).toEqual(achievementsFor(friends, ["a"], ["a"], ["a"]));
  });
  it("awards New Paths only for a new category", () => {
    expect(achievementsFor(friends, ["a"], ["a", "c"], [])).not.toContain("new-paths");
    expect(achievementsFor(friends, ["a"], ["a", "b"], [])).toContain("new-paths");
  });
  it("awards Support Seeker for talking to someone", () => {
    expect(achievementsFor(friends, ["b"], ["b"], [])).toContain("support");
  });
  it("counts taking a break as a valid next step", () => {
    expect(achievementsFor(friends, ["e"], ["e"], ["pause"])).toContain("next-step");
  });
});
