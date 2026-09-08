import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  emptyZoteroSettings,
  loadZoteroSettings,
  saveZoteroSettings,
  type ZoteroSettings,
} from "@/lib/zotero-settings";
import { getEnvGeminiKey, loadGeminiKey, saveGeminiKey } from "@/lib/gemini-settings";

type Theme = "light" | "dark";

function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const stored = localStorage.getItem("rn-theme") as Theme | null;
    const next =
      stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(next);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rn-theme", theme);
  }, [theme]);
  return { theme, setTheme };
}

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [zotero, setZotero] = useState<ZoteroSettings>(emptyZoteroSettings);
  const [saved, setSaved] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const envKey = getEnvGeminiKey();
  const configured = envKey.length > 0 || geminiKey.trim().length > 0;

  useEffect(() => {
    setZotero(loadZoteroSettings());
    setGeminiKey(loadGeminiKey());
  }, []);

  const saveKey = () => {
    saveGeminiKey(geminiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };


  const save = () => {
    saveZoteroSettings({
      libraryType: zotero.libraryType,
      libraryId: zotero.libraryId.trim(),
      apiKey: zotero.apiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Settings">
          <SettingsIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Preferences and library credentials are stored on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Appearance</Label>
          <div className="flex gap-2">
            {(["light", "dark"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                  theme === t
                    ? "border-primary/50 bg-accent text-accent-foreground"
                    : "border-border hover:bg-surface-strong",
                )}
              >
                {t} mode
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label>Zotero library</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a key at zotero.org/settings/keys, then enter your user ID or group ID.
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={zotero.libraryType}
              onValueChange={(v) =>
                setZotero((z) => ({ ...z, libraryType: v as ZoteroSettings["libraryType"] }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={zotero.libraryId}
              onChange={(e) => setZotero((z) => ({ ...z, libraryId: e.target.value }))}
              placeholder="Library ID (e.g. 123456)"
            />
          </div>
          <Input
            type="password"
            value={zotero.apiKey}
            onChange={(e) => setZotero((z) => ({ ...z, apiKey: e.target.value }))}
            placeholder="Zotero API key"
          />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={save}>
              Save Zotero settings
            </Button>
            {saved && <span className="text-xs text-muted-foreground">Saved</span>}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <Label>Gemini API key</Label>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Questions are answered by Google Gemini using passages from the sources in scope. Get
              a key at aistudio.google.com/apikey. It stays on this device.
              {envKey && " A key is already provided by the environment."}
            </p>
          </div>
          {!envKey && (
            <>
              <Input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Gemini API key"
              />
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={saveKey}>
                  Save API key
                </Button>
                <span className="text-xs text-muted-foreground">
                  {keySaved ? "Saved" : configured ? "Configured" : "Not configured"}
                </span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
