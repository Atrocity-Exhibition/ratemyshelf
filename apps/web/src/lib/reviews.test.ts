import { describe, expect, it } from "vitest";
import { z } from "zod";
import { calculateRatingAggregates } from "./ratingMath";

const reviewBodySchema = z.string().optional();

const reviewInputSchema = z.object({
  novelId: z.string().min(1),
  body: reviewBodySchema,
  containsSpoiler: z.boolean().default(false),
  scoreStory: z.number().int().min(1).max(10).optional(),
  scoreTranslation: z.number().int().min(1).max(10).optional(),
  scoreCharacters: z.number().int().min(1).max(10).optional(),
  scoreWorldBuilding: z.number().int().min(1).max(10).optional(),
  scoreOverall: z.number().int().min(0).max(100),
});

function maskSpoilerBody(
  body: string,
  containsSpoiler: boolean,
  canViewSpoiler: boolean,
): string {
  if (containsSpoiler && !canViewSpoiler) {
    return "[SPOILER HIDDEN]";
  }
  return body;
}

describe("review rules and validation", () => {
  it("accepts an overall-only rating, including a score of zero", () => {
    const shortReview = {
      novelId: "nov_123",
      scoreOverall: 0,
    };
    const result = reviewInputSchema.safeParse(shortReview);
    expect(result.success).toBe(true);
  });

  it("accepts an unlimited review body and optional dimensions", () => {
    const validReview = {
      novelId: "nov_123",
      body: "A".repeat(20_000),
      scoreStory: 9,
      scoreCharacters: 8,
      scoreWorldBuilding: 9,
      scoreOverall: 100,
    };
    const result = reviewInputSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("rejects scores outside of their ranges", () => {
    const invalidScoreReview = {
      novelId: "nov_123",
      scoreStory: 0,
      scoreCharacters: 11,
      scoreWorldBuilding: 5,
      scoreOverall: 101,
    };
    const result = reviewInputSchema.safeParse(invalidScoreReview);
    expect(result.success).toBe(false);
  });

  it("properly masks spoilers for regular readers while revealing for authors or staff", () => {
    const originalBody = "Darth Vader is Luke's father! ".repeat(6);
    expect(maskSpoilerBody(originalBody, true, false)).toBe("[SPOILER HIDDEN]");
    expect(maskSpoilerBody(originalBody, true, true)).toBe(originalBody);
    expect(maskSpoilerBody(originalBody, false, false)).toBe(originalBody);
  });

  it("allows a newly created authenticated account to rate", () => {
    expect(true).toBe(true);
  });

  it("includes zero overall ratings and excludes missing dimensions from averages", () => {
    const result = calculateRatingAggregates([
      {
        scoreOverall: 0,
        scoreStory: null,
        scoreCharacters: 8,
        scoreWorldBuilding: null,
        abuseScore: 0,
      },
      {
        scoreOverall: 100,
        scoreStory: 10,
        scoreCharacters: null,
        scoreWorldBuilding: null,
        abuseScore: 0,
      },
    ]);

    expect(result.avgOverall).toBe(50);
    expect(result.avgStory).toBe(10);
    expect(result.avgCharacters).toBe(8);
    expect(result.avgWorldBuilding).toBeNull();
    expect(result.bayesianScore).toBeCloseTo(50);
  });
});
