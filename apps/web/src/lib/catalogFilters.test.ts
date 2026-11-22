import { describe, expect, it } from "vitest";
import { buildRelationClauses, parseSlugList } from "./catalogFilters";

describe("catalog filter helpers", () => {
  it("trims, removes empty values, and deduplicates slugs", () => {
    expect(parseSlugList(" fantasy, ,romance,fantasy ")).toEqual([
      "fantasy",
      "romance",
    ]);
  });

  it("ignores malformed slug values", () => {
    expect(parseSlugList("fantasy,not a slug,!,romance--")).toEqual([
      "fantasy",
      "romance--",
    ]);
  });

  it("builds one required relation clause per included slug", () => {
    expect(
      buildRelationClauses("genres", ["fantasy", "romance"], undefined),
    ).toEqual([
      { genres: { some: { slug: "fantasy" } } },
      { genres: { some: { slug: "romance" } } },
    ]);
  });

  it("builds one exclusion relation clause for excluded slugs", () => {
    expect(
      buildRelationClauses("tags", undefined, ["harem", "tragedy"]),
    ).toEqual([
      { tags: { none: { tag: { slug: { in: ["harem", "tragedy"] } } } } },
    ]);
  });

  it("combines includes and exclusions and ignores empty arrays", () => {
    expect(buildRelationClauses("tags", ["slow-burn"], ["harem"])).toEqual([
      { tags: { some: { tag: { slug: "slow-burn" } } } },
      { tags: { none: { tag: { slug: { in: ["harem"] } } } } },
    ]);
    expect(buildRelationClauses("genres", [], [])).toEqual([]);
  });
});
