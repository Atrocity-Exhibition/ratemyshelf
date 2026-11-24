import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("HomeHero", () => {
  it("does not contain 'Read with intention' and uses 'Create account'", () => {
    const file = readFileSync(resolve(__dirname, "HomeHero.tsx"), "utf-8");
    expect(file).not.toContain("Read with intention");
    expect(file).toContain("Create account");
    expect(file).not.toContain("Create a free account");
  });
});
