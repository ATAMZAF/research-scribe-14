/**
 * Direct Google Gemini API client.
 *
 * Uses the key from VITE_GEMINI_API_KEY or the one the user saved in Settings
 * (localStorage `gemini_api_key`).
 */
import { GEMINI_MODEL, loadGeminiKey } from "./gemini-settings";
import type { ResearchPassage } from "./research.functions";

export type GeminiRawBlock = {
  type: "heading" | "paragraph" | "bullets" | "numbered" | "table";
  text?: string | null;
  items?: string[] | null;
  headers?: string[] | null;
  rows?: { cells: string[] }[] | null;
};

export type GeminiAnswer = {
  error: string | null;
  blocks: GeminiRawBlock[];
  citations: { sourceId: string; page: number; excerpt: string }[];
};

const responseSchema = {
  type: "object",
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["heading", "paragraph", "bullets", "numbered", "table"],
          },
          text: { type: "string" },
          items: { type: "array", items: { type: "string" } },
          headers: { type: "array", items: { type: "string" } },
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: { cells: { type: "array", items: { type: "string" } } },
              required: ["cells"],
            },
          },
        },
        required: ["type"],
      },
    },
    citations: {
      type: "array",
      items: {
        type: "object",
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

export async function askGeminiDirect(input: {
  question: string;
  scopeLabel: string;
  passages: ResearchPassage[];
}): Promise<GeminiAnswer> {
  const apiKey = loadGeminiKey();
  if (!apiKey) {
    return {
      error: "No Gemini API key yet — add one in Settings to start asking questions.",
      blocks: [],
      citations: [],
    };
  }

  const context = input.passages.length
    ? input.passages
        .map(
          (p, i) =>
            `[${i + 1}] id=${p.sourceId} | "${p.title}" — ${p.author} (${p.year}), p.${p.page}\n${p.text}`,
        )
        .join("\n\n")
    : "(no source passages available)";

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Scope: ${input.scopeLabel}\n\nCONTEXT:\n${context}\n\nQUESTION:\n${input.question}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
          },
        }),
      },
    );
  } catch {
    return { error: "Could not reach Gemini. Check your connection and try again.", blocks: [], citations: [] };
  }

  if (!res.ok) {
    let message = "Gemini could not answer right now.";
    if (res.status === 400 || res.status === 401 || res.status === 403)
      message = "That Gemini API key was rejected. Check the key in Settings.";
    else if (res.status === 429) message = "Too many requests right now — try again in a moment.";
    return { error: message, blocks: [], citations: [] };
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  try {
    const parsed = JSON.parse(text) as Omit<GeminiAnswer, "error">;
    return { error: null, blocks: parsed.blocks ?? [], citations: parsed.citations ?? [] };
  } catch {
    return {
      error: null,
      blocks: [{ type: "paragraph", text: text || "No answer was returned." }],
      citations: [],
    };
  }
}
