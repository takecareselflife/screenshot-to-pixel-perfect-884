// Remove emails and phone numbers before anything reaches the AI provider.
export function redact(t: string) {
  return t.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]").replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone]");
}
