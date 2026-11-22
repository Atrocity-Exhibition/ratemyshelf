import { describe, expect, it } from "vitest";
import {
  buildRelationClauses,
  normalizeSlugArray,
  parseSlugList,
} from "./catalogFilters";
import { listInput } from "../server/routers/novels";

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

  it("normalizes direct array input", () => {
    expect(normalizeSlugArray([" fantasy ", "fantasy", "romance"])).toEqual([
      "fantasy",
      "romance",
    ]);
  });

  it("rejects malformed direct array input", () => {
    expect(() => normalizeSlugArray(["fantasy", "not a slug"])).toThrow();
  });

  it("rejects more than 20 unique direct values", () => {
    expect(() =>
      normalizeSlugArray(Array.from({ length: 21 }, (_, i) => `tag-${i}`)),
    ).toThrow();
  });

  it("normalizes direct catalog slug arrays", () => {
    expect(
      listInput.parse({
        genreSlugs: [" fantasy ", "fantasy"],
        excludeTagSlugs: [" spoiler "],
      }),
    ).toMatchObject({
      genreSlugs: ["fantasy"],
      excludeTagSlugs: ["spoiler"],
    });
  });

  it("rejects malformed and excessive direct catalog slug arrays", () => {
    expect(listInput.safeParse({ tagSlugs: ["not a slug"] }).success).toBe(
      false,
    );
    expect(
      listInput.safeParse({
        genreSlugs: Array.from({ length: 21 }, (_, i) => `genre-${i}`),
      }).success,
    ).toBe(false);
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
