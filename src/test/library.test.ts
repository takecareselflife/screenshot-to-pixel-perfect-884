import { describe, expect, it } from "vitest";
import { libraryArticles } from "@/lib/library";

describe("Requested library exclusions", () => {
  it("omits the sexual and digital violence card", () => {
    expect(libraryArticles.map((a) => a.slug)).not.toContain("sexual-and-digital-violence");
  });
  it("omits the grooming card", () => {
    expect(libraryArticles.map((a) => a.slug)).not.toContain("grooming");
  });
});