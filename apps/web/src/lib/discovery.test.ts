import { describe, expect, it } from "vitest";
import { genreHref, sortDiscoveryItems, tagHref } from "./discovery";

describe("catalog discovery", () => {
  it("sorts genres and tags alphabetically without mutating the input", () => {
    const items = [
      { name: "Xianxia" },
      { name: "action" },
      { name: "Fantasy" },
    ];

    expect(sortDiscoveryItems(items).map((item) => item.name)).toEqual([
      "action",
      "Fantasy",
      "Xianxia",
    ]);
    expect(items.map((item) => item.name)).toEqual([
      "Xianxia",
      "action",
      "Fantasy",
    ]);
  });

  it("builds catalog filter links for genres and tags", () => {
    expect(genreHref("urban fantasy")).toBe("/novels?genres=urban%20fantasy");
    expect(tagHref("slow-burn")).toBe("/novels?tags=slow-burn");
  });
});
