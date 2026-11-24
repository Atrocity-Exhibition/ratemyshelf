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

  it("TagVotePanel displays only Genre and Tag category options", () => {
    const file = readFileSync(resolve(__dirname, "TagVotePanel.tsx"), "utf-8");
    expect(file).toContain("Genre");
    expect(file).toContain("Tag");
    expect(file).not.toContain("CONTENT_WARNING");
    expect(file).not.toContain("SETTING");
    expect(file).not.toContain("FORMAT");
  });
});
