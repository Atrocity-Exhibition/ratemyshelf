import { prisma, cacheDel, cacheSet, getQueue } from "@trackwn/db";

const PRIOR_COUNT = 10;
const PRIOR_MEAN = 5.0;

export async function recalculateNovelScore(novelId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { novelId, status: "VISIBLE" },
    select: {
      scoreStory: true,
      scoreTranslation: true,
      scoreCharacters: true,
      scoreWorldBuilding: true,
      scoreOverall: true,
      abuseScore: true,
    },
  });

  if (reviews.length === 0) {
    await prisma.novelScoreCache.deleteMany({ where: { novelId } });
    await cacheDel(`novel:${novelId}:score`, `novel:${novelId}:meta`);
    return;
  }

  const weightOf = (review: (typeof reviews)[number]) =>
    Math.max(0, 1 - review.abuseScore);

  const totalWeight = reviews.reduce((sum, review) => sum + weightOf(review), 0);
  const weighted = (pick: (review: (typeof reviews)[number]) => number | null) => {
    const usable = reviews.filter((review) => pick(review) !== null);
    const weight = usable.reduce((sum, review) => sum + weightOf(review), 0);
    if (weight === 0) return null;
    return (
      usable.reduce((sum, review) => sum + weightOf(review) * (pick(review) as number), 0) /
      weight
    );
  };

  const bayesianScore =
    (PRIOR_COUNT * PRIOR_MEAN +
      reviews.reduce(
        (sum, review) => sum + weightOf(review) * review.scoreOverall,
        0,
      )) /
    (PRIOR_COUNT + totalWeight);

  const data = {
    bayesianScore,
    avgStory: weighted((review) => review.scoreStory) ?? 0,
    avgTranslation: weighted((review) => review.scoreTranslation),
    avgCharacters: weighted((review) => review.scoreCharacters) ?? 0,
    avgWorldBuilding: weighted((review) => review.scoreWorldBuilding) ?? 0,
    avgOverall: weighted((review) => review.scoreOverall) ?? 0,
    reviewCount: reviews.length,
  };

  await prisma.novelScoreCache.upsert({
    where: { novelId },
    update: data,
    create: { novelId, ...data },
  });

  await cacheSet(`novel:${novelId}:score`, data, 5 * 60);
  await cacheDel(`novel:${novelId}:meta`);
}

export async function registerScoreWorker(): Promise<void> {
  const boss = await getQueue();
  await boss.createQueue("recalculate-novel-score");
  await boss.work<{ novelId: string }>(
    "recalculate-novel-score",
    async (jobs) => {
      for (const job of jobs) {
        await recalculateNovelScore(job.data.novelId);
      }
    },
  );
}
