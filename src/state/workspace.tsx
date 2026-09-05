import {
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Note, type Notebook, type Source } from "@/data/mock";
import { askResearchQuestion } from "@/services/research-service";
import { WorkspaceContext, type Scope, type WorkspaceValue } from "./workspace-context";

export type { Scope, WorkspaceValue };




const blankNotebook = (): Notebook => ({
  id: crypto.randomUUID(),
  name: "My first notebook",
  icon: "📓",
  description: "Add sources and start asking research questions.",
  updatedLabel: "Updated just now",
  sources: [],
  history: [],
  notes: [],
});

const initialNotebook = blankNotebook();

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([initialNotebook]);
  const [notebookId, setNotebookId] = useState(initialNotebook.id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scope, setScope] = useState<Scope>("all");
  const [openSource, setOpenSource] = useState<Source | null>(null);
  const [viewerPage, setViewerPage] = useState(1);
  const [viewerHighlight, setViewerHighlight] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<WorkspaceValue["activeCitation"]>(null);

  const notebook = notebooks.find((n) => n.id === notebookId) ?? notebooks[0] ?? initialNotebook;

  const patch = useCallback(
    (fn: (nb: Notebook) => Notebook) =>
      setNotebooks((prev) => prev.map((n) => (n.id === notebookId ? fn(n) : n))),
    [notebookId],
  );

  const selected = notebook.sources.filter((s) => selectedIds.includes(s.id));
  const scopeSources =
    scope === "all"
      ? notebook.sources
      : scope === "selected"
        ? selected
        : openSource
          ? [openSource]
          : notebook.sources;

  const scopeLabel =
    scope === "all"
      ? "All sources"
      : scope === "selected"
        ? `Selected sources (${selected.length})`
        : "This source";

  const value: WorkspaceValue = {
    notebooks,
    notebook,
    setNotebookId: (id) => {
      setNotebookId(id);
      setSelectedIds([]);
      setScope("all");
      setOpenSource(null);
    },
    createNotebook: (name) => {
      const nb: Notebook = {
        id: crypto.randomUUID(),
        name,
        icon: "📓",
        description: "New research notebook.",
        updatedLabel: "Updated just now",
        sources: [],
        history: [],
        notes: [],
      };
      setNotebooks((p) => [...p, nb]);
      setNotebookId(nb.id);
      setSelectedIds([]);
    },
    selectedIds,
    toggleSource: (id) =>
      setSelectedIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        if (next.length) setScope("selected");
        else setScope("all");
        return next;
      }),
    clearSelection: () => {
      setSelectedIds([]);
      setScope("all");
    },
    scope,
    setScope,
    scopeSources,
    scopeLabel,
    openSource,
    openSourceAt: (source, page = 1) => {
      setOpenSource(source);
      setViewerPage(page);
      setViewerHighlight(null);
    },
    closeSource: () => setOpenSource(null),
    viewerPage,
    setViewerPage,
    viewerHighlight,
    history: notebook.history,
    pendingQuestion,
    ask: async (question) => {
      setPendingQuestion(question);
      const entry = await askResearchQuestion({
        question,
        sources: scopeSources.length ? scopeSources : notebook.sources,
        scopeLabel,
      });
      patch((nb) => ({ ...nb, history: [entry, ...nb.history] }));
      setPendingQuestion(null);
    },
    activeCitation,
    setActiveCitation: (c) => {
      setActiveCitation(c);
      if (c) setViewerHighlight(c.citation.excerpt);
    },
    addSources: (files) =>
      patch((nb) => ({
        ...nb,
        sources: [
          ...nb.sources,
          ...files.map((f, i) => ({
            id: crypto.randomUUID(),
            title: f.name.replace(/\.[a-z]+$/i, ""),
            fileName: f.name,
            author: "Unknown (uploaded)",
            year: new Date().getFullYear(),
            pages: 8 + i,
            kind: f.kind,
            addedAt: new Date().toISOString().slice(0, 10),
            excerpt: "Uploaded document. Text extraction is not enabled in this iteration.",
            pageText: Array.from(
              { length: 8 + i },
              (_, p) =>
                `${f.name} — page ${p + 1}\n\nDocument processing is not enabled yet, so this placeholder page is shown instead of the original content.`,
            ),
          })),
        ],
      })),
    saveNote: (note) =>
      patch((nb) => ({
        ...nb,
        notes: nb.notes.some((n) => n.id === note.id)
          ? nb.notes.map((n) => (n.id === note.id ? note : n))
          : [note, ...nb.notes],
      })),
    deleteNote: (id) => patch((nb) => ({ ...nb, notes: nb.notes.filter((n) => n.id !== id) })),
    removeSource: (id) => patch((nb) => ({ ...nb, sources: nb.sources.filter((s) => s.id !== id) })),
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

export function useSourceLookup() {
  const { notebook } = useWorkspace();
  return useMemo(
    () => Object.fromEntries(notebook.sources.map((s) => [s.id, s])) as Record<string, Source>,
    [notebook.sources],
  );
}
