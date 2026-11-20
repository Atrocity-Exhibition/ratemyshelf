import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates titles", () => {
    expect(slugify("Solo Leveling")).toBe("solo-leveling");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugify("The Novel's Extra!!")).toBe("the-novels-extra");
  });

  it("handles repeated whitespace and underscores", () => {
    expect(slugify("  Lord___of  the   Mysteries ")).toBe("lord-of-the-mysteries");
  });

  it("truncates to 80 characters", () => {
    expect(slugify("a".repeat(120))).toHaveLength(80);
  });
});
