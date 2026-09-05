/**
 * Core domain types and static research-action definitions.
 * The application ships with no preloaded notebooks, sources, or research
 * history — all content comes from the user (uploads, notes) or, later,
 * from a locally connected model via the research service.
 */

export type SourceKind = "pdf" | "txt" | "docx" | "csv";

export interface Source {
  id: string;
  title: string;
  fileName: string;
  author: string;
  year: number;
  pages: number;
  kind: SourceKind;
  addedAt: string;
  excerpt: string;
  /** Mock page-by-page text used by the source viewer. */
  pageText: string[];
}

export interface CitationRef {
  id: string;
  sourceId: string;
  page: number;
  excerpt: string;
}

export type AnswerBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "math"; text: string; caption?: string };

export interface ResearchEntry {
  id: string;
  question: string;
  scopeLabel: string;
  askedAt: string;
  blocks: AnswerBlock[];
  citations: CitationRef[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  name: string;
  icon: string;
  description: string;
  updatedLabel: string;
  sources: Source[];
  history: ResearchEntry[];
  notes: Note[];
}

export const researchActions = [
  { id: "summarize", label: "Summarize", prompt: "Summarize the selected sources." },
  { id: "compare", label: "Compare sources", prompt: "Compare the selected sources." },
  {
    id: "disagreements",
    label: "Find disagreements",
    prompt: "Where do the selected sources disagree?",
  },
  {
    id: "common",
    label: "Find common findings",
    prompt: "What findings are shared across the selected sources?",
  },
  {
    id: "methodology",
    label: "Extract methodology",
    prompt: "Extract the methodology used in the selected sources.",
  },
  {
    id: "results",
    label: "Extract key results",
    prompt: "Extract the key results from the selected sources.",
  },
  {
    id: "gaps",
    label: "Identify research gaps",
    prompt: "Identify research gaps across the selected sources.",
  },
] as const;
