import { prisma, cacheDel, cacheSet, getQueue } from "@ratemyshelf/db";
import { calculateRatingAggregates } from "@/lib/ratingMath";

export async function recalculateNovelScore(novelId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { novelId, status: "VISIBLE" },
    select: {
      scoreStory: true,
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

  const data = {
    ...calculateRatingAggregates(reviews),
    avgTranslation: null,
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

export async function recalculateThenSync(
  novelId: string,
  recalculate: (novelId: string) => Promise<void> = recalculateNovelScore,
  scheduleSearchSync: (novelId: string) => Promise<unknown>,
): Promise<void> {
  await recalculate(novelId);
  await scheduleSearchSync(novelId);
}

export async function registerScoreWorker(): Promise<void> {
  const boss = await getQueue();
  await boss.createQueue("recalculate-novel-score");
  await boss.work<{ novelId: string }>(
    "recalculate-novel-score",
    async (jobs) => {
      for (const job of jobs) {
        await recalculateThenSync(
          job.data.novelId,
          recalculateNovelScore,
          (novelId) => boss.send("sync-search-index", { novelId }),
        );
      }
    },
  );
}
