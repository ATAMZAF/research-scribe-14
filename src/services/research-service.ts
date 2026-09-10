/**
 * Research service abstraction.
 *
 * This is the single seam between the UI and whatever answers research
 * questions. It is backed by Google Gemini called directly over REST with the
 * user's own API key: relevant passages from the in-scope sources are
 * extracted here and sent to the model as structured context with explicit
 * citation instructions.
 */
import type { AnswerBlock, CitationRef, ResearchEntry, Source } from "@/data/mock";
import type { ResearchPassage } from "@/lib/research.functions";
import { askGeminiDirect, type GeminiRawBlock } from "@/lib/gemini-client";

export interface ResearchRequest {
  question: string;
  sources: Source[];
  scopeLabel: string;
}

export interface ResearchResult {
  blocks: AnswerBlock[];
  citations: CitationRef[];
}

export interface ResearchService {
  readonly name: string;
  ask(req: ResearchRequest): Promise<ResearchResult>;
}

const MAX_PASSAGES = 24;
const MAX_CHARS = 2400;

/** Rank a source's pages against the question and keep the most relevant ones. */
function extractPassages(req: ResearchRequest): ResearchPassage[] {
  const terms = req.question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);

  const scored: (ResearchPassage & { score: number })[] = [];

  for (const source of req.sources) {
    const pages = source.pageText.length ? source.pageText : [source.excerpt];
    pages.forEach((text, i) => {
      if (!text?.trim()) return;
      const lower = text.toLowerCase();
      const score = terms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);
      scored.push({
        sourceId: source.id,
        title: source.title,
        author: source.author,
        year: source.year,
        page: i + 1,
        text: text.slice(0, MAX_CHARS),
        score,
      });
    });
  }

  const anyMatch = scored.some((p) => p.score > 0);
  const ranked = anyMatch ? [...scored].sort((a, b) => b.score - a.score) : scored;

  return ranked.slice(0, MAX_PASSAGES).map(({ score: _score, ...p }) => p);
}

function toAnswerBlocks(blocks: GeminiRawBlock[]): AnswerBlock[] {
  return blocks.map((b) => {
    if (b.type === "table") {
      return {
        type: "table" as const,
        headers: b.headers ?? [],
        rows: (b.rows ?? []).map((r) => r.cells),
      };
    }
    if (b.type === "bullets" || b.type === "numbered") {
      return { type: b.type, items: b.items ?? [] };
    }
    return { type: b.type, text: b.text ?? "" };
  });
}

const geminiService: ResearchService = {
  name: "google gemini",
  async ask(req) {
    const passages = extractPassages(req);
    const result = await askGeminiDirect({
      question: req.question,
      scopeLabel: req.scopeLabel,
      passages,
    });

    if (result.error) {
      return {
        blocks: [{ type: "paragraph", text: result.error }],
        citations: [],
      };
    }

    return {
      blocks: toAnswerBlocks(result.blocks),
      citations: result.citations.map((c, i) => ({
        id: `c${i + 1}`,
        sourceId: c.sourceId,
        page: c.page,
        excerpt: c.excerpt,
      })),
    };
  },
};

let current: ResearchService = geminiService;

export const setResearchService = (svc: ResearchService) => {
  current = svc;
};
export const getResearchService = () => current;

export async function askResearchQuestion(req: ResearchRequest): Promise<ResearchEntry> {
  const { blocks, citations } = await current.ask(req);
  return {
    id: crypto.randomUUID(),
    question: req.question,
    scopeLabel: req.scopeLabel,
    askedAt: new Date().toISOString(),
    blocks,
    citations,
  };
}
