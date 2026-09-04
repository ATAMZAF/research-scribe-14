import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Bold, List, Heading2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/state/workspace";

export function NotesEditor() {
  const { notebook, saveNote, deleteNote } = useWorkspace();
  const notes = notebook.notes;
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);
  const [title, setTitle] = useState(notes[0]?.title ?? "");
  const [body, setBody] = useState(notes[0]?.body ?? "");
  const [saved, setSaved] = useState(true);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const active = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId]);

  useEffect(() => {
    setTitle(active?.title ?? "");
    setBody(active?.body ?? "");
    setSaved(true);
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeId || saved) return;
    const t = setTimeout(() => {
      saveNote({ id: activeId, title: title || "Untitled note", body, updatedAt: "Just now" });
      setSaved(true);
    }, 600);
    return () => clearTimeout(t);
  }, [title, body, saved, activeId, saveNote]);

  const create = () => {
    const id = crypto.randomUUID();
    saveNote({ id, title: "Untitled note", body: "", updatedAt: "Just now" });
    setActiveId(id);
  };

  const wrap = (prefix: string, suffix = prefix) => {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const next = body.slice(0, s) + prefix + body.slice(s, e) + suffix + body.slice(e);
    setBody(next);
    setSaved(false);
  };

  const linePrefix = (p: string) => {
    const el = textRef.current;
    if (!el) return;
    const start = body.lastIndexOf("\n", el.selectionStart - 1) + 1;
    setBody(body.slice(0, start) + p + body.slice(start));
    setSaved(false);
  };

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      <div className="w-56 shrink-0 border-r border-border pr-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Notes
          </h3>
          <button onClick={create} aria-label="New note">
            <Plus className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <ul className="space-y-0.5">
          {notes.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => setActiveId(n.id)}
                className={cn(
                  "w-full rounded-md px-2.5 py-2 text-left transition-colors",
                  n.id === activeId ? "bg-accent" : "hover:bg-surface-strong",
                )}
              >
                <span className="block truncate text-sm font-medium">{n.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {n.body.split("\n")[0] || "Empty note"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {notes.length === 0 && (
          <p className="px-1 py-6 text-xs text-muted-foreground">
            No notes yet. Create one to start recording findings.
          </p>
        )}
      </div>

      {active ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(false);
              }}
              className="h-9 border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              placeholder="Note title"
            />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {saved ? (
                <>
                  <Check className="size-3.5" /> Saved locally
                </>
              ) : (
                "Saving…"
              )}
            </span>
            <Button variant="ghost" size="icon" onClick={() => deleteNote(active.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-1 border-y border-border py-1.5">
            <Button variant="ghost" size="sm" onClick={() => wrap("**")}>
              <Bold className="size-3.5" /> Bold
            </Button>
            <Button variant="ghost" size="sm" onClick={() => linePrefix("## ")}>
              <Heading2 className="size-3.5" /> Heading
            </Button>
            <Button variant="ghost" size="sm" onClick={() => linePrefix("- ")}>
              <List className="size-3.5" /> Bullet
            </Button>
          </div>

          <textarea
            ref={textRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSaved(false);
            }}
            placeholder="Write your research notes…"
            className="mt-3 min-h-0 flex-1 resize-none bg-transparent font-serif text-[16px] leading-[1.8] outline-none placeholder:font-sans placeholder:text-muted-foreground"
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Select or create a note.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={create}>
              <Plus className="size-4" /> New note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
