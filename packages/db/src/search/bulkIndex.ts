import { prisma } from "../client";
import {
  configureNovelIndex,
  getSearchClient,
  NOVELS_INDEX,
  toSearchDocument,
} from "../search";

async function main() {
  await configureNovelIndex();
  const client = getSearchClient();
  const index = client.index(NOVELS_INDEX);
  const pageSize = 100;
  let cursor: string | undefined;
  let total = 0;

  for (;;) {
    const novels = await prisma.novel.findMany({
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      include: {
        aliases: true,
        tags: { include: { tag: true } },
        genres: true,
        scoreCache: true,
      },
    });

    if (novels.length === 0) break;

    const documents = novels.map((novel) => toSearchDocument(novel, novel.scoreCache));
    await index.addDocuments(documents);
    total += documents.length;
    cursor = novels[novels.length - 1]?.id;
    console.log(`Indexed ${total} novels`);
  }

  console.log(`Bulk index complete: ${total} novels`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
