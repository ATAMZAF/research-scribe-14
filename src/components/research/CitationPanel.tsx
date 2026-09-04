import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/state/workspace";

export function CitationPanel() {
  const { activeCitation, setActiveCitation, openSourceAt } = useWorkspace();
  if (!activeCitation) return null;
  const { citation, source, index } = activeCitation;

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-surface p-4 xl:w-96">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Source {index}
        </p>
        <button onClick={() => setActiveCitation(null)} aria-label="Close citation panel">
          <X className="size-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
      <h3 className="mt-3 text-sm leading-snug font-semibold">{source.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {source.author} · {source.year}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">Page {citation.page}</p>
      <blockquote className="mt-2 border-l-2 border-primary/50 bg-card p-3 font-serif text-sm leading-relaxed">
        “{citation.excerpt}”
      </blockquote>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={() => openSourceAt(source, citation.page)}
      >
        Open source <ArrowUpRight className="size-4" />
      </Button>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Excerpt shown is demonstration data. Real passage retrieval arrives with the local document
        pipeline.
      </p>
    </aside>
  );
}
