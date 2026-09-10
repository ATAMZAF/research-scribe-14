/**
 * Shared research types.
 *
 * Questions are answered by calling Google's Gemini REST API directly from the
 * browser with the user's own API key (see `gemini-client.ts`); there is no
 * gateway or server-side proxy involved.
 */
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
