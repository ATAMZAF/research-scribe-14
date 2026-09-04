import { FileText, MoreHorizontal, Eye, Trash2, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Source } from "@/data/mock";
import { useWorkspace } from "@/state/workspace";

export function SourceCard({ source, dense = false }: { source: Source; dense?: boolean }) {
  const { selectedIds, toggleSource, openSourceAt, removeSource } = useWorkspace();
  const selected = selectedIds.includes(source.id);

  return (
    <div
      className={cn(
        "group flex items-start gap-2.5 rounded-md border px-2.5 py-2 transition-colors",
        selected
          ? "border-primary/40 bg-accent"
          : "border-transparent hover:border-border hover:bg-surface-strong",
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => toggleSource(source.id)}
        className="mt-1"
        aria-label={`Select ${source.title}`}
      />
      <button
        onClick={() => openSourceAt(source)}
        className="min-w-0 flex-1 text-left"
        title={source.fileName}
      >
        <span className="flex items-start gap-2">
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0">
            <span className="block truncate text-sm leading-snug font-medium">{source.title}</span>
            {!dense && (
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {source.author} · {source.year} · {source.pages} pp
              </span>
            )}
          </span>
        </span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Source options"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => openSourceAt(source)}>
            <Eye className="size-4" /> Open source
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toggleSource(source.id)}>
            <CheckSquare className="size-4" /> {selected ? "Deselect" : "Select"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => removeSource(source.id)}>
            <Trash2 className="size-4" /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
