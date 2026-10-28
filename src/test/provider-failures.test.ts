import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { rpc: async () => ({ data: 1, error: null }) },
}));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (o: unknown) => o }));

import { handleSpeechRequest } from "@/routes/api/speech";
import { handleTranscribeRequest } from "@/routes/api/transcribe";
import { checkLimit } from "@/lib/rate-limit";

const SECRET = "sk-live-SECRET-TOKEN-123 /internal/path db.internal:5432";
const speechReq = () => new Request("http://x/api/speech", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "Olá" }) });
const voiceReq = () => {
  const f = new FormData(); f.append("file", new File([new Uint8Array(2000)], "a.wav", { type: "audio/wav" }));
  return new Request("http://x/api/transcribe", { method: "POST", body: f });
};
const upstream = (status: number) => vi.fn(async () => new Response(`{"error":"${SECRET}"}`, { status }));

describe("simulated AI provider failures never leak internals", () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => { process.env["LOVABLE_API_KEY"] = "test-key"; process.env["RATE_LIMIT_SALT"] = "s"; delete process.env["PAID_AI_DISABLED"]; });
  afterEach(() => { globalThis.fetch = realFetch; });

  for (const [label, status, expected] of [["auth failure", 401, 502], ["outage", 503, 502], ["provider rate limit", 429, 429], ["invalid response", 500, 502]] as const) {
    it(`speech: ${label} → ${expected}, no secret`, async () => {
      globalThis.fetch = upstream(status) as typeof fetch;
      const r = await handleSpeechRequest(speechReq());
      expect(r.status).toBe(expected);
      const body = await r.text();
      expect(body).not.toContain("SECRET"); expect(body).not.toContain("internal");
    });
    it(`transcribe: ${label} → ${expected}, no secret`, async () => {
      globalThis.fetch = upstream(status) as typeof fetch;
      const r = await handleTranscribeRequest(voiceReq());
      if (r.status !== expected) console.log("DBG", await r.clone().text(), (globalThis.fetch as any).mock?.calls?.length);
      expect(r.status).toBe(expected);
      const body = await r.text();
      expect(body).not.toContain("SECRET"); expect(body).not.toContain("internal");
    });
  }

  it("speech: network failure → 502 generic", async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError(SECRET); }) as typeof fetch;
    const r = await handleSpeechRequest(speechReq());
    expect(r.status).toBe(502); expect(await r.text()).not.toContain("SECRET");
  });
  it("transcribe: thrown provider error message is not echoed", async () => {
    globalThis.fetch = vi.fn(async () => { throw new Error(SECRET); }) as typeof fetch;
    const r = await handleTranscribeRequest(voiceReq());
    expect(r.status).toBe(400); expect(await r.text()).not.toContain("SECRET");
  });
  it("speech: provider timeout → 504", async () => {
    globalThis.fetch = vi.fn(async () => { throw new DOMException("t", "TimeoutError"); }) as typeof fetch;
    const r = await handleSpeechRequest(speechReq());
    expect(r.status).toBe(504);
  });
  it("emergency stop pauses paid calls without contacting the provider", async () => {
    process.env["PAID_AI_DISABLED"] = "1";
    const f = vi.fn(); globalThis.fetch = f as unknown as typeof fetch;
    expect((await handleSpeechRequest(speechReq())).status).toBe(503);
    expect(f).not.toHaveBeenCalled();
    expect(await checkLimit(speechReq(), { scope: "assistant" })).toBe("error");
  });
});
