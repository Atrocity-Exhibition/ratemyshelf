import { describe, expect, it } from "vitest";
import { recalculateThenSync } from "./recalculateScore";

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
});
