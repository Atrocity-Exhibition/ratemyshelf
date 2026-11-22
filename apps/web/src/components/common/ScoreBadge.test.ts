import { describe, expect, it } from "vitest";
import { getScoreColor } from "./ScoreBadge";

describe("score scale handling", () => {
  it("treats an overall score of 10 as 10/100, not 10/10", () => {
    expect(getScoreColor(10, 100).solidBg).toBe("bg-rose-600 dark:bg-rose-500");
    expect(getScoreColor(10, 10).solidBg).toBe(
      "bg-emerald-600 dark:bg-emerald-500",
    );
  });
});
