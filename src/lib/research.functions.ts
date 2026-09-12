/**
 * Research server functions.
 *
 * Questions are answered through the native Lovable AI bridge (server-side
 * gateway call with LOVABLE_API_KEY). No API keys ever reach the browser.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const passageSchema = z.object({
  sourceId: z.string(),
  title: z.string(),
  author: z.string(),
  year: z.number(),
  page: z.number(),
  text: z.string(),
});

export type ResearchPassage = z.infer<typeof passageSchema>;

export const askInputSchema = z.object({
  question: z.string().min(1),
  scopeLabel: z.string(),
  passages: z.array(passageSchema),
});

export type ResearchAnswerBlock = {
  type: "heading" | "paragraph" | "bullets" | "numbered" | "table";
  text?: string | null;
  items?: string[] | null;
  headers?: string[] | null;
  rows?: { cells: string[] }[] | null;
};

export type ResearchAnswerPayload = {
  error: string | null;
  blocks: ResearchAnswerBlock[];
  citations: { sourceId: string; page: number; excerpt: string }[];
};

const MODEL = "openai/gpt-6-astra";

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["heading", "paragraph", "bullets", "numbered", "table"],
          },
          text: { type: ["string", "null"] },
          items: { type: ["array", "null"], items: { type: "string" } },
          headers: { type: ["array", "null"], items: { type: "string" } },
          rows: {
            type: ["array", "null"],
            items: {
              type: "object",
              additionalProperties: false,
              properties: { cells: { type: "array", items: { type: "string" } } },
              required: ["cells"],
            },
          },
        },
        required: ["type", "text", "items", "headers", "rows"],
      },
    },
    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          sourceId: { type: "string" },
          page: { type: "number" },
          excerpt: { type: "string" },
        },
        required: ["sourceId", "page", "excerpt"],
      },
    },
  },
  required: ["blocks", "citations"],
} as const;

const SYSTEM_INSTRUCTION =
  "You are a meticulous academic research assistant working inside a research notebook. " +
  "Answer strictly from the numbered CONTEXT passages. Never invent sources, findings, or references. " +
  "Cite every substantive claim inline with markers like [1] or [2] that match the passage numbers. " +
  "If the context does not answer the question, say so plainly. " +
  "Write in an academic document style: short headings, paragraphs, bullet or numbered lists, and tables where useful. " +
  "In the citations array, reuse the exact id= value of the passage you cited, its page, and a short verbatim excerpt.";

function errorFor(status: number): string {
  if (status === 429) return "Too many requests right now — try again in a moment.";
  if (status === 402) return "The workspace is out of AI credits. Add credits in Lovable to continue.";
  if (status === 403) return "AI access is blocked for this workspace. Check the workspace AI settings.";
  if (status === 401) return "The AI service is not configured correctly for this project.";
  return "The AI service could not answer right now.";
}

export const askResearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => askInputSchema.parse(data))
  .handler(async ({ data }): Promise<ResearchAnswerPayload> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { error: "The AI service is not configured for this project.", blocks: [], citations: [] };
    }

    const context = data.passages.length
      ? data.passages
          .map(
            (p, i) =>
              `[${i + 1}] id=${p.sourceId} | "${p.title}" — ${p.author} (${p.year}), p.${p.page}\n${p.text}`,
          )
          .join("\n\n")
      : "(no source passages available)";

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: MODEL,
          stream: true,
          instructions: SYSTEM_INSTRUCTION,
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `Scope: ${data.scopeLabel}\n\nCONTEXT:\n${context}\n\nQUESTION:\n${data.question}`,
                },
              ],
            },
          ],
          reasoning: { effort: "low", summary: "auto" },
          text: {
            format: {
              type: "json_schema",
              name: "research_answer",
              strict: true,
              schema: jsonSchema,
            },
          },
        }),
      });
    } catch {
      return { error: "Could not reach the AI service. Try again.", blocks: [], citations: [] };
    }

    if (!res.ok || !res.body) {
      return { error: errorFor(res.status), blocks: [], citations: [] };
    }

    // Read the SSE stream and accumulate the answer text.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            text += event.delta;
          } else if (event.type === "response.completed" && event.response?.output_text) {
            if (!text) text = event.response.output_text;
          }
        } catch {
          // ignore keep-alive / partial frames
        }
      }
    }

    try {
      const parsed = JSON.parse(text) as Omit<ResearchAnswerPayload, "error">;
      return { error: null, blocks: parsed.blocks ?? [], citations: parsed.citations ?? [] };
    } catch {
      return {
        error: null,
        blocks: [{ type: "paragraph", text: text || "No answer was returned." }],
        citations: [],
      };
    }
  });
