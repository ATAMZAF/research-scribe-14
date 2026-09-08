/** Device-local Gemini API key configuration. */
export const GEMINI_KEY_STORAGE = "gemini_api_key";
export const GEMINI_MODEL = "gemini-2.5-flash";

export function getEnvGeminiKey(): string {
  return (import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined)?.trim() ?? "";
}

export function loadGeminiKey(): string {
  const env = getEnvGeminiKey();
  if (env) return env;
  if (typeof window === "undefined") return "";
  return localStorage.getItem(GEMINI_KEY_STORAGE)?.trim() ?? "";
}

export function saveGeminiKey(key: string) {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(GEMINI_KEY_STORAGE, trimmed);
  else localStorage.removeItem(GEMINI_KEY_STORAGE);
  window.dispatchEvent(new Event("gemini-key-changed"));
}

export function hasGeminiKey(): boolean {
  return loadGeminiKey().length > 0;
}
