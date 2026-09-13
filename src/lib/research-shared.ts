/** Shared research types and validation, safe for both client and server. */
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

export type ResearchAskInput = z.infer<typeof askInputSchema>;

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

/**
 * Stable hosted preview endpoint used as the AI proxy during local development,
 * so localhost needs no API keys at all.
 */
export const REMOTE_RESEARCH_PROXY_URL =
  "https://project--835e8c90-9260-430a-a7f6-a9c982b742e1-dev.lovable.app/api/public/research";
