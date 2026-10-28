import { describe, expect, it } from "vitest";
import { cleanTranscript, pickRecordingMime, RECORD_MIME_CANDIDATES } from "@/lib/voice-input";

describe("pickRecordingMime", () => {
  it("prefers opus in webm when the browser supports everything", () => {
    expect(pickRecordingMime(() => true)).toBe("audio/webm;codecs=opus");
  });

  it("falls back to mp4 when webm cannot be encoded (iOS Safari)", () => {
    expect(pickRecordingMime((type) => type === "audio/mp4" || type === "audio/ogg;codecs=opus")).toBe("audio/mp4");
  });

  it("reports no usable format when nothing is supported", () => {
    expect(pickRecordingMime(() => false)).toBeUndefined();
  });

  it("only offers audio containers the transcription service accepts", () => {
    expect(RECORD_MIME_CANDIDATES.every((type) => type.startsWith("audio/"))).toBe(true);
  });
});

describe("cleanTranscript", () => {
  it("collapses newlines and repeated spaces and trims the ends", () => {
    expect(cleanTranscript("  how   do\nI use a condom?  ")).toBe("how do I use a condom?");
  });

  it("treats a silence placeholder as no speech at all", () => {
    expect(cleanTranscript(" [Silence] ")).toBe("");
    expect(cleanTranscript("no speech")).toBe("");
    expect(cleanTranscript("(Inaudible)")).toBe("");
    expect(cleanTranscript("   ")).toBe("");
  });

  it("keeps a real sentence untouched, including punctuation", () => {
    expect(cleanTranscript("Estou com medo de ficar grávida.")).toBe("Estou com medo de ficar grávida.");
  });
});
