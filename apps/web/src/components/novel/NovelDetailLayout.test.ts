import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Novel detail layout", () => {
  it("renders aliases directly in NovelHeader", () => {
    const file = readFileSync(resolve(__dirname, "NovelHeader.tsx"), "utf-8");
    expect(file).toContain("aliases");
  });

  it("ExternalLinksPanel uses Official Links heading", () => {
    const file = readFileSync(
      resolve(__dirname, "ExternalLinksPanel.tsx"),
      "utf-8",
    );
    expect(file).toContain("Official Links");
  });

  it("TagVotePanel does not use hardcoded slate-900 background", () => {
    const file = readFileSync(resolve(__dirname, "TagVotePanel.tsx"), "utf-8");
    expect(file).not.toContain("bg-slate-900");
  });
});
