/**
 * Server-only helpers that turn research passages into an answer.
 *
 * Shared by the app-internal server function and the public proxy route
 * (`/api/public/research`) that local development calls.
 */
import type { ResearchAnswerPayload, ResearchAskInput } from "./research-shared";

export const MODEL = "openai/gpt-6-astra";

export const jsonSchema = {
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

export const SYSTEM_INSTRUCTION =
  "You are a meticulous academic research assistant working inside a research notebook. " +
  "Answer strictly from the numbered CONTEXT passages. Never invent sources, findings, or references. " +
  "Cite every substantive claim inline with markers like [1] or [2] that match the passage numbers. " +
  "If the context does not answer the question, say so plainly. " +
  "Write in an academic document style: short headings, paragraphs, bullet or numbered lists, and tables where useful. " +
  "In the citations array, reuse the exact id= value of the passage you cited, its page, and a short verbatim excerpt.";

export function errorFor(status: number): string {
  if (status === 429) return "Too many requests right now — try again in a moment.";
  if (status === 402) return "The workspace is out of AI credits. Add credits in Lovable to continue.";
  if (status === 403) return "AI access is blocked for this workspace. Check the workspace AI settings.";
  if (status === 401) return "The AI service is not configured correctly for this project.";
  return "The AI service could not answer right now.";
}

/** Parse the model's JSON answer, degrading to a plain paragraph. */
export function toPayload(text: string): ResearchAnswerPayload {
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
}

export function buildPrompt(data: ResearchAskInput): string {
  const context = data.passages.length
    ? data.passages
        .map(
          (p, i) =>
            `[${i + 1}] id=${p.sourceId} | "${p.title}" — ${p.author} (${p.year}), p.${p.page}\n${p.text}`,
        )
        .join("\n\n")
    : "(no source passages available)";

  return `Scope: ${data.scopeLabel}\n\nCONTEXT:\n${context}\n\nQUESTION:\n${data.question}\n\nRespond with JSON matching: {"blocks":[{"type":"heading|paragraph|bullets|numbered|table","text":string|null,"items":string[]|null,"headers":string[]|null,"rows":[{"cells":string[]}]|null}],"citations":[{"sourceId":string,"page":number,"excerpt":string}]}`;
}

/** Call the Lovable AI gateway (streaming) and accumulate the answer text. */
export async function askLovableGateway(
  apiKey: string,
  prompt: string,
): Promise<ResearchAnswerPayload> {
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
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
        reasoning: { effort: "low", summary: "auto" },
        text: {
          format: { type: "json_schema", name: "research_answer", strict: true, schema: jsonSchema },
        },
      }),
    });
  } catch {
    return { error: "Could not reach the AI service. Try again.", blocks: [], citations: [] };
  }

  if (!res.ok || !res.body) {
    return { error: errorFor(res.status), blocks: [], citations: [] };
  }

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

  return toPayload(text);
}

/** Optional local-dev fallback: Google's Gemini REST API with GEMINI_API_KEY. */
export async function askGeminiRest(
  apiKey: string,
  prompt: string,
): Promise<ResearchAnswerPayload> {
  const model = process.env["GEMINI_MODEL"] ?? "gemini-2.5-flash";
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
  } catch {
    return { error: "Could not reach the AI service. Try again.", blocks: [], citations: [] };
  }

  if (!res.ok) return { error: errorFor(res.status), blocks: [], citations: [] };

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return toPayload(text);
}
