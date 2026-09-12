/**
 * Research answer client.
 *
 * Calls the native Lovable AI bridge (a server function) instead of talking to
 * a model provider directly — no API key is needed in the browser.
 */
import { askResearch, type ResearchAnswerBlock, type ResearchPassage } from "./research.functions";

export type GeminiRawBlock = ResearchAnswerBlock;

export type GeminiAnswer = {
  error: string | null;
  blocks: GeminiRawBlock[];
  citations: { sourceId: string; page: number; excerpt: string }[];
};

export async function askGeminiDirect(input: {
  question: string;
  scopeLabel: string;
  passages: ResearchPassage[];
}): Promise<GeminiAnswer> {
  try {
    return await askResearch({ data: input });
  } catch {
    return {
      error: "Could not reach the AI service. Check your connection and try again.",
      blocks: [],
      citations: [],
    };
  }
}
