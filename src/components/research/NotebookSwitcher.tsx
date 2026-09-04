import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/state/workspace";

export function NotebookSwitcher() {
  const { notebooks, notebook, setNotebookId, createNotebook } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group flex w-full items-start gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-surface-strong">
            <span className="text-lg leading-none">{notebook.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{notebook.name}</span>
              <span className="block text-xs text-muted-foreground">
                {notebook.sources.length} sources
              </span>
            </span>
            <ChevronsUpDown className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-[11px] tracking-widest text-muted-foreground uppercase">
            My notebooks
          </DropdownMenuLabel>
          {notebooks.map((nb) => (
            <DropdownMenuItem
              key={nb.id}
              onSelect={() => setNotebookId(nb.id)}
              className="items-start gap-2 py-2"
            >
              <span>{nb.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{nb.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {nb.sources.length} sources
                </span>
              </span>
              {nb.id === notebook.id && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Plus className="size-4" /> New notebook
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New notebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="nb-name">Notebook name</Label>
            <Input
              id="nb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Polymer Coatings Review"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                createNotebook(name.trim());
                setName("");
                setOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
