import { describe, expect, it } from "vitest";
import { z } from "zod";

const reviewBodySchema = z.string().min(150).max(10_000);

const reviewInputSchema = z.object({
  novelId: z.string().min(1),
  body: reviewBodySchema,
  containsSpoiler: z.boolean().default(false),
  scoreStory: z.number().int().min(1).max(10),
  scoreTranslation: z.number().int().min(1).max(10).optional(),
  scoreCharacters: z.number().int().min(1).max(10),
  scoreWorldBuilding: z.number().int().min(1).max(10),
  scoreOverall: z.number().int().min(1).max(10),
});

function maskSpoilerBody(body: string, containsSpoiler: boolean, canViewSpoiler: boolean): string {
  if (containsSpoiler && !canViewSpoiler) {
    return "[SPOILER HIDDEN]";
  }
  return body;
}

function checkAccountAgeEligibility(accountCreatedAt: Date, now: Date = new Date()): boolean {
  const ageDays = (now.getTime() - accountCreatedAt.getTime()) / 86_400_000;
  return ageDays >= 7;
}

describe("review rules and validation", () => {
  it("rejects reviews shorter than 150 characters", () => {
    const shortReview = {
      novelId: "nov_123",
      body: "Too short review that does not meet the minimum requirement.",
      scoreStory: 8,
      scoreCharacters: 8,
      scoreWorldBuilding: 8,
      scoreOverall: 8,
    };
    const result = reviewInputSchema.safeParse(shortReview);
    expect(result.success).toBe(false);
  });

  it("accepts valid reviews with all required dimensional scores", () => {
    const validReview = {
      novelId: "nov_123",
      body: "A".repeat(160),
      scoreStory: 9,
      scoreCharacters: 8,
      scoreWorldBuilding: 9,
      scoreOverall: 9,
    };
    const result = reviewInputSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("rejects scores outside of the 1 to 10 range", () => {
    const invalidScoreReview = {
      novelId: "nov_123",
      body: "A".repeat(160),
      scoreStory: 0,
      scoreCharacters: 11,
      scoreWorldBuilding: 5,
      scoreOverall: 5,
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

  it("enforces the 7-day account age gate correctly", () => {
    const now = new Date("2026-11-20T12:00:00Z");
    const newAccount = new Date("2026-11-18T12:00:00Z"); // 2 days old
    const oldAccount = new Date("2026-11-10T12:00:00Z"); // 10 days old

    expect(checkAccountAgeEligibility(newAccount, now)).toBe(false);
    expect(checkAccountAgeEligibility(oldAccount, now)).toBe(true);
  });
});
