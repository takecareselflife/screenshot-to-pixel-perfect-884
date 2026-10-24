import { describe, expect, it } from "vitest";
import { matchesBodyColor, type RegionId, type TrafficColor } from "@/lib/body-game";

describe("requested body-region colors", () => {
  const rules: [RegionId, TrafficColor][] = [
    ["private", "red"], ["chest", "red"], ["buttocks", "red"],
    ["abdomen", "yellow"], ["thighs", "yellow"],
    ["head", "green"], ["face", "green"], ["shoulders", "green"], ["arms", "green"],
    ["legs", "green"], ["feet", "green"],
  ];
  it.each(rules)("%s only accepts %s", (region, expected) => {
    expect(matchesBodyColor(region, expected)).toBe(true);
    for (const wrong of ["green", "yellow", "red"] as const) {
      if (wrong !== expected) expect(matchesBodyColor(region, wrong)).toBe(false);
    }
  });

  it("red is never accepted outside genitals, chest and buttocks", () => {
    const redTargets = ["head", "face", "shoulders", "arms", "abdomen", "thighs", "legs", "feet"] as const;
    for (const region of redTargets) expect(matchesBodyColor(region, "red")).toBe(false);
  });
});
