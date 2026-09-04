import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SourceKind } from "@/data/mock";
import { useWorkspace } from "@/state/workspace";

const kindOf = (name: string): SourceKind => {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "txt" || ext === "docx" || ext === "csv" ? ext : "pdf";
};

export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addSources } = useWorkspace();
  const [files, setFiles] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFiles([]);
    setProgress(null);
    setDragging(false);
  };

  const add = (names: string[]) => setFiles((p) => [...p, ...names.filter((n) => !p.includes(n))]);

  const submit = () => {
    setProgress(8);
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = (p ?? 0) + 14;
        if (next >= 100) {
          clearInterval(timer);
          addSources(files.map((name) => ({ name, kind: kindOf(name) })));
          setTimeout(() => {
            onOpenChange(false);
            reset();
          }, 300);
          return 100;
        }
        return next;
      });
    }, 160);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add sources</DialogTitle>
          <DialogDescription>
            Files stay on this device. Document processing is not enabled in this iteration.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            add(Array.from(e.dataTransfer.files).map((f) => f.name));
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center transition-colors",
            dragging ? "border-primary bg-accent" : "border-border bg-surface",
          )}
        >
          <UploadCloud className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Drag &amp; drop files here</p>
          <p className="text-xs text-muted-foreground">or</p>
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.csv"
            className="hidden"
            onChange={(e) => add(Array.from(e.target.files ?? []).map((f) => f.name))}
          />
        </div>

        <p className="text-xs text-muted-foreground">Supported: PDF, TXT, DOCX, CSV</p>

        {files.length > 0 && (
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {files.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{f}</span>
                {progress === null && (
                  <button
                    onClick={() => setFiles((p) => p.filter((x) => x !== f))}
                    aria-label={`Remove ${f}`}
                  >
                    <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {progress !== null && (
          <div className="space-y-1.5">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">Adding files… {progress}%</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={files.length === 0 || progress !== null} onClick={submit}>
            Add {files.length > 0 ? `(${files.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
