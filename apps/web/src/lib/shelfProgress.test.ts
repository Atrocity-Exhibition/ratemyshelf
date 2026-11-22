import { describe, expect, it } from "vitest";
import { ReadStatus } from "@prisma/client";
import { lastChapterForStatus } from "./shelfProgress";

describe("shelf progress", () => {
  it("sets the last chapter to the novel total when marked completed", () => {
    expect(lastChapterForStatus(ReadStatus.COMPLETED, 420)).toBe(420);
  });

  it("does not change progress for other shelf statuses", () => {
    expect(lastChapterForStatus(ReadStatus.READING, 420)).toBeUndefined();
  });
});
