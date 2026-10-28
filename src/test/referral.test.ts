import { describe, it, expect } from "vitest";
import { recommend } from "@/lib/referral";
import { services } from "@/lib/data";
import { redact } from "@/routes/api/assistant";

describe("smart referral", () => {
  it("sends emotional needs to mental health first", () => {
    expect(recommend(services, "emotional")[0].type).toBe("Mental health");
  });
  it("sends violence to violence response, never mental health", () => {
    const r = recommend(services, "violence");
    expect(r[0].type).toBe("Violence response");
    expect(r.some((s) => s.type === "Mental health")).toBe(false);
  });
  it("filters by city", () => {
    expect(recommend(services, "contraception", "Porto Sereno").every((s) => s.city === "Porto Sereno")).toBe(true);
  });
});

describe("assistant privacy", () => {
  it("removes emails and phone numbers before AI", () => {
    expect(redact("me ana@x.com or 11 98765-4321")).toBe("me [email] or [phone]");
  });
});
