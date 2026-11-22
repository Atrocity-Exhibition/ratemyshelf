import { describe, expect, it } from "vitest";
import { shouldShowReviewForm } from "./reviewFormState";

describe("review form visibility", () => {
  it("hides the new-rating form after an authenticated user has a review", () => {
    expect(shouldShowReviewForm("authenticated", true)).toBe(false);
  });

  it("shows the new-rating form only for authenticated users without a review", () => {
    expect(shouldShowReviewForm("authenticated", false)).toBe(true);
    expect(shouldShowReviewForm("unauthenticated", false)).toBe(false);
  });
});
