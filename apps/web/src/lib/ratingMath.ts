export type RatingForAggregation = {
  scoreOverall: number;
  scoreStory: number | null;
  scoreCharacters: number | null;
  scoreWorldBuilding: number | null;
  abuseScore: number;
};

export function calculateRatingAggregates(reviews: RatingForAggregation[]) {
  const weightOf = (review: RatingForAggregation) =>
    Math.max(0, 1 - review.abuseScore);
  const totalWeight = reviews.reduce(
    (sum, review) => sum + weightOf(review),
    0,
  );
  const weighted = (pick: (review: RatingForAggregation) => number | null) => {
    const usable = reviews.filter((review) => pick(review) !== null);
    const weight = usable.reduce((sum, review) => sum + weightOf(review), 0);
    if (weight === 0) return null;
    return (
      usable.reduce(
        (sum, review) => sum + weightOf(review) * (pick(review) as number),
        0,
      ) / weight
    );
  };
  const avgOverall = weighted((review) => review.scoreOverall) ?? 0;

  return {
    bayesianScore:
      reviews.length === 1
        ? avgOverall
        : (500 +
            reviews.reduce(
              (sum, review) => sum + weightOf(review) * review.scoreOverall,
              0,
            )) /
          (10 + totalWeight),
    avgStory: weighted((review) => review.scoreStory),
    avgCharacters: weighted((review) => review.scoreCharacters),
    avgWorldBuilding: weighted((review) => review.scoreWorldBuilding),
    avgOverall,
  };
}
