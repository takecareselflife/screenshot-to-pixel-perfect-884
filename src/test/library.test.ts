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

describe("Sexual rights article content", () => {
  const rights = libraryArticles.find((a) => a.slug === "rights");
  const text = JSON.stringify(rights);
  it("covers hormone therapy for trans people", () => {
    expect(text).toMatch(/hormone therapy/i);
  });
  it("covers primary care outpatient follow-up", () => {
    expect(text).toMatch(/primary care outpatient/i);
  });
});