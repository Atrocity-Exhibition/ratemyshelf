import { describe, expect, it } from "vitest";
import { validateSeedCatalog, type SeedNovelRecord } from "@ratemyshelf/db";
import { Country, NovelStatus } from "@prisma/client";

describe("seed catalog validation", () => {
  const validBaseNovel: SeedNovelRecord = {
    slug: "test-novel",
    title: "Test Novel",
    author: "Author Name",
    synopsis: "A valid synopsis for testing.",
    countryOfOrigin: Country.KR,
    status: NovelStatus.ONGOING,
    tags: ["isekai", "cultivation"],
    genres: ["Fantasy"],
    aliases: ["Test Alias"],
    sourceUrl: "https://example.com/novel",
  };

  it("passes when all novel tags exist in allowed tag set", () => {
    const allowedTagSlugs = new Set(["isekai", "cultivation", "system"]);
    expect(() =>
      validateSeedCatalog([validBaseNovel], allowedTagSlugs),
    ).not.toThrow();
  });

  it("throws error when a novel references an unknown tag slug", () => {
    const allowedTagSlugs = new Set(["isekai"]);
    expect(() =>
      validateSeedCatalog([validBaseNovel], allowedTagSlugs),
    ).toThrow(/unknown tag slug: "cultivation"/i);
  });

  it("throws error on duplicate titles or aliases", () => {
    const allowedTagSlugs = new Set(["isekai", "cultivation"]);
    const duplicateNovel: SeedNovelRecord = {
      ...validBaseNovel,
      slug: "test-novel-2",
      title: "Test Novel", // duplicate normalized title
    };
    expect(() =>
      validateSeedCatalog([validBaseNovel, duplicateNovel], allowedTagSlugs),
    ).toThrow(/duplicate novel title/i);
  });
});
