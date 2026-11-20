import { prisma, getQueue } from "@trackwn/db";

const NEW_ACCOUNT_DAYS = 7;
const OUTLIER_DELTA = 3;
const VELOCITY_WINDOW_HOURS = 24;
const VELOCITY_THRESHOLD = 3;
const FLAG_THRESHOLD = 0.7;

export async function sweepAbuseScores(): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { status: { in: ["VISIBLE", "FLAGGED"] } },
    select: {
      id: true,
      userId: true,
      novelId: true,
      scoreOverall: true,
      createdAt: true,
      user: { select: { accountCreatedAt: true } },
      novel: { select: { scoreCache: { select: { avgOverall: true } } } },
    },
  });

  const affectedNovels = new Set<string>();
  const now = Date.now();

  for (const review of reviews) {
    let score = 0;

    const accountAgeDays =
      (now - review.user.accountCreatedAt.getTime()) / 86_400_000;
    if (accountAgeDays < NEW_ACCOUNT_DAYS) score += 0.4;

    const novelMean = review.novel.scoreCache?.avgOverall;
    if (novelMean !== undefined && Math.abs(review.scoreOverall - novelMean) > OUTLIER_DELTA) {
      score += 0.3;
    }

    const recentCount = await prisma.review.count({
      where: {
        userId: review.userId,
        createdAt: {
          gte: new Date(now - VELOCITY_WINDOW_HOURS * 60 * 60 * 1000),
        },
      },
    });
    if (recentCount > VELOCITY_THRESHOLD) score += 0.3;

    const abuseScore = Math.min(1, Math.max(0, score));
    const flagged = abuseScore >= FLAG_THRESHOLD;

    await prisma.review.update({
      where: { id: review.id },
      data: {
        abuseScore,
        ...(flagged ? { status: "FLAGGED" as const } : {}),
      },
    });

    if (flagged) affectedNovels.add(review.novelId);
  }

  const boss = await getQueue();
  for (const novelId of affectedNovels) {
    await boss.send("recalculate-novel-score", { novelId });
  }
}

export async function registerAbuseWorker(): Promise<void> {
  const boss = await getQueue();
  await boss.createQueue("sweep-abuse-scores");
  await boss.work("sweep-abuse-scores", async () => {
    await sweepAbuseScores();
  });
  await boss.schedule("sweep-abuse-scores", "0 */6 * * *");
}
