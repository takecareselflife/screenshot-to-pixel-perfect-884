import { describe, it, expect, vi, beforeEach } from "vitest";

const counts = new Map<string, number>();
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    rpc: async (_n: string, a: { _bucket: string }) => {
      const v = (counts.get(a._bucket) ?? 0) + 1; counts.set(a._bucket, v); return { data: v, error: null };
    },
  },
}));

import { checkLimit } from "@/lib/rate-limit";
const req = (ip: string) => new Request("http://x", { headers: { "cf-connecting-ip": ip } });

describe("paid endpoint limits", () => {
  beforeEach(() => { counts.clear(); process.env["RATE_LIMIT_SALT"] = "test"; });
  it("blocks the 13th read-aloud request from one client in a minute", async () => {
    const o = { scope: "speech", client: 12, global: 200, daily: 300 };
    for (let i = 0; i < 12; i++) expect(await checkLimit(req("1.1.1.1"), o)).toBe("ok");
    expect(await checkLimit(req("1.1.1.1"), o)).toBe("rate");
    expect(await checkLimit(req("2.2.2.2"), o)).toBe("ok");
  });
  it("enforces the daily cap independently of the minute limit", async () => {
    const o = { scope: "voice", client: 1000, global: 1000, daily: 3 };
    for (let i = 0; i < 3; i++) expect(await checkLimit(req("3.3.3.3"), o)).toBe("ok");
    expect(await checkLimit(req("3.3.3.3"), o)).toBe("rate");
  });
  it("fails closed without the salt", async () => {
    delete process.env["RATE_LIMIT_SALT"];
    expect(await checkLimit(req("4.4.4.4"), { scope: "speech" })).toBe("error");
  });
});

describe("app-wide daily budget (not tied to IP)", () => {
  beforeEach(() => { counts.clear(); process.env["RATE_LIMIT_SALT"] = "test"; });
  it("pauses the read-aloud service after 2000 calls/day even from many different clients", async () => {
    counts.set("budget:speech:day", 2000);
    expect(await checkLimit(req("9.9.9.9"), { scope: "speech", client: 12, global: 200, daily: 300 })).toBe("error");
  });
  it("pauses everything once the 5000 total daily calls are used", async () => {
    counts.set("budget:all:day", 5000);
    expect(await checkLimit(req("8.8.8.8"), { scope: "assistant" })).toBe("error");
  });
});
