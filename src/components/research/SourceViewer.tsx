import { ChevronLeft, ChevronRight, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useWorkspace } from "@/state/workspace";

export function SourceViewer() {
  const { openSource, closeSource, viewerPage, setViewerPage, viewerHighlight, setScope } =
    useWorkspace();

  const source = openSource;

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
                  {source.author} · {source.year} · {source.pages} pages · {source.kind.toUpperCase()}
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
                Page {viewerPage} of {source.pages}
              </span>
              <div className="flex items-center gap-1">
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
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-surface p-6">
              <div className="mx-auto max-w-2xl rounded-md border border-border bg-card p-8 shadow-xs">
                {viewerHighlight && (
                  <p className="mb-5 rounded-sm bg-highlight/60 p-3 font-serif text-[15px] leading-relaxed">
                    “{viewerHighlight}”
                    <span className="mt-1 block text-[11px] text-muted-foreground not-italic">
                      Highlighted passage (demonstration data)
                    </span>
                  </p>
                )}
                <pre className="font-serif text-[15px] leading-[1.8] whitespace-pre-wrap text-foreground/90">
                  {source.pageText[viewerPage - 1] ?? "No content for this page."}
                </pre>
              </div>
              <p className="mx-auto mt-4 max-w-2xl text-center text-[11px] text-muted-foreground">
                Placeholder rendering — a real document viewer replaces this once local file
                processing is connected.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
