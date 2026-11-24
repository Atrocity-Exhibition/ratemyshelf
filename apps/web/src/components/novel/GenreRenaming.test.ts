import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Genre terminology", () => {
  it("NovelTagList uses 'Genres & Tags' and displays genres", () => {
    const file = readFileSync(resolve(__dirname, "NovelTagList.tsx"), "utf-8");
    expect(file).toContain("Genres & Tags");
    expect(file).not.toContain("Tags & Themes");
    expect(file).toContain("novel.genres");
  });

  it("TagVotePanel displays 'Genre' for THEME category option", () => {
    const file = readFileSync(resolve(__dirname, "TagVotePanel.tsx"), "utf-8");
    expect(file).toContain("Genre");
  });
});
