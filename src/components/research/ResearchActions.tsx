import { researchActions } from "@/data/mock";
import { useWorkspace } from "@/state/workspace";

export function ResearchActions() {
  const { ask, pendingQuestion } = useWorkspace();

  return (
    <div className="flex flex-wrap gap-1.5">
      {researchActions.map((a) => (
        <button
          key={a.id}
          disabled={pendingQuestion !== null}
          onClick={() => void ask(a.prompt)}
          className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
