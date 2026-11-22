import {
  PrismaClient,
  TagCategory,
  NovelStatus,
  Country,
} from "@prisma/client";
import { CATALOG_CANDIDATES } from "./catalogCandidates";

const prisma = new PrismaClient();

type SeedNovel = {
  slug: string;
  title: string;
  author?: string;
  originalTitle?: string;
  synopsis: string;
  status?: NovelStatus;
  countryOfOrigin: Country;
  chapterCount?: number;
  tags: string[];
  genres: string[];
  aliases: string[];
  coverImageUrl?: string;
  source?: string;
  sourceUrl?: string;
};

const TAGS: { name: string; slug: string; category: TagCategory }[] = [
  // Genre / Themes
  { name: "Cultivation", slug: "cultivation", category: TagCategory.GENRE },
  { name: "LitRPG", slug: "litrpg", category: TagCategory.GENRE },
  { name: "Romance", slug: "romance", category: TagCategory.GENRE },
  { name: "Isekai", slug: "isekai", category: TagCategory.THEME },
  {
    name: "Weak to Strong",
    slug: "weak-to-strong",
    category: TagCategory.THEME,
  },
  { name: "Regression", slug: "regression", category: TagCategory.THEME },
  { name: "Reincarnation", slug: "reincarnation", category: TagCategory.THEME },
  { name: "Time Loop", slug: "time-loop", category: TagCategory.THEME },
  {
    name: "Kingdom Building",
    slug: "kingdom-building",
    category: TagCategory.THEME,
  },
  { name: "Antihero", slug: "antihero", category: TagCategory.THEME },
  { name: "Dungeon", slug: "dungeon", category: TagCategory.SETTING },
  {
    name: "Magic Academy",
    slug: "magic-academy",
    category: TagCategory.SETTING,
  },
  {
    name: "Post-Apocalyptic",
    slug: "post-apocalyptic",
    category: TagCategory.SETTING,
  },
  {
    name: "Male Protagonist",
    slug: "male-protagonist",
    category: TagCategory.SETTING,
  },
  {
    name: "Female Protagonist",
    slug: "female-protagonist",
    category: TagCategory.SETTING,
  },
  { name: "Gore", slug: "gore", category: TagCategory.CONTENT_WARNING },
  {
    name: "Psychological",
    slug: "psychological",
    category: TagCategory.CONTENT_WARNING,
  },
  { name: "Slow Burn", slug: "slow-burn", category: TagCategory.FORMAT },
  { name: "Multiple POV", slug: "multiple-pov", category: TagCategory.FORMAT },
];

const NOVELS: SeedNovel[] = [
  // --- KOREAN (KR) ---
  {
    slug: "solo-leveling",
    title: "Solo Leveling",
    originalTitle: "나 혼자만 레벨업",
    synopsis:
      "In a world where hunters battle monsters, the weakest hunter Sung Jin-Woo gains a system that lets him level up without limit.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 270,
    tags: ["litrpg", "weak-to-strong", "male-protagonist", "dungeon"],
    genres: ["Action", "Fantasy"],
    aliases: ["Only I Level Up", "Na Honjaman Level Up"],
  },
  {
    slug: "omniscient-readers-viewpoint",
    title: "Omniscient Reader's Viewpoint",
    originalTitle: "전지적 독자 시점",
    synopsis:
      "Kim Dokja is the only reader of an obscure web novel that suddenly manifests into gruesome reality. Armed with knowledge of the end, he sets out to change the plot.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 551,
    tags: [
      "male-protagonist",
      "post-apocalyptic",
      "psychological",
      "weak-to-strong",
    ],
    genres: ["Action", "Fantasy", "Mystery"],
    aliases: ["ORV", "Jeonjidokja Sijeom"],
  },
  {
    slug: "the-novels-extra",
    title: "The Novel's Extra",
    originalTitle: "소설 속 엑스트라",
    synopsis:
      "The author of a modern-fantasy novel is pulled into his own unfinished story as an insignificant extra cadet with a gun in a world of swords and magic.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 379,
    tags: ["isekai", "magic-academy", "male-protagonist", "weak-to-strong"],
    genres: ["Action", "Fantasy", "School Life"],
    aliases: ["TNE", "A Novel's Extra"],
  },
  {
    slug: "trash-of-the-counts-family",
    title: "Trash of the Count's Family",
    originalTitle: "백작가의 망나니가 되었다",
    synopsis:
      "Kim Rok Soo wakes as Cale Henituse, the notorious drunken trash of a wealthy noble household, right before the birth of a hero threatens his peaceful slacker life.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.KR,
    chapterCount: 920,
    tags: ["isekai", "male-protagonist", "kingdom-building"],
    genres: ["Fantasy", "Adventure", "Comedy"],
    aliases: ["TCF", "Lout of Count's Family"],
  },
  {
    slug: "the-second-coming-of-gluttony",
    title: "The Second Coming of Gluttony",
    originalTitle: "탐식의 재림",
    synopsis:
      "A broken gambler is granted a second chance in the parallel world of Paradise, where his feelings of regret and hunger for redemption drive him to the pinnacle.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 549,
    tags: ["regression", "weak-to-strong", "male-protagonist", "gore"],
    genres: ["Action", "Dark Fantasy", "Supernatural"],
    aliases: ["SCOG", "Tamsikui Jaerim"],
  },
  {
    slug: "overgeared",
    title: "Overgeared",
    originalTitle: "템빨",
    synopsis:
      "Shin Youngwoo, known in the VR game Satisfy as Grid, stumbles upon the Legendary Blacksmith's legacy and turns overwhelming equipment advantages into glory.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 2060,
    tags: ["litrpg", "weak-to-strong", "male-protagonist", "kingdom-building"],
    genres: ["Action", "Comedy", "Sci-Fi"],
    aliases: ["Temppal"],
  },
  {
    slug: "return-of-the-mount-hua-sect",
    title: "Return of the Mount Hua Sect",
    originalTitle: "화산귀환",
    synopsis:
      "Chung Myung, the Plum Blossom Sword Saint who slew the Heavenly Demon, awakens a hundred years later as a child to discover his proud sect reduced to ruin.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.KR,
    chapterCount: 1750,
    tags: ["reincarnation", "male-protagonist", "cultivation"],
    genres: ["Wuxia", "Action", "Comedy"],
    aliases: ["Return of the Blossoming Blade", "Hwasangwihwan"],
  },
  {
    slug: "the-s-classes-that-i-raised",
    title: "The S-Classes That I Raised",
    originalTitle: "내가 키운 S급들",
    synopsis:
      "Han Yoojin regresses after watching his prodigy younger brother die to protect him, gaining caretaker skills tailored for nurturing S-rank awakeners.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 870,
    tags: ["regression", "male-protagonist", "dungeon"],
    genres: ["Action", "Fantasy", "Drama"],
    aliases: ["My S-Class Hunters", "Naega Kiun S-Geupdeul"],
  },
  {
    slug: "second-life-ranker",
    title: "Second Life Ranker",
    originalTitle: "두 번 사는 랭커",
    synopsis:
      "Yeon-woo learns his missing twin brother was betrayed inside the Obelisk of the Sun God. Taking his brother's pocket watch, he climbs the tower for vengeance.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 800,
    tags: ["dungeon", "antihero", "male-protagonist", "weak-to-strong"],
    genres: ["Action", "Fantasy"],
    aliases: ["Ranker Who Lives A Second Time"],
  },
  {
    slug: "worthless-regression",
    title: "Worthless Regression",
    originalTitle: "양아치 회귀",
    synopsis:
      "A talentless mercenary is sent thirteen years into the past. Without a system or special heritage, he relies on stubborn, agonizing effort to change his fate.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 494,
    tags: ["regression", "weak-to-strong", "psychological", "male-protagonist"],
    genres: ["Action", "Dark Fantasy"],
    aliases: ["Possessing Nothing"],
  },
  {
    slug: "reformation-of-the-deadbeat-noble",
    title: "Reformation of the Deadbeat Noble",
    originalTitle: "어느 날 갑자기 망나니가 되었다",
    synopsis:
      "A young noble paralyzed by childhood trauma dreams of a nameless swordsman who swung his blade for decades, inspiring him to pick up a sword.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 405,
    tags: ["weak-to-strong", "male-protagonist", "slow-burn"],
    genres: ["Fantasy", "Drama"],
    aliases: ["The Lazy Prince Becomes a Genius"],
  },
  {
    slug: "villains-are-destined-to-die",
    title: "Villains Are Destined to Die",
    originalTitle: "악역의 엔딩은 죽음뿐",
    synopsis:
      "A university student wakes up inside the hard-mode otome game as the hated villainess Penelope Eckart, where every wrong choice leads to instant death.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.KR,
    chapterCount: 231,
    tags: ["isekai", "female-protagonist", "psychological", "romance"],
    genres: ["Fantasy", "Romance", "Drama"],
    aliases: ["Death Is the Only Ending for the Villainess"],
  },

  // --- CHINESE (CN) ---
  {
    slug: "lord-of-the-mysteries",
    title: "Lord of the Mysteries",
    originalTitle: "诡秘之主",
    synopsis:
      "Zhou Mingrui transmigrates into a Victorian-era steampunk world of potions, tarot clubs, eldritch horrors, and twenty-two Beyonder pathways.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 1432,
    tags: ["male-protagonist", "weak-to-strong", "psychological", "slow-burn"],
    genres: ["Mystery", "Fantasy", "Supernatural"],
    aliases: ["LotM", "Guimi Zhi Zhu"],
  },
  {
    slug: "reverend-insanity",
    title: "Reverend Insanity",
    originalTitle: "蛊真人",
    synopsis:
      "Fang Yuan, an unrepentant demonic cultivator, uses the Spring Autumn Cicada to travel 500 years back into his youth, scheming through a cruel world of Gu cultivation.",
    status: NovelStatus.HIATUS,
    countryOfOrigin: Country.CN,
    chapterCount: 2334,
    tags: ["cultivation", "antihero", "regression", "gore", "male-protagonist"],
    genres: ["Xianxia", "Dark Fantasy"],
    aliases: ["Gu Zhen Ren", "Daoist Gu"],
  },
  {
    slug: "i-shall-seal-the-heavens",
    title: "I Shall Seal the Heavens",
    originalTitle: "我欲封天",
    synopsis:
      "Failed scholar Meng Hao is dragged into the cultivation world of the Reliance Sect, forging his path by weaponizing demonic heritage and sheer debt collection.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 1614,
    tags: ["cultivation", "weak-to-strong", "male-protagonist"],
    genres: ["Xianxia", "Action", "Adventure"],
    aliases: ["ISSTH", "Wo Yu Feng Tian"],
  },
  {
    slug: "renegade-immortal",
    title: "Renegade Immortal",
    originalTitle: "仙逆",
    synopsis:
      "Wang Lin, an ordinary youth deemed untalented by immortal sects, finds a mysterious bead and embarks on a merciless journey of life and death.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 2088,
    tags: ["cultivation", "weak-to-strong", "male-protagonist", "antihero"],
    genres: ["Xianxia", "Action", "Tragedy"],
    aliases: ["Xian Ni"],
  },
  {
    slug: "cultivation-chat-group",
    title: "Cultivation Chat Group",
    originalTitle: "修真聊天群",
    synopsis:
      "Song Shuhang is accidentally invited into a QQ chat group full of chuunibyou roleplayers who claim to be Daoists, only to discover every recipe and spell is real.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 3171,
    tags: ["cultivation", "male-protagonist", "slow-burn"],
    genres: ["Comedy", "Modern", "Supernatural"],
    aliases: ["CCG", "Xiuzhen Liaotian Qun"],
  },
  {
    slug: "the-legendary-mechanic",
    title: "The Legendary Mechanic",
    originalTitle: "超神机械师",
    synopsis:
      "Han Xiao transmigrates into the sci-fi MMO Galaxy as an NPC before the beta test begins, arming himself with advanced mechanical engineering.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 1463,
    tags: ["litrpg", "isekai", "male-protagonist", "kingdom-building"],
    genres: ["Sci-Fi", "Action", "Comedy"],
    aliases: ["TLM", "Chao Shen Ji Xie Shi"],
  },
  {
    slug: "release-that-witch",
    title: "Release That Witch",
    originalTitle: "放开那个女巫",
    synopsis:
      "A modern mechanical engineer awakens as Prince Roland in an early-industrial medieval kingdom where persecuted witches possess industrial-scale magical powers.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 1498,
    tags: ["isekai", "kingdom-building", "male-protagonist"],
    genres: ["Fantasy", "Sci-Fi", "Drama"],
    aliases: ["RTW", "Fangkai Nage Nüwu"],
  },
  {
    slug: "my-house-of-horrors",
    title: "My House of Horrors",
    originalTitle: "我有一座恐怖屋",
    synopsis:
      "Chen Ge inherits his vanished parents' failing haunted house attraction, finding a black phone that unlocks daily supernatural missions inside urban legends.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 1210,
    tags: ["male-protagonist", "psychological", "gore"],
    genres: ["Horror", "Mystery", "Supernatural"],
    aliases: ["MHOH", "Wo You Yi Zuo Kongbu Wu"],
  },
  {
    slug: "a-will-eternal",
    title: "A Will Eternal",
    originalTitle: "一念永恒",
    synopsis:
      "Terrified of death, Bai Xiaochun is driven by a singular obsession: achieving immortality at all costs, resulting in comedic chaos across orthodox sects.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.CN,
    chapterCount: 1314,
    tags: ["cultivation", "male-protagonist", "weak-to-strong"],
    genres: ["Comedy", "Xianxia", "Adventure"],
    aliases: ["AWE", "Yi Nian Yong Heng"],
  },
  {
    slug: "beyond-the-timescape",
    title: "Beyond the Timescape",
    originalTitle: "光阴之外",
    synopsis:
      "A divine face opens its eyes in the sky and covers the continent in mutant-tainted purple fog. Orphan Xu Qing must scavenge and kill simply to survive another day.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.CN,
    chapterCount: 1200,
    tags: ["cultivation", "post-apocalyptic", "antihero", "male-protagonist"],
    genres: ["Xianxia", "Dark Fantasy"],
    aliases: ["Outside of Time", "Guangyin Zhiwai"],
  },

  // --- ENGLISH / WESTERN WEB SERIALS (EN) ---
  {
    slug: "mother-of-learning",
    title: "Mother of Learning",
    synopsis:
      "Zorian Kazinski is a cynical magic academy student trapped in a repeating month-long time loop before an invasion, forcing him to grow from average mage to master.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.EN,
    chapterCount: 108,
    tags: ["time-loop", "magic-academy", "weak-to-strong", "male-protagonist"],
    genres: ["Fantasy", "Mystery"],
    aliases: ["MoL"],
  },
  {
    slug: "shadow-slave",
    title: "Shadow Slave",
    synopsis:
      "Sunny is an impoverished slum orphan infected by the Nightmare Spell. Transported to a ruin-strewn dream world, he must survive godless terrors using deceit and shadow magic.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 2200,
    tags: [
      "litrpg",
      "weak-to-strong",
      "antihero",
      "post-apocalyptic",
      "male-protagonist",
    ],
    genres: ["Dark Fantasy", "Action", "Supernatural"],
    aliases: ["SS"],
  },
  {
    slug: "the-beginning-after-the-end",
    title: "The Beginning After the End",
    synopsis:
      "King Grey reincarnates with his past memories intact into a vibrant continent of magic and mana beasts, hoping for a warm life far away from political loneliness.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 480,
    tags: [
      "reincarnation",
      "magic-academy",
      "male-protagonist",
      "weak-to-strong",
    ],
    genres: ["Fantasy", "Action", "Adventure"],
    aliases: ["TBATE"],
  },
  {
    slug: "beware-of-chicken",
    title: "Beware of Chicken",
    synopsis:
      "A transmigrated soul flees the violent, cutthroat cultivation world to start an honest farm in the mortal territory, inadvertently raising spiritually awakened barnyard animals.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 420,
    tags: ["cultivation", "isekai", "male-protagonist", "slow-burn"],
    genres: ["Comedy", "Slice of Life", "Fantasy"],
    aliases: ["BoC"],
  },
  {
    slug: "the-perfect-run",
    title: "The Perfect Run",
    synopsis:
      "Ryan 'Quicksave' Romano has a power: he can create a save point in time and reload upon death. He arrives in dystopian New Rome determined to achieve the flawless golden ending.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.EN,
    chapterCount: 125,
    tags: ["time-loop", "post-apocalyptic", "male-protagonist"],
    genres: ["Sci-Fi", "Action", "Comedy"],
    aliases: ["TPR"],
  },
  {
    slug: "dungeon-crawler-carl",
    title: "Dungeon Crawler Carl",
    synopsis:
      "Earth is collapsed into an eighteen-floor televised alien dungeon crawl. Carl and his ex-girlfriend's prize Persian cat, Princess Donut, must survive the galaxy's cruelest reality show.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 380,
    tags: ["litrpg", "dungeon", "post-apocalyptic", "male-protagonist"],
    genres: ["Action", "Dark Comedy", "Sci-Fi"],
    aliases: ["DCC"],
  },
  {
    slug: "the-primal-hunter",
    title: "The Primal Hunter",
    synopsis:
      "When the multiverse initiates Earth into the System, quiet office worker Jake discovers an innate talent for the bow and an insatiable thrill for tracking apex beasts.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 950,
    tags: ["litrpg", "weak-to-strong", "male-protagonist"],
    genres: ["Action", "Fantasy", "Adventure"],
    aliases: ["TPH"],
  },
  {
    slug: "defiance-of-the-fall",
    title: "Defiance of the Fall",
    synopsis:
      "An unexpected planetary merger isolates Zac on an island overrun by demonic incursions, armed only with a rusty hatchet and an unrelenting will to endure.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 1350,
    tags: ["litrpg", "cultivation", "post-apocalyptic", "male-protagonist"],
    genres: ["Action", "Xianxia", "Sci-Fi"],
    aliases: ["DotF"],
  },
  {
    slug: "super-supportive",
    title: "Super Supportive",
    synopsis:
      "In a superhero society coexisting with the Artonan alien alliance, Alden dreams of becoming a support hero, navigating grueling contractual duties and deep friendships.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 220,
    tags: ["magic-academy", "slow-burn", "male-protagonist", "psychological"],
    genres: ["Superhero", "Urban Fantasy", "Slice of Life"],
    aliases: ["SSup"],
  },
  {
    slug: "the-wandering-inn",
    title: "The Wandering Inn",
    synopsis:
      "Erin Solstice is suddenly teleported to a fantasy world inhabited by drakes, gnolls, and goblins. Seeking shelter in an abandoned building, she decides to become an innkeeper.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.EN,
    chapterCount: 1500,
    tags: [
      "isekai",
      "litrpg",
      "female-protagonist",
      "multiple-pov",
      "slow-burn",
    ],
    genres: ["Fantasy", "Slice of Life", "Drama"],
    aliases: ["TWI"],
  },

  // --- JAPANESE (JP) ---
  {
    slug: "mushoku-tensei",
    title: "Mushoku Tensei: Jobless Reincarnation",
    originalTitle: "無職転生 - 異世界行ったら本気だす",
    synopsis:
      "A 34-year-old shut-in dies saving teenagers and reincarnates into a world of swords and sorcery as Rudeus Greyrat, resolved to live his second life without regret.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.JP,
    chapterCount: 260,
    tags: [
      "isekai",
      "reincarnation",
      "magic-academy",
      "male-protagonist",
      "slow-burn",
    ],
    genres: ["Fantasy", "Adventure", "Drama"],
    aliases: ["Jobless Reincarnation", "Isekai Ittara Honki Dasu"],
  },
  {
    slug: "re-zero",
    title: "Re:Zero − Starting Life in Another World",
    originalTitle: "Re:ゼロから始める異世界生活",
    synopsis:
      "Subaru Natsuki is summoned to an unfamiliar fantasy capital and quickly discovers he has 'Return by Death'—a rewind ability triggered only when he suffers fatal harm.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.JP,
    chapterCount: 650,
    tags: ["isekai", "time-loop", "psychological", "male-protagonist", "gore"],
    genres: ["Dark Fantasy", "Psychological", "Drama"],
    aliases: ["Re:Zero", "ReZero kara Hajimeru Isekai Seikatsu"],
  },
  {
    slug: "ascendance-of-a-bookworm",
    title: "Ascendance of a Bookworm",
    originalTitle: "本好きの下剋上",
    synopsis:
      "A young book-lover dies just after obtaining her librarian certificate and reincarnates as Myne, a sickly five-year-old peasant in a medieval world where books are luxury items.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.JP,
    chapterCount: 677,
    tags: ["isekai", "female-protagonist", "kingdom-building", "slow-burn"],
    genres: ["Fantasy", "Slice of Life", "Drama"],
    aliases: ["Honzuki no Gekokujou"],
  },
  {
    slug: "overlord",
    title: "Overlord",
    originalTitle: "オーバーロード",
    synopsis:
      "When the DMMO-RPG Yggdrasil shuts down, guildmaster Momonga remains logged in. Transported with the Great Tomb of Nazarick to a new world, he adopts the name Ainz Ooal Gown.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.JP,
    chapterCount: 18,
    tags: ["isekai", "antihero", "kingdom-building", "male-protagonist"],
    genres: ["Dark Fantasy", "Action"],
    aliases: ["Ainz Ooal Gown"],
  },
  {
    slug: "the-eminence-in-shadow",
    title: "The Eminence in Shadow",
    originalTitle: "陰の実力者になりたくて！",
    synopsis:
      "Obsessed with acting as a mysterious mastermind in the shadows, Cid Kagenou roleplays an anti-cult syndicate, unaware that all his made-up conspiracies are completely true.",
    status: NovelStatus.ONGOING,
    countryOfOrigin: Country.JP,
    chapterCount: 215,
    tags: ["isekai", "reincarnation", "comedy", "male-protagonist"],
    genres: ["Comedy", "Action", "Fantasy"],
    aliases: ["Kage no Jitsuryokusha ni Naritakute!"],
  },
  {
    slug: "so-im-a-spider-so-what",
    title: "So I'm a Spider, So What?",
    originalTitle: "蜘蛛ですが、なにか？",
    synopsis:
      "A high school classroom is wiped out by a rift in spacetime and reincarnated into a fantasy RPG world. A quiet girl awakens at the bottom of a labyrinth as a weak spider monster.",
    status: NovelStatus.COMPLETED,
    countryOfOrigin: Country.JP,
    chapterCount: 600,
    tags: [
      "isekai",
      "dungeon",
      "litrpg",
      "female-protagonist",
      "weak-to-strong",
    ],
    genres: ["Action", "Adventure", "Fantasy"],
    aliases: ["Kumo Desu ga, Nani ka?"],
  },
];

const ALL_NOVELS: SeedNovel[] = [...NOVELS];
const existingSlugs = new Set(ALL_NOVELS.map((novel) => novel.slug));
const normalizeName = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u4e00-\u9fff]+/g, "");
const existingNames = new Set(
  ALL_NOVELS.flatMap((novel) => [
    normalizeName(novel.title),
    ...novel.aliases.map(normalizeName),
  ]),
);
for (const candidate of CATALOG_CANDIDATES) {
  if (
    !existingSlugs.has(candidate.slug) &&
    !existingNames.has(normalizeName(candidate.title)) &&
    !candidate.aliases.some((alias) => existingNames.has(normalizeName(alias)))
  ) {
    ALL_NOVELS.push(candidate);
    existingSlugs.add(candidate.slug);
    existingNames.add(normalizeName(candidate.title));
    for (const alias of candidate.aliases)
      existingNames.add(normalizeName(alias));
  }
}

function validateSeedData(novels: SeedNovel[]) {
  const slugs = new Set<string>();
  const names = new Set<string>();

  for (const novel of novels) {
    if (
      !novel.slug ||
      !novel.title ||
      !novel.synopsis ||
      !novel.countryOfOrigin
    ) {
      throw new Error(
        `Invalid catalog record: ${novel.slug || novel.title || "untitled"}`,
      );
    }
    if (slugs.has(novel.slug))
      throw new Error(`Duplicate novel slug: ${novel.slug}`);
    if (names.has(normalizeName(novel.title))) {
      throw new Error(`Duplicate novel title: ${novel.title}`);
    }
    slugs.add(novel.slug);
    names.add(normalizeName(novel.title));
    for (const alias of novel.aliases) {
      if (names.has(normalizeName(alias))) {
        throw new Error(`Duplicate novel alias: ${alias}`);
      }
      names.add(normalizeName(alias));
    }
    if (novel.sourceUrl && !/^https?:\/\/\S+$/.test(novel.sourceUrl)) {
      throw new Error(`Invalid source URL for ${novel.slug}`);
    }
  }

  const counts = new Map<Country, number>();
  for (const novel of novels) {
    counts.set(
      novel.countryOfOrigin,
      (counts.get(novel.countryOfOrigin) ?? 0) + 1,
    );
  }
  for (const country of [Country.CN, Country.KR, Country.EN]) {
    if ((counts.get(country) ?? 0) < 10) {
      throw new Error(`Catalog balance check failed for ${country}`);
    }
  }
}

async function main() {
  validateSeedData(ALL_NOVELS);
  console.log(`Seeding ${TAGS.length} tags...`);
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, category: tag.category, isApproved: true },
      create: { ...tag, isApproved: true },
    });
  }

  const tagRows = await prisma.tag.findMany();
  const tagBySlug = new Map(tagRows.map((tag) => [tag.slug, tag]));

  console.log(`Seeding ${ALL_NOVELS.length} novels...`);
  for (const novel of ALL_NOVELS) {
    const row = await prisma.novel.upsert({
      where: { slug: novel.slug },
      update: {
        title: novel.title,
        author: novel.author,
        originalTitle: novel.originalTitle,
        synopsis: novel.synopsis,
        ...(novel.status ? { status: novel.status } : {}),
        countryOfOrigin: novel.countryOfOrigin,
        ...(novel.chapterCount !== undefined
          ? { chapterCount: novel.chapterCount }
          : {}),
        coverImageUrl: novel.coverImageUrl,
        ...(novel.sourceUrl
          ? {
              externalLinks: [
                {
                  source: novel.source ?? "Source",
                  url: novel.sourceUrl,
                },
              ],
            }
          : {}),
      },
      create: {
        slug: novel.slug,
        title: novel.title,
        author: novel.author,
        originalTitle: novel.originalTitle,
        synopsis: novel.synopsis,
        ...(novel.status ? { status: novel.status } : {}),
        countryOfOrigin: novel.countryOfOrigin,
        ...(novel.chapterCount !== undefined
          ? { chapterCount: novel.chapterCount }
          : {}),
        coverImageUrl: novel.coverImageUrl,
        ...(novel.sourceUrl
          ? {
              externalLinks: [
                {
                  source: novel.source ?? "Source",
                  url: novel.sourceUrl,
                },
              ],
            }
          : {}),
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

  console.log(
    `Seed complete: ${ALL_NOVELS.length} novels, ${TAGS.length} tags`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
