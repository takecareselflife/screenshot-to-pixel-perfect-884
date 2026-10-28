import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Safety net: ordinary unit tests must never reach the real backend if a mock is missed.
if (process.env["RUN_SECURITY_INTEGRATION"] !== "1") {
  process.env["SUPABASE_URL"] = "http://127.0.0.1:9";
  process.env["SUPABASE_SERVICE_ROLE_KEY"] = "unit-test-placeholder";
}
