import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  deleteMany: vi.fn(),
  cacheDel: vi.fn(),
  cacheSet: vi.fn(),
}));

vi.mock("@ratemyshelf/db", () => ({
  prisma: {
    review: { findMany: dbMocks.findMany },
    novelScoreCache: { deleteMany: dbMocks.deleteMany },
  },
  cacheDel: dbMocks.cacheDel,
  cacheSet: dbMocks.cacheSet,
  getQueue: vi.fn(),
}));

import { recalculateNovelScore, recalculateThenSync } from "./recalculateScore";

describe("score recalculation queue flow", () => {
  it("schedules search sync only after cache recalculation completes", async () => {
    const events: string[] = [];

    await recalculateThenSync(
      "novel-1",
      async () => {
        events.push("cache-updated");
      },
      async () => {
        events.push("search-scheduled");
      },
    );

    expect(events).toEqual(["cache-updated", "search-scheduled"]);
  });

  it("schedules search sync after an empty visible-review recalculation", async () => {
    const events: string[] = [];
    dbMocks.findMany.mockResolvedValueOnce([]);

    await recalculateThenSync(
      "novel-empty",
      recalculateNovelScore,
      async () => {
        events.push("search-scheduled");
      },
    );

    expect(dbMocks.deleteMany).toHaveBeenCalledWith({
      where: { novelId: "novel-empty" },
    });
    expect(events).toEqual(["search-scheduled"]);
  });
});
