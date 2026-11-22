import { describe, expect, it } from "vitest";
import { buildFilter, searchInput } from "../server/routers/search";

describe("novel search score filtering", () => {
  it("accepts the full 0-100 score range", () => {
    expect(
      searchInput.parse({ filters: { minScore: 0 } }).filters?.minScore,
    ).toBe(0);
    expect(
      searchInput.parse({ filters: { minScore: 100 } }).filters?.minScore,
    ).toBe(100);
  });

  it("rejects score thresholds outside 0-100", () => {
    expect(searchInput.safeParse({ filters: { minScore: -1 } }).success).toBe(
      false,
    );
    expect(searchInput.safeParse({ filters: { minScore: 101 } }).success).toBe(
      false,
    );
  });

  it("builds a 100-point Meilisearch score filter", () => {
    expect(buildFilter({ minScore: 85 })).toBe("bayesianScore >= 85");
  });
});
