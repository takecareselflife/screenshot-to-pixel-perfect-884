import { describe, expect, it } from "vitest";
import { achievementsFor, feedbackFor, hasStuckThought, scenarios, scenariosFor, stuckThoughtFeedback } from "@/lib/possibilities-game";

const friends = scenarios.find((s) => s.id === "friends-photos")!;

describe("Expand Your Possibilities rules", () => {
  it("offers age-specific scenarios", () => {
    expect(scenariosFor("12-14").map((s) => s.id)).toContain("group-chat");
    expect(scenariosFor("12-14").map((s) => s.id)).not.toContain("relationship-pressure");
    expect(scenariosFor("15-17").map((s) => s.id)).toContain("relationship-pressure");
  });
  it("answers option F gently instead of rewarding or penalizing it", () => {
    expect(hasStuckThought(friends, ["f"])).toBe(true);
    expect(feedbackFor(friends, ["f"], "12-14")).toBe(stuckThoughtFeedback);
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
