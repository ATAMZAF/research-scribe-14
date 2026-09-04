import { Loader2, Sparkles } from "lucide-react";
import { ResearchInput } from "./ResearchInput";
import { ResearchActions } from "./ResearchActions";
import { ResearchAnswer } from "./ResearchAnswer";
import { useWorkspace } from "@/state/workspace";

export function ResearchPanel() {
  const { history, pendingQuestion, notebook } = useWorkspace();

  return (
    <div className="space-y-6">
      <ResearchInput />
      <ResearchActions />

      {pendingQuestion && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm font-medium">{pendingQuestion}</p>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Reading sources and drafting a response…
          </p>
          <div className="mt-4 space-y-2">
            {[100, 92, 78].map((w) => (
              <div
                key={w}
                className="h-3 animate-pulse rounded bg-surface-strong"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && !pendingQuestion ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <Sparkles className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No research yet in this notebook</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            {notebook.sources.length === 0
              ? "Add sources to the notebook, then ask a research question."
              : "Ask a question above, or start with one of the research actions."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {history.map((entry) => (
            <ResearchAnswer key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
