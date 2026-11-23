import { describe, expect, it } from "vitest";
import { getScoreColor } from "./ScoreBadge";

describe("score scale handling", () => {
  it("treats an overall score of 10 as 10/100, not 10/10", () => {
    expect(getScoreColor(10, 100).solidBg).toBe("bg-[#db3604]");
    expect(getScoreColor(10, 10).solidBg).toBe("bg-[#0eb23a]");
  });

  it("uses the red, orange, and green hollow-circle palette", () => {
    expect(getScoreColor(30, 100)).toMatchObject({
      text: "text-[#db3604]",
      border: "border-[#db3604]",
    });
    expect(getScoreColor(60, 100)).toMatchObject({
      text: "text-[#d66d11]",
      border: "border-[#d66d11]",
    });
    expect(getScoreColor(80, 100)).toMatchObject({
      text: "text-[#0eb23a]",
      border: "border-[#0eb23a]",
    });
  });
});
