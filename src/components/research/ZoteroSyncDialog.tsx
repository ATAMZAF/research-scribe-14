import { useEffect, useState } from "react";
import { Library, Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchZoteroCollections,
  fetchZoteroItems,
  type ZoteroCollection,
  type ZoteroReference,
} from "@/lib/zotero.functions";
import { hasZoteroCredentials, loadZoteroSettings } from "@/lib/zotero-settings";
import { useWorkspace } from "@/state/workspace";
import type { Source } from "@/data/mock";

function toSource(ref: ZoteroReference): Source {
  const body =
    ref.abstract ||
    `No abstract is stored in Zotero for this reference.${ref.publication ? ` Published in ${ref.publication}.` : ""}`;
  return {
    id: `zotero-${ref.key}`,
    title: ref.title,
    fileName: ref.pdfTitle ?? `${ref.title}.${ref.hasPdf ? "pdf" : "txt"}`,
    author: ref.author,
    year: ref.year || new Date().getFullYear(),
    pages: 1,
    kind: ref.hasPdf ? "pdf" : "txt",
    addedAt: new Date().toISOString().slice(0, 10),
    excerpt: body.slice(0, 240),
    pageText: [
      `${ref.title}\n${ref.author}${ref.year ? ` (${ref.year})` : ""}${ref.publication ? ` — ${ref.publication}` : ""}\n\n${body}`,
    ],
  };
}

export function ZoteroSyncDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addSourceObjects } = useWorkspace();
  const [collections, setCollections] = useState<ZoteroCollection[]>([]);
  const [collection, setCollection] = useState("all");
  const [items, setItems] = useState<ZoteroReference[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = loadZoteroSettings();
  const configured = hasZoteroCredentials(settings);

  const load = async (collectionKey: string) => {
    const creds = loadZoteroSettings();
    if (!hasZoteroCredentials(creds)) return;
    setLoading(true);
    setError(null);
    const payload = {
      libraryType: creds.libraryType,
      libraryId: creds.libraryId.trim(),
      apiKey: creds.apiKey.trim(),
    };
    const [cols, res] = await Promise.all([
      fetchZoteroCollections({ data: payload }),
      fetchZoteroItems({
        data: collectionKey === "all" ? payload : { ...payload, collectionKey },
      }),
    ]);
    if (cols.collections.length) setCollections(cols.collections);
    if (res.error) setError(res.error);
    setItems(res.items);
    setPicked(res.items.map((i) => i.key));
    setLoading(false);
  };

  useEffect(() => {
    if (open && configured) void load("all");
    if (!open) {
      setItems([]);
      setPicked([]);
      setError(null);
      setCollection("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const importPicked = () => {
    addSourceObjects(items.filter((i) => picked.includes(i.key)).map(toSource));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="size-4" /> Sync Zotero library
          </DialogTitle>
          <DialogDescription>
            Load references, metadata and abstracts from your Zotero library into this notebook.
          </DialogDescription>
        </DialogHeader>

        {!configured ? (
          <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Add your Zotero library ID and API key in Settings first.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Select
                value={collection}
                onValueChange={(v) => {
                  setCollection(v);
                  void load(v);
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Entire library</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.name} ({c.numItems})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => void load(collection)} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Refresh
              </Button>
              <span className="ml-auto text-xs text-muted-foreground">
                {picked.length} of {items.length} selected
              </span>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="max-h-80 min-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-1">
              {loading && items.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Loading references from Zotero…
                </p>
              )}
              {!loading && items.length === 0 && !error && (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No references found in this selection.
                </p>
              )}
              {items.map((i) => (
                <label
                  key={i.key}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-surface-strong"
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={picked.includes(i.key)}
                    onCheckedChange={(v) =>
                      setPicked((p) => (v ? [...p, i.key] : p.filter((k) => k !== i.key)))
                    }
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{i.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {i.author}
                      {i.year ? ` · ${i.year}` : ""} · {i.itemType}
                      {i.hasPdf ? " · PDF attached" : ""}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={importPicked} disabled={!configured || picked.length === 0}>
            Add {picked.length || ""} to notebook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
