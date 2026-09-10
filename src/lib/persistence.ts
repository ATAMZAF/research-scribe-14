/** Device-local persistence of the whole workspace (notebooks, history, notes). */
import type { Notebook } from "@/data/mock";

const KEY = "rn-workspace-v1";

export type PersistedWorkspace = {
  notebooks: Notebook[];
  notebookId: string;
};

export function loadWorkspace(): PersistedWorkspace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWorkspace;
    if (!Array.isArray(parsed.notebooks) || parsed.notebooks.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWorkspace(state: PersistedWorkspace) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — keep working in memory */
  }
}

export function clearWorkspace() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
