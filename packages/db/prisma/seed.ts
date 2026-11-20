import { PrismaClient, TagCategory, NovelStatus, Country } from "@prisma/client";

const prisma = new PrismaClient();

type SeedNovel = {
  slug: string;
  title: string;
  originalTitle?: string;
  synopsis: string;
  status: NovelStatus;
  countryOfOrigin: Country;
  chapterCount: number;
  tags: string[];
  genres: string[];
  aliases: string[];
  coverImageUrl?: string;
};

const TAGS: { name: string; slug: string; category: TagCategory }[] = [
  { name: "Cultivation", slug: "cultivation", category: TagCategory.GENRE },
  { name: "LitRPG", slug: "litrpg", category: TagCategory.GENRE },
  { name: "Romance", slug: "romance", category: TagCategory.GENRE },
  { name: "Isekai", slug: "isekai", category: TagCategory.THEME },
  { name: "Weak to Strong", slug: "weak-to-strong", category: TagCategory.THEME },
  { name: "Male Protagonist", slug: "male-protagonist", category: TagCategory.SETTING },
  { name: "Female Protagonist", slug: "female-protagonist", category: TagCategory.SETTING },
  { name: "Gore", slug: "gore", category: TagCategory.CONTENT_WARNING },
  { name: "Slow Burn", slug: "slow-burn", category: TagCategory.FORMAT },
];

const NOVELS: SeedNovel[] = [
  {
    slug: "solo-leveling",
    title: "Solo Leveling",
    originalTitle: "나 혼자만 레벨업",
    synopsis:
      "In a world where hunters battle monsters, the weakest hunter Sung Jin-Woo gains a system that lets him level up without limit.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 270,
    tags: ["litrpg", "weak-to-strong", "male-protagonist"],
    genres: ["Action", "Fantasy"],
    aliases: ["Only I Level Up", "Na Honjaman Level Up"],
  },
  {
    slug: "lord-of-the-mysteries",
    title: "Lord of the Mysteries",
    originalTitle: "诡秘之主",
    synopsis:
      "Zhou Mingrui wakes in a Victorian-era world of steam and mystery, where he must climb the sequence of Beyonder pathways.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 1432,
    tags: ["male-protagonist", "weak-to-strong"],
    genres: ["Mystery", "Fantasy"],
    aliases: ["LotM", "Guimi Zhi Zhu"],
  },
  {
    slug: "reverend-insanity",
    title: "Reverend Insanity",
    originalTitle: "蛊真人",
    synopsis:
      "Fang Yuan, a demonic cultivator, is reborn with the Gu refinement system and pursues eternal life without moral restraint.",
    status: NovelStatus.HIATUS,
    countryOfOrigin: Country.CN,
    chapterCount: 2334,
    tags: ["cultivation", "male-protagonist", "gore"],
    genres: ["Xianxia", "Dark Fantasy"],
    aliases: ["Gu Zhen Ren"],
  },
  {
    slug: "omniscient-readers-viewpoint",
    title: "Omniscient Reader's Viewpoint",
    originalTitle: "전지적 독자 시점",
    synopsis:
      "Kim Dokja is the only reader of a web novel that suddenly becomes reality, and he must use his knowledge to survive.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 551,
    tags: ["male-protagonist", "weak-to-strong"],
    genres: ["Action", "Fantasy"],
    aliases: ["ORV", "Jeonjidokja Sijeom"],
  },
  {
    slug: "the-beginning-after-the-end",
    title: "The Beginning After the End",
    synopsis:
      "King Grey is reincarnated into a world of magic and must grow stronger while uncovering the secrets of his new life.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 480,
    tags: ["isekai", "male-protagonist"],
    genres: ["Fantasy", "Adventure"],
    aliases: ["TBATE"],
  },
  {
    slug: "mother-of-learning",
    title: "Mother of Learning",
    synopsis:
      "Zorian Kazinski is stuck in a month-long time loop and must master magic to survive and break free.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.EN,
    chapterCount: 108,
    tags: ["male-protagonist", "weak-to-strong"],
    genres: ["Fantasy", "Mystery"],
    aliases: ["MoL"],
  },
  {
    slug: "shadow-slave",
    title: "Shadow Slave",
    synopsis:
      "Sunny is dragged into the Nightmare Spell and must survive deadly dream realms to become an Awakened.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 1900,
    tags: ["weak-to-strong", "male-protagonist"],
    genres: ["Dark Fantasy", "Action"],
    aliases: [],
  },
  {
    slug: "beware-of-chicken",
    title: "Beware of Chicken",
    synopsis:
      "A transmigrator rejects cultivation politics and settles down to farm, but the world refuses to leave him alone.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 400,
    tags: ["cultivation", "isekai"],
    genres: ["Comedy", "Slice of Life"],
    aliases: ["BoC"],
  },
  {
    slug: "the-perfect-run",
    title: "The Perfect Run",
    synopsis:
      "A man who can loop time must decide how to use his power in a city of superpowered factions.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.EN,
    chapterCount: 120,
    tags: ["male-protagonist"],
    genres: ["Sci-Fi", "Action"],
    aliases: [],
  },
  {
    slug: "trash-of-the-counts-family",
    title: "Trash of the Count's Family",
    originalTitle: "백작가의 망나니가 되었다",
    synopsis:
      "Kim Rok Soo wakes as Cale Henituse, the trash of a noble family, and plans a quiet life that never stays quiet.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.KR,
    chapterCount: 800,
    tags: ["isekai", "male-protagonist"],
    genres: ["Fantasy", "Adventure"],
    aliases: ["TCF", "Trash of the Count Family"],
  },
  {
    slug: "the-second-coming-of-avarice",
    title: "The Second Coming of Avarice",
    originalTitle: "탐욕의 재림",
    synopsis:
      "A man returns to the past with knowledge of the future and pursues wealth and power in a world of guilds and dungeons.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.KR,
    chapterCount: 300,
    tags: ["male-protagonist", "weak-to-strong"],
    genres: ["Fantasy", "Action"],
    aliases: ["TSCOA"],
  },
  {
    slug: "the-novels-extra",
    title: "The Novel's Extra",
    originalTitle: "소설 속 엑스트라",
    synopsis:
      "The author of a novel is pulled into his own unfinished story and must survive as a minor character.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 300,
    tags: ["isekai", "male-protagonist"],
    genres: ["Fantasy", "Romance"],
    aliases: ["TNE"],
  },
];

async function main() {
  console.log("Seeding tags...");
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, category: tag.category, isApproved: true },
      create: { ...tag, isApproved: true },
    });
  }

  const tagRows = await prisma.tag.findMany();
  const tagBySlug = new Map(tagRows.map((tag) => [tag.slug, tag]));

  console.log("Seeding novels...");
  for (const novel of NOVELS) {
    const row = await prisma.novel.upsert({
      where: { slug: novel.slug },
      update: {
        title: novel.title,
        originalTitle: novel.originalTitle,
        synopsis: novel.synopsis,
        status: novel.status,
        countryOfOrigin: novel.countryOfOrigin,
        chapterCount: novel.chapterCount,
        coverImageUrl: novel.coverImageUrl,
      },
      create: {
        slug: novel.slug,
        title: novel.title,
        originalTitle: novel.originalTitle,
        synopsis: novel.synopsis,
        status: novel.status,
        countryOfOrigin: novel.countryOfOrigin,
        chapterCount: novel.chapterCount,
        coverImageUrl: novel.coverImageUrl,
      },
    });

    for (const alias of novel.aliases) {
      const existing = await prisma.novelAlias.findFirst({
        where: { novelId: row.id, alias },
      });
      if (!existing) {
        await prisma.novelAlias.create({ data: { novelId: row.id, alias } });
      }
    }

    for (const genreName of novel.genres) {
      const slug = genreName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.genreLink.upsert({
        where: { novelId_slug: { novelId: row.id, slug } },
        update: { name: genreName },
        create: { novelId: row.id, name: genreName, slug },
      });
    }

    for (const tagSlug of novel.tags) {
      const tag = tagBySlug.get(tagSlug);
      if (!tag) continue;
      await prisma.novelTag.upsert({
        where: { novelId_tagId: { novelId: row.id, tagId: tag.id } },
        update: {},
        create: { novelId: row.id, tagId: tag.id },
      });
    }
  }

  console.log(`Seed complete: ${NOVELS.length} novels, ${TAGS.length} tags`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
