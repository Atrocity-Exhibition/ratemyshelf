import {
  prisma,
  getQueue,
  getSearchClient,
  NOVELS_INDEX,
  toSearchDocument,
} from "@ratemyshelf/db";

export async function syncSearchIndex(novelId: string): Promise<void> {
  const index = getSearchClient().index(NOVELS_INDEX);
  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    include: {
      aliases: true,
      tags: { include: { tag: true } },
      genres: true,
      scoreCache: true,
    },
  });

  if (!novel || novel.isHidden) {
    await index.deleteDocument(novelId).catch(() => undefined);
    return;
  }

  await index.addDocuments([toSearchDocument(novel, novel.scoreCache)]);
}

export async function registerSearchWorker(): Promise<void> {
  const boss = await getQueue();
  await boss.createQueue("sync-search-index");
  await boss.work<{ novelId: string }>(
    "sync-search-index",
    async (jobs) => {
      for (const job of jobs) {
        await syncSearchIndex(job.data.novelId);
      }
    },
  );
}
