import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useWorkspace } from "@/state/workspace";
import { loadPdf } from "@/lib/pdf-store";

export function SourceViewer() {
  const { openSource, closeSource, viewerPage, setViewerPage, viewerHighlight, setScope } =
    useWorkspace();

  const source = openSource;
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"document" | "text">("document");

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setFileUrl(null);
    setMode("document");

    if (source?.hasFile) {
      void loadPdf(source.id).then((bytes) => {
        if (!bytes || cancelled) return;
        url = URL.createObjectURL(
          new Blob([bytes.slice().buffer as ArrayBuffer], { type: "application/pdf" }),
        );
        setFileUrl(url);
      });
    }

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [source?.id, source?.hasFile]);

  const showDocument = mode === "document" && !!fileUrl;

  return (
    <Sheet open={!!source} onOpenChange={(v) => !v && closeSource()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl lg:max-w-3xl [&>button]:hidden"
      >
        {source && (
          <>
            <header className="flex items-start gap-3 border-b border-border bg-surface px-5 py-4">
              <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold">{source.title}</h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {source.author} · {source.year} · {source.pages} pages ·{" "}
                  {source.kind.toUpperCase()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setScope("current")}>
                Ask this source
              </Button>
              <button onClick={closeSource} aria-label="Close source viewer" className="p-1">
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </button>
            </header>

            <div className="flex items-center justify-between border-b border-border px-5 py-2">
              <span className="text-xs text-muted-foreground">
                {showDocument ? "Original document" : `Page ${viewerPage} of ${source.pages}`}
              </span>
              <div className="flex items-center gap-1">
                {fileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => setMode(mode === "document" ? "text" : "document")}
                  >
                    {mode === "document" ? "Extracted text" : "Original PDF"}
                  </Button>
                )}
                {!showDocument && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      disabled={viewerPage <= 1}
                      onClick={() => setViewerPage(viewerPage - 1)}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      disabled={viewerPage >= source.pages}
                      onClick={() => setViewerPage(viewerPage + 1)}
                      aria-label="Next page"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {showDocument ? (
              <iframe
                title={`${source.title} document`}
                src={`${fileUrl}#page=${viewerPage}`}
                className="min-h-0 flex-1 w-full border-0 bg-surface"
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto bg-surface p-6">
                <div className="mx-auto max-w-2xl rounded-md border border-border bg-card p-8 shadow-xs">
                  {viewerHighlight && (
                    <p className="mb-5 rounded-sm bg-highlight/60 p-3 font-serif text-[15px] leading-relaxed">
                      “{viewerHighlight}”
                      <span className="mt-1 block text-[11px] text-muted-foreground not-italic">
                        Cited passage
                      </span>
                    </p>
                  )}
                  <pre className="font-serif text-[15px] leading-[1.8] whitespace-pre-wrap text-foreground/90">
                    {source.pageText[viewerPage - 1] ?? "No text was extracted for this page."}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
