import { z } from "zod";

export const reviewInput = z.object({
  novelId: z.string().min(1),
  body: z.string().nullable().optional(),
  containsSpoiler: z.boolean().default(false),
  scoreStory: z.number().int().min(1).max(10).nullable().optional(),
  scoreCharacters: z.number().int().min(1).max(10).nullable().optional(),
  scoreWorldBuilding: z.number().int().min(1).max(10).nullable().optional(),
  scoreOverall: z.number().int().min(0).max(100),
});
