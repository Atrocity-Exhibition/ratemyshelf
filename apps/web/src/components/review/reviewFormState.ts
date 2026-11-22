export function shouldShowReviewForm(
  status: string,
  hasReview: boolean,
): boolean {
  return status === "authenticated" && !hasReview;
}
