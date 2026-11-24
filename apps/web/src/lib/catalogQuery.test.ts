import { describe, expect, it } from "vitest";
import { buildCatalogQuery, parseCatalogQuery } from "./catalogQuery";

describe("catalog query state", () => {
  it("parses normalized comma-separated genre and tag filters", () => {
    expect(
      parseCatalogQuery({
        genres: " fantasy, ,romance,fantasy ",
        excludeGenres: "horror",
        tags: "slow-burn,slow-burn",
        excludeTags: "harem, tragedy",
      }),
    ).toMatchObject({
      genres: ["fantasy", "romance"],
      excludeGenres: ["horror"],
      tags: ["slow-burn"],
      excludeTags: ["harem", "tragedy"],
    });
  });

  it("preserves all active filters in pagination query state", () => {
    const query = buildCatalogQuery({
      q: "moon",
      status: "ONGOING",
      country: "KR",
      sort: "score",
      genres: ["fantasy"],
      excludeGenres: ["horror"],
      tags: ["slow-burn"],
      excludeTags: ["harem"],
      page: 3,
    });

    expect(query.toString()).toBe(
      "q=moon&status=ONGOING&country=KR&sort=score&genres=fantasy&excludeGenres=horror&tags=slow-burn&excludeTags=harem&page=3",
    );
  });

  it("can remove the search query while preserving filters", () => {
    const query = buildCatalogQuery(
      {
        q: "moon",
        genres: ["fantasy"],
        excludeTags: ["harem"],
      },
      { omitQuery: true },
    );

    expect(query.toString()).toBe("genres=fantasy&excludeTags=harem");
  });

  it("round-trips rated-only and defaults malformed values to false", () => {
    expect(parseCatalogQuery({ rated: "1" }).ratedOnly).toBe(true);
    expect(parseCatalogQuery({ rated: "true" }).ratedOnly).toBe(false);
    expect(buildCatalogQuery({ ratedOnly: true }).toString()).toBe("rated=1");
  });
});
