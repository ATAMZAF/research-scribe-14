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
import type { Source, SourceKind } from "@/data/mock";
import { useWorkspace } from "@/state/workspace";
import { extractPdfPages } from "@/lib/pdf-text";
import { savePdf } from "@/lib/pdf-store";

const kindOf = (name: string): SourceKind => {
  const ext = name.split(".").pop()?.toLowerCase();
  return ext === "txt" || ext === "docx" || ext === "csv" ? ext : "pdf";
};

/** Split plain text into readable "pages" for the viewer and AI context. */
function paginate(text: string, size = 3000): string[] {
  const pages: string[] = [];
  for (let i = 0; i < text.length; i += size) pages.push(text.slice(i, i + size));
  return pages.length ? pages : [text];
}

export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addSourceObjects } = useWorkspace();
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFiles([]);
    setProgress(null);
    setDragging(false);
    setError(null);
  };

  const add = (incoming: File[]) =>
    setFiles((p) => [...p, ...incoming.filter((f) => !p.some((x) => x.name === f.name))]);

  const submit = async () => {
    setProgress(5);
    setError(null);
    const built: Source[] = [];

    for (const [index, file] of files.entries()) {
      const kind = kindOf(file.name);
      const id = crypto.randomUUID();
      let pages: string[] = [];
      let hasFile = false;

      try {
        if (kind === "pdf") {
          const bytes = new Uint8Array(await file.arrayBuffer());
          pages = await extractPdfPages(bytes);
          await savePdf(id, bytes);
          hasFile = true;
        } else {
          pages = paginate(await file.text());
        }
      } catch {
        setError(`Could not read text from ${file.name}.`);
        pages = [`Text could not be extracted from ${file.name}.`];
      }

      built.push({
        id,
        title: file.name.replace(/\.[a-z]+$/i, ""),
        fileName: file.name,
        author: "Uploaded document",
        year: new Date().getFullYear(),
        pages: pages.length,
        kind,
        addedAt: new Date().toISOString().slice(0, 10),
        excerpt: (pages[0] ?? "").slice(0, 240),
        pageText: pages,
        hasFile,
      });

      setProgress(Math.round(((index + 1) / files.length) * 100));
    }

    addSourceObjects(built);
    setTimeout(() => {
      onOpenChange(false);
      reset();
    }, 300);
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
            Files stay on this device. PDF text is extracted here in your browser.
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
            add(Array.from(e.dataTransfer.files));
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
            onChange={(e) => add(Array.from(e.target.files ?? []))}
          />
        </div>

        <p className="text-xs text-muted-foreground">Supported: PDF, TXT, DOCX, CSV</p>

        {files.length > 0 && (
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {files.map((f) => (
              <li
                key={f.name}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                {progress === null && (
                  <button
                    onClick={() => setFiles((p) => p.filter((x) => x.name !== f.name))}
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {progress !== null && (
          <div className="space-y-1.5">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">Reading documents… {progress}%</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={files.length === 0 || progress !== null} onClick={() => void submit()}>
            Add {files.length > 0 ? `(${files.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
