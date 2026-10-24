import { describe, expect, it } from "vitest";
import { matchesBodyColor, type RegionId, type TrafficColor } from "@/lib/body-game";

describe("requested body-region colors", () => {
  const rules: [RegionId, TrafficColor][] = [
    ["private", "red"], ["chest", "red"],
    ["head", "green"], ["arms", "green"], ["feet", "green"],
    ["thighs", "yellow"], ["shoulders", "yellow"],
  ];
  it.each(rules)("%s only accepts %s", (region, expected) => {
    expect(matchesBodyColor(region, expected)).toBe(true);
    for (const wrong of ["green", "yellow", "red"] as const) {
      if (wrong !== expected) expect(matchesBodyColor(region, wrong)).toBe(false);
    }
  });
});