/** Zotero credentials, stored on the user's device only. */
export type ZoteroSettings = {
  libraryType: "user" | "group";
  libraryId: string;
  apiKey: string;
};

const KEY = "rn-zotero";

export const emptyZoteroSettings: ZoteroSettings = {
  libraryType: "user",
  libraryId: "",
  apiKey: "",
};

export function loadZoteroSettings(): ZoteroSettings {
  if (typeof window === "undefined") return emptyZoteroSettings;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyZoteroSettings;
    return { ...emptyZoteroSettings, ...(JSON.parse(raw) as Partial<ZoteroSettings>) };
  } catch {
    return emptyZoteroSettings;
  }
}

export function saveZoteroSettings(settings: ZoteroSettings) {
  window.localStorage.setItem(KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("rn-zotero-change"));
}

export function hasZoteroCredentials(s: ZoteroSettings) {
  return s.libraryId.trim().length > 0 && s.apiKey.trim().length > 0;
}
