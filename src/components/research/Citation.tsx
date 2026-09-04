import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { CitationRef, Source } from "@/data/mock";
import { useWorkspace } from "@/state/workspace";

export function Citation({
  index,
  citation,
  source,
}: {
  index: number;
  citation: CitationRef;
  source?: Source;
}) {
  const { setActiveCitation } = useWorkspace();
  if (!source) return <sup className="text-muted-foreground">[{index}]</sup>;

  return (
    <HoverCard openDelay={120}>
      <HoverCardTrigger asChild>
        <button
          onClick={() => setActiveCitation({ citation, source, index })}
          className="mx-0.5 inline-flex h-[1.15rem] min-w-[1.15rem] translate-y-[-1px] items-center justify-center rounded-sm border border-primary/30 bg-accent px-1 align-middle text-[11px] font-medium text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {index}
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 space-y-1.5">
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Source {index} · Page {citation.page}
        </p>
        <p className="text-sm leading-snug font-medium">{source.title}</p>
        <p className="border-l-2 border-border pl-2 font-serif text-xs text-muted-foreground italic">
          “{citation.excerpt}”
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}
