import { describe, expect, it } from "vitest";
import { NOVEL_CARD_SHELF_CLASS, NOVEL_CARD_TAGS_CLASS } from "./NovelCard";

describe("NovelCard mobile footer layout", () => {
  it("keeps tags in a single touch-scrollable row", () => {
    expect(NOVEL_CARD_TAGS_CLASS).toContain("overflow-x-auto");
    expect(NOVEL_CARD_TAGS_CLASS).toContain("whitespace-nowrap");
  });

  it("places the shelf control below the tags", () => {
    expect(NOVEL_CARD_SHELF_CLASS).toContain("justify-end");
    expect(NOVEL_CARD_SHELF_CLASS).toContain("sm:justify-between");
  });
});
