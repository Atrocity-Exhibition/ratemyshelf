import { describe, expect, it } from "vitest";
import { calculateRatingAggregates } from "./ratingMath";
import { reviewInput } from "./reviewValidation";
import { assertCanReview } from "../server/routers/reviews";

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
  it("uses the raw overall average for a single review", () => {
    const result = calculateRatingAggregates([
      {
        scoreOverall: 85,
        scoreStory: null,
        scoreCharacters: null,
        scoreWorldBuilding: null,
        abuseScore: 0,
      },
    ]);

    expect(result.bayesianScore).toBe(85);
  });

  it("accepts an overall-only rating, including a score of zero", () => {
    const shortReview = {
      novelId: "nov_123",
      scoreOverall: 0,
    };
    const result = reviewInput.safeParse(shortReview);
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
    const result = reviewInput.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("accepts an explicit null body with omitted dimensions", () => {
    const result = reviewInput.safeParse({
      novelId: "nov_123",
      body: null,
      scoreOverall: 42,
    });
    expect(result.success).toBe(true);
  });

  it("allows a newly-created authenticated non-banned account to submit immediately", async () => {
    await expect(
      assertCanReview({
        db: {
          user: {
            findUnique: async () => ({ role: "USER", isBanned: false }),
          },
        },
        session: { user: { id: "new-user" } },
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects scores outside of their ranges", () => {
    const invalidScoreReview = {
      novelId: "nov_123",
      scoreStory: 0,
      scoreCharacters: 11,
      scoreWorldBuilding: 5,
      scoreOverall: 101,
    };
    const result = reviewInput.safeParse(invalidScoreReview);
    expect(result.success).toBe(false);
  });

  it("properly masks spoilers for regular readers while revealing for authors or staff", () => {
    const originalBody = "Darth Vader is Luke's father! ".repeat(6);
    expect(maskSpoilerBody(originalBody, true, false)).toBe("[SPOILER HIDDEN]");
    expect(maskSpoilerBody(originalBody, true, true)).toBe(originalBody);
    expect(maskSpoilerBody(originalBody, false, false)).toBe(originalBody);
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
