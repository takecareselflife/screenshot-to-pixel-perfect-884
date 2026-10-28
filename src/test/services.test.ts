import { describe, expect, it } from "vitest";
import { services, nationalServiceSearch } from "@/lib/data";
import { recommend } from "@/lib/referral";

describe("Brazilian UBS directory", () => {
  it("includes real UBS with addresses and official sources", () => {
    const units = services.filter((s) => s.source);
    expect(units.map((s) => s.id)).toEqual(["ubs-vila-carrao", "ubs-vila-california", "ubs-alto-pinheiros", "ubs-rio-pequeno"]);
    expect(units.every((s) => s.city === "São Paulo" && s.address && s.type === "Health center" && new URL(s.source ?? "").hostname === "capital.sp.gov.br")).toBe(true);
  });
  it("offers national lookup and includes UBS in city-filtered referrals", () => {
    expect(new URL(nationalServiceSearch).hostname).toBe("cnes.datasus.gov.br");
    expect(recommend(services, "contraception", "São Paulo").map((s) => s.id)).toContain("ubs-vila-carrao");
  });
});