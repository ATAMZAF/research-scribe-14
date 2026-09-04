/**
 * Research service abstraction.
 *
 * This is the single seam between the UI and whatever answers research
 * questions. Today it is backed by a local mock. Later a local runtime
 * (e.g. a model served on the user's own machine) can implement the same
 * interface and be swapped in via `setResearchService` — no UI changes.
 *
 * Nothing here talks to a cloud service, and nothing here should.
 */
import type { AnswerBlock, CitationRef, ResearchEntry, Source } from "@/data/mock";

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

function buildMockResult(req: ResearchRequest): ResearchResult {
  const used = req.sources.slice(0, 3);
  const citations: CitationRef[] = used.map((s, i) => ({
    id: `c${i + 1}`,
    sourceId: s.id,
    page: 3 + i * 4,
    excerpt: s.excerpt,
  }));
  const marks = used.map((_, i) => `[${i + 1}]`).join(" ");

  const blocks: AnswerBlock[] = [
    { type: "heading", text: "Research finding" },
    {
      type: "paragraph",
      text: `This is a demonstration answer for “${req.question}”. It was generated locally from mock data across ${req.sources.length} source${req.sources.length === 1 ? "" : "s"} (${req.scopeLabel}) and does not reflect real document content ${marks}.`,
    },
    {
      type: "bullets",
      items: used.map(
        (s, i) => `${s.title} contributes a placeholder observation to this answer [${i + 1}]`,
      ),
    },
    { type: "heading", text: "Evidence overview" },
    {
      type: "table",
      headers: ["Source", "Page", "Relevance"],
      rows: citations.map((c, i) => [
        used[i]?.title ?? "—",
        String(c.page),
        i === 0 ? "High" : i === 1 ? "Medium" : "Supporting",
      ]),
    },
    {
      type: "numbered",
      items: [
        "Connect a local model runtime to replace this mock response.",
        "Citations below already map to the source viewer.",
      ],
    },
  ];

  return { blocks, citations };
}

const mockService: ResearchService = {
  name: "mock-local",
  async ask(req) {
    await new Promise((r) => setTimeout(r, 1400));
    return buildMockResult(req);
  },
};

let current: ResearchService = mockService;

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
    askedAt: "Just now",
    blocks,
    citations,
  };
}
