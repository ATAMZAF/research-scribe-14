import { useMemo, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SourceCard } from "./SourceCard";
import { UploadDialog } from "./UploadDialog";
import { useWorkspace } from "@/state/workspace";

export function SourceList() {
  const { notebook, selectedIds, clearSelection } = useWorkspace();
  const [query, setQuery] = useState("");
  const [upload, setUpload] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notebook.sources;
    return notebook.sources.filter((s) =>
      [s.title, s.author, s.kind, s.addedAt, String(s.year)].join(" ").toLowerCase().includes(q),
    );
  }, [notebook.sources, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          Sources
        </h2>
        {selectedIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Clear {selectedIds.length}
          </button>
        )}
      </div>

      <div className="relative mb-2">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sources..."
          className="h-8 bg-card pl-8 text-sm"
        />
      </div>

      <div className="-mx-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1">
        {results.map((s) => (
          <SourceCard key={s.id} source={s} />
        ))}
        {results.length === 0 && (
          <p className="px-2 py-8 text-center text-xs text-muted-foreground">
            {notebook.sources.length === 0
              ? "No sources in this notebook yet."
              : "No sources match your search."}
          </p>
        )}
      </div>

      <div className="pt-3">
        <Button variant="outline" className="w-full justify-center" onClick={() => setUpload(true)}>
          <Plus className="size-4" /> Add sources
        </Button>
      </div>
      <UploadDialog open={upload} onOpenChange={setUpload} />
    </div>
  );
}
