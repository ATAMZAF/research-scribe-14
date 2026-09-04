import { Layers, ListChecks, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, type Scope } from "@/state/workspace";

export function SourceSelector() {
  const { scope, setScope, selectedIds, notebook, openSource } = useWorkspace();

  const options: { id: Scope; label: string; icon: typeof Layers; disabled?: boolean }[] = [
    { id: "all", label: `All sources (${notebook.sources.length})`, icon: Layers },
    {
      id: "selected",
      label: `Selected sources (${selectedIds.length})`,
      icon: ListChecks,
      disabled: selectedIds.length === 0,
    },
    { id: "current", label: "This source", icon: FileText, disabled: !openSource },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-muted-foreground">Sources:</span>
      {options.map((o) => {
        const active = scope === o.id;
        return (
          <button
            key={o.id}
            disabled={o.disabled}
            onClick={() => setScope(o.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
              active
                ? "border-primary/40 bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:bg-surface-strong",
              o.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                active ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            <o.icon className="size-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
