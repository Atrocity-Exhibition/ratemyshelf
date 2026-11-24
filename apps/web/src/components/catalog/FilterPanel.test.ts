import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("FilterPanel mobile responsiveness", () => {
  it("includes mobile collapse toggle and desktop block persistence", () => {
    const file = readFileSync(resolve(__dirname, "FilterPanel.tsx"), "utf-8");
    expect(file).toContain("lg:hidden");
    expect(file).toContain("lg:block");
  });
});
