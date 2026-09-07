/**
 * Research server functions.
 *
 * Questions are answered by Google Gemini through the Lovable AI gateway.
 * Document context is assembled on the client (selected sources / Zotero
 * references) and passed here as structured passages, so the model can cite
 * them with explicit [n] markers.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const passageSchema = z.object({
  sourceId: z.string(),
  title: z.string(),
  author: z.string(),
  year: z.number(),
  page: z.number(),
  text: z.string(),
});

const askSchema = z.object({
  question: z.string().min(1),
  scopeLabel: z.string(),
  passages: z.array(passageSchema),
});

export type ResearchPassage = z.infer<typeof passageSchema>;

const answerSchema = {
  type: "object",
  additionalProperties: false,
  required: ["blocks", "citations"],
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "text", "items", "headers", "rows"],
        properties: {
          type: { type: "string", enum: ["heading", "paragraph", "bullets", "numbered", "table"] },
          text: { type: ["string", "null"] },
          items: { type: ["array", "null"], items: { type: "string" } },
          headers: { type: ["array", "null"], items: { type: "string" } },
          rows: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              required: ["cells"],
              properties: { cells: { type: "array", items: { type: "string" } } },
            },
          },
        },
      },
    },
    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sourceId", "page", "excerpt"],
        properties: {
          sourceId: { type: "string" },
          page: { type: "number" },
          excerpt: { type: "string" },
        },
      },
    },
  },
} as const;

type RawBlock = {
  type: "heading" | "paragraph" | "bullets" | "numbered" | "table";
  text?: string | null;
  items?: string[] | null;
  headers?: string[] | null;
  rows?: { cells: string[] }[] | null;
};

function buildPrompt(data: z.infer<typeof askSchema>) {
  const context = data.passages.length
    ? data.passages
        .map(
          (p, i) =>
            `[${i + 1}] id=${p.sourceId} | "${p.title}" — ${p.author} (${p.year}), p.${p.page}\n${p.text}`,
        )
        .join("\n\n")
    : "(no source passages available)";

  return [
    {
      role: "system",
      content:
        "You are a meticulous academic research assistant working inside a research notebook. " +
        "Answer strictly from the numbered CONTEXT passages. Never invent sources, findings, or references. " +
        "Cite every substantive claim inline with markers like [1] or [2] that match the passage numbers. " +
        "If the context does not answer the question, say so plainly. " +
        "Write in an academic document style: short headings, paragraphs, bullet or numbered lists, and tables where useful. " +
        "In the citations array, reuse the exact id= value of the passage you cited, its page, and a short verbatim excerpt.",
    },
    {
      role: "user",
      content: `Scope: ${data.scopeLabel}\n\nCONTEXT:\n${context}\n\nQUESTION:\n${data.question}`,
    },
  ];
}

export const askResearchQuestionFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => askSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { error: "The AI service is not configured yet." as string, blocks: [], citations: [] };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: buildPrompt(data),
        response_format: {
          type: "json_schema",
          json_schema: { name: "research_answer", strict: true, schema: answerSchema },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      let message = "The research assistant could not answer right now.";
      if (res.status === 429) message = "Too many requests right now — try again in a moment.";
      else if (res.status === 402)
        message = "AI credits are exhausted for this workspace. Add credits to continue.";
      else if (res.status === 403) message = "AI access is blocked for this workspace.";
      console.error("Gemini gateway error", res.status, body.slice(0, 500));
      return { error: message, blocks: [], citations: [] };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";

    let parsed: { blocks?: RawBlock[]; citations?: { sourceId: string; page: number; excerpt: string }[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      return {
        error: null as string | null,
        blocks: [{ type: "paragraph" as const, text: content || "No answer was returned." }],
        citations: [],
      };
    }

    const blocks = (parsed.blocks ?? []).map((b) => {
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

    return {
      error: null as string | null,
      blocks,
      citations: (parsed.citations ?? []).map((c, i) => ({
        id: `c${i + 1}`,
        sourceId: c.sourceId,
        page: c.page,
        excerpt: c.excerpt,
      })),
    };
  });
