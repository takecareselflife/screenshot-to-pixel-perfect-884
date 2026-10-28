/**
 * Server-only speech-to-text helper. The API key is read from the server environment
 * and never reaches the browser.
 */
export type TranscriptionConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  maxFileBytes: number;
  audioOnly: boolean;
};

export const TRANSCRIBE_BASE_URL = "https://ai.gateway.lovable.dev/v1";
export const TRANSCRIBE_MODEL = "openai/gpt-transcribe";
/** 4 MB of audio — well inside the endpoint's 25 MiB request cap. */
export const TRANSCRIBE_MAX_BYTES = 4_000_000;

export const transcribeConfig = (apiKey: string): TranscriptionConfig => ({
  baseURL: TRANSCRIBE_BASE_URL,
  apiKey,
  model: TRANSCRIBE_MODEL,
  maxFileBytes: TRANSCRIBE_MAX_BYTES,
  audioOnly: false,
});

export async function transcribe(
  config: TranscriptionConfig,
  file: File,
  options: {
    buffered?: boolean;
    language?: string;
    signal?: AbortSignal;
  } = {},
) {
  if (!file.size || file.size > config.maxFileBytes) throw new Error("Invalid audio file size");
  if (!file.type.startsWith("audio/") && (config.audioOnly || !file.type.startsWith("video/"))) {
    throw new Error("Unexpected media MIME type");
  }
  const form = new FormData();
  form.append("model", config.model);
  form.append("file", file, file.name);
  form.append("response_format", "json");
  if (!options.buffered) form.append("stream", "true");
  if (options.language) form.append("language", options.language);
  return fetch(`${config.baseURL}/v1/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: form,
    ...(options.signal ? { signal: options.signal } : {}),
  });
}
