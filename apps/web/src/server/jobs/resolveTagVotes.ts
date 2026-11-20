import { prisma, getQueue } from "@trackwn/db";

const APPROVE_THRESHOLD = 5;
const REMOVE_THRESHOLD = -5;

export async function resolveTagVotes(): Promise<void> {
  const groups = await prisma.tagVote.groupBy({
    by: ["tagId", "novelId"],
    _sum: { vote: true },
  });

  for (const group of groups) {
    const net = group._sum.vote ?? 0;

    if (net >= APPROVE_THRESHOLD) {
      await prisma.tag.update({
        where: { id: group.tagId },
        data: { isApproved: true },
      });
      await prisma.novelTag.upsert({
        where: {
          novelId_tagId: { novelId: group.novelId, tagId: group.tagId },
        },
        update: {},
        create: { novelId: group.novelId, tagId: group.tagId },
      });
    } else if (net <= REMOVE_THRESHOLD) {
      await prisma.novelTag.deleteMany({
        where: { novelId: group.novelId, tagId: group.tagId },
      });
    }
  }
}

export async function registerTagVoteWorker(): Promise<void> {
  const boss = await getQueue();
  await boss.createQueue("resolve-tag-votes");
  await boss.work("resolve-tag-votes", async () => {
    await resolveTagVotes();
  });
  await boss.schedule("resolve-tag-votes", "0 * * * *");
}
