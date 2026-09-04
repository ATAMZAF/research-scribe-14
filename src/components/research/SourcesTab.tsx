import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDialog } from "./UploadDialog";
import { SourceCard } from "./SourceCard";
import { useWorkspace } from "@/state/workspace";

export function SourcesTab() {
  const { notebook } = useWorkspace();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState("recent");
  const [upload, setUpload] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notebook.sources
      .filter((s) => (kind === "all" ? true : s.kind === kind))
      .filter((s) =>
        q ? [s.title, s.author, String(s.year)].join(" ").toLowerCase().includes(q) : true,
      )
      .sort((a, b) =>
        sort === "recent"
          ? b.addedAt.localeCompare(a.addedAt)
          : sort === "title"
            ? a.title.localeCompare(b.title)
            : a.author.localeCompare(b.author),
      );
  }, [notebook.sources, query, kind, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="h-9 pl-8"
          />
        </div>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="txt">TXT</SelectItem>
            <SelectItem value="docx">DOCX</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently added</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
            <SelectItem value="author">Author A–Z</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setUpload(true)}>
          <Plus className="size-4" /> Add sources
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-surface px-3 py-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
          <span>Document</span>
          <span>Added</span>
        </div>
        {rows.map((s) => (
          <div
            key={s.id}
            className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-1.5 py-1 last:border-0"
          >
            <SourceCard source={s} />
            <span className="pr-3 text-xs text-muted-foreground">{s.addedAt}</span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No documents match these filters.
          </p>
        )}
      </div>
      <UploadDialog open={upload} onOpenChange={setUpload} />
    </div>
  );
}
