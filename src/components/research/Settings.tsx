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
import { cn } from "@/lib/utils";
import { getResearchService } from "@/services/research-service";

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
            Preferences are stored on this device. Nothing is sent to a cloud service.
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

        <div className="space-y-2">
          <Label htmlFor="model-endpoint">Local model endpoint</Label>
          <Input id="model-endpoint" placeholder="http://localhost:11434" disabled />
          <p className="text-xs text-muted-foreground">
            Active provider:{" "}
            <span className="font-mono">{getResearchService().name}</span>. Answers are generated
            from demonstration data until a local model runtime is connected.
          </p>
        </div>

        <Separator />

        <div className="space-y-1">
          <Label>Privacy</Label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This workspace is designed to run locally. Documents, questions and notes stay in the
            browser session and are never uploaded.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
