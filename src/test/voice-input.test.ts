import { describe, expect, it } from "vitest";
import { cleanTranscript, pickRecordingMime, RECORD_MIME_CANDIDATES, encodeWav, MAX_RECORD_SECONDS } from "@/lib/voice-input";

describe("voice recording", () => {
  it("caps voice messages at 30 seconds", () => { expect(MAX_RECORD_SECONDS).toBe(30); });
  it("encodes a complete WAV with the real rate and all samples", async () => {
    const blob = encodeWav([new Float32Array([-1, 0, 1])], 48000);
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error("Expected bytes"));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const view = new DataView(bytes);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("RIFF");
    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getUint32(40, true)).toBe(6);
    expect(view.getInt16(44, true)).toBe(-32768);
    expect(view.getInt16(48, true)).toBe(32767);
  });
});

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
