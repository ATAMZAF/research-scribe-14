import { createContext } from "react";
import type { CitationRef, Note, Notebook, ResearchEntry, Source, SourceKind } from "@/data/mock";

export type Scope = "all" | "selected" | "current";

export interface WorkspaceValue {
  notebooks: Notebook[];
  notebook: Notebook;
  setNotebookId: (id: string) => void;
  createNotebook: (name: string) => void;

  selectedIds: string[];
  toggleSource: (id: string) => void;
  clearSelection: () => void;

  scope: Scope;
  setScope: (s: Scope) => void;
  scopeSources: Source[];
  scopeLabel: string;

  openSource: Source | null;
  openSourceAt: (source: Source, page?: number) => void;
  closeSource: () => void;
  viewerPage: number;
  setViewerPage: (p: number) => void;
  viewerHighlight: string | null;

  history: ResearchEntry[];
  pendingQuestion: string | null;
  ask: (question: string) => Promise<void>;

  activeCitation: { citation: CitationRef; source: Source; index: number } | null;
  setActiveCitation: (c: { citation: CitationRef; source: Source; index: number } | null) => void;

  addSources: (files: { name: string; kind: SourceKind }[]) => void;
  saveNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  removeSource: (id: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceValue | null>(null);
