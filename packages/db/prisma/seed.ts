import {
  PrismaClient,
  TagCategory,
  NovelStatus,
  Country,
} from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CATALOG_CANDIDATES } from "./catalogCandidates";
import {
  validateSeedCatalog,
  normalizeCatalogName,
  type SeedNovelRecord,
} from "../src/seedValidation";

const prisma = new PrismaClient();

type SeedNovel = SeedNovelRecord;

const TAGS: {
  name: string;
  slug: string;
  category: TagCategory;
  description?: string;
}[] = [
  // --- Core Webnovel Genres ---
  {
    name: "Cultivation",
    slug: "cultivation",
    category: TagCategory.GENRE,
    description:
      "Stories centering on martial, spiritual, or Daoist ascendance to immortality.",
  },
  {
    name: "LitRPG",
    slug: "litrpg",
    category: TagCategory.GENRE,
    description:
      "Literary role-playing games where character progression is governed by explicit stats, levels, and skills.",
  },
  {
    name: "Romance",
    slug: "romance",
    category: TagCategory.GENRE,
    description:
      "Narratives where romantic relationships play a central emotional and narrative role.",
  },
  {
    name: "Action",
    slug: "action",
    category: TagCategory.GENRE,
    description:
      "Fast-moving conflict with frequent physical or magical confrontations.",
  },
  {
    name: "Adventure",
    slug: "adventure",
    category: TagCategory.GENRE,
    description: "Journeys into unknown lands, ruins, and perilous frontiers.",
  },
  {
    name: "Comedy",
    slug: "comedy",
    category: TagCategory.GENRE,
    description:
      "Lighthearted or satirical stories designed for humor and amusement.",
  },
  {
    name: "Mystery",
    slug: "mystery",
    category: TagCategory.GENRE,
    description:
      "Plots built around investigating puzzles, crimes, secrets, or occult enigmas.",
  },
  {
    name: "Supernatural",
    slug: "supernatural",
    category: TagCategory.GENRE,
    description:
      "Forces, entities, and phenomena beyond natural physical laws.",
  },
  {
    name: "Sci-Fi",
    slug: "sci-fi",
    category: TagCategory.GENRE,
    description:
      "Speculative fiction dealing with future technology, space travel, or scientific concepts.",
  },
  {
    name: "Horror",
    slug: "horror",
    category: TagCategory.GENRE,
    description:
      "Fiction intended to elicit fear, dread, and atmospheric unease.",
  },
  {
    name: "Drama",
    slug: "drama",
    category: TagCategory.GENRE,
    description:
      "Emotion-driven interpersonal conflict and serious character arcs.",
  },
  {
    name: "Slice of Life",
    slug: "slice-of-life",
    category: TagCategory.GENRE,
    description:
      "Mundane daily routines, relaxed pacing, and character-driven interactions.",
  },

  // --- Themes & Tropes ---
  {
    name: "Isekai",
    slug: "isekai",
    category: TagCategory.THEME,
    description:
      "Protagonists transported, summoned, or trapped in an unfamiliar alternate world.",
  },
  {
    name: "Transmigration",
    slug: "transmigration",
    category: TagCategory.THEME,
    description:
      "A soul crossing over to inhabit the body of another person in another time or world.",
  },
  {
    name: "Reincarnation",
    slug: "reincarnation",
    category: TagCategory.THEME,
    description:
      "Starting life anew from birth or childhood with retained past-life memories.",
  },
  {
    name: "Regression",
    slug: "regression",
    category: TagCategory.THEME,
    description:
      "Returning to a pivotal point in the past to prevent catastrophe armed with future knowledge.",
  },
  {
    name: "Time Loop",
    slug: "time-loop",
    category: TagCategory.THEME,
    description:
      "Repeating a fixed span of time repeatedly until specific conditions are met.",
  },
  {
    name: "System",
    slug: "system",
    category: TagCategory.THEME,
    description:
      "An interface, voice, or divine prompt providing quests, rewards, and status updates.",
  },
  {
    name: "Weak to Strong",
    slug: "weak-to-strong",
    category: TagCategory.THEME,
    description:
      "A protagonist who begins with little power, status, or talent and steadily earns mastery.",
  },
  {
    name: "Overpowered Protagonist",
    slug: "overpowered-protagonist",
    category: TagCategory.THEME,
    description:
      "A lead character whose strength drastically outclasses typical opponents.",
  },
  {
    name: "Smart Protagonist",
    slug: "smart-protagonist",
    category: TagCategory.THEME,
    description:
      "Hero who relies on intellect, strategy, cunning, and preparation rather than brute force.",
  },
  {
    name: "Antihero",
    slug: "antihero",
    category: TagCategory.THEME,
    description:
      "A protagonist lacking conventional heroic virtues, operating by self-interest or grim pragmatism.",
  },
  {
    name: "Villain Protagonist",
    slug: "villain-protagonist",
    category: TagCategory.THEME,
    description:
      "A main character who acts as the antagonist to the world, often ruthless or morally corrupt.",
  },
  {
    name: "Kingdom Building",
    slug: "kingdom-building",
    category: TagCategory.THEME,
    description:
      "Establishing, administering, defending, and expanding a territory, faction, or empire.",
  },
  {
    name: "Crafting",
    slug: "crafting",
    category: TagCategory.THEME,
    description:
      "In-depth focus on blacksmithing, alchemy, enchantment, engineering, or artifact creation.",
  },
  {
    name: "Necromancy",
    slug: "necromancy",
    category: TagCategory.THEME,
    description:
      "The manipulation of life and death, commanding undead minions and spirit arts.",
  },
  {
    name: "Revenge",
    slug: "revenge",
    category: TagCategory.THEME,
    description:
      "A quest to extract vengeance from betrayers, corrupt nobles, or hostile factions.",
  },
  {
    name: "Martial Arts",
    slug: "martial-arts",
    category: TagCategory.THEME,
    description:
      "Unarmed combat, weapon mastery, inner breathing, and disciplined combat traditions.",
  },

  // --- Setting ---
  {
    name: "Dungeon",
    slug: "dungeon",
    category: TagCategory.SETTING,
    description:
      "Labyrinths, towers, and supernatural subterranean structures housing monsters and loot.",
  },
  {
    name: "Magic Academy",
    slug: "magic-academy",
    category: TagCategory.SETTING,
    description:
      "Institutions of higher learning, cadet trials, and student rivalries centered on magical arts.",
  },
  {
    name: "Post-Apocalyptic",
    slug: "post-apocalyptic",
    category: TagCategory.SETTING,
    description:
      "Civilization rebuilt or barely surviving after catastrophic collapse.",
  },
  {
    name: "Urban Fantasy",
    slug: "urban-fantasy",
    category: TagCategory.SETTING,
    description:
      "Hidden supernatural elements, secret societies, and magical factions within a modern city.",
  },
  {
    name: "Virtual Reality",
    slug: "virtual-reality",
    category: TagCategory.SETTING,
    description:
      "Full-dive neural gear, digital fantasy realms, and game worlds.",
  },
  {
    name: "Space",
    slug: "space",
    category: TagCategory.SETTING,
    description: "Interstellar voyages, orbital habitats, and cosmic empires.",
  },
  {
    name: "Monsters",
    slug: "monsters",
    category: TagCategory.SETTING,
    description:
      "Wild beasts, mutated horrors, demonic incursions, and non-human adversaries.",
  },
  {
    name: "Mythology",
    slug: "mythology",
    category: TagCategory.SETTING,
    description:
      "Pantheons of gods, mythological deities, ancient folklore, and sacred legends.",
  },
  {
    name: "Male Protagonist",
    slug: "male-protagonist",
    category: TagCategory.SETTING,
    description: "Stories told from the primary viewpoint of a male character.",
  },
  {
    name: "Female Protagonist",
    slug: "female-protagonist",
    category: TagCategory.SETTING,
    description:
      "Stories told from the primary viewpoint of a female character.",
  },

  // --- Content Warnings & Tone ---
  {
    name: "Gore",
    slug: "gore",
    category: TagCategory.CONTENT_WARNING,
    description: "Graphic bodily harm, visceral violence, and explicit wounds.",
  },
  {
    name: "Dark",
    slug: "dark",
    category: TagCategory.CONTENT_WARNING,
    description:
      "Bleak atmosphere, grim stakes, morally grey circumstances, and high mortality.",
  },
  {
    name: "Tragedy",
    slug: "tragedy",
    category: TagCategory.CONTENT_WARNING,
    description:
      "Painful loss, doomed aspirations, heartbreak, and sacrificial suffering.",
  },
  {
    name: "Psychological",
    slug: "psychological",
    category: TagCategory.CONTENT_WARNING,
    description:
      "Deep exploration of sanity, paranoia, trauma, identity, and mental strain.",
  },

  // --- Format & Pacing ---
  {
    name: "Slow Burn",
    slug: "slow-burn",
    category: TagCategory.FORMAT,
    description:
      "Patient buildup, extensive world immersion, and deliberate character development.",
  },
  {
    name: "Fast-Paced",
    slug: "fast-paced",
    category: TagCategory.FORMAT,
    description:
      "High-momentum events with rapid transitions from encounter to encounter.",
  },
  {
    name: "Multiple POV",
    slug: "multiple-pov",
    category: TagCategory.FORMAT,
    description:
      "Narrative shifts between varied characters, perspectives, and geographic locations.",
  },
  {
    name: "Episodic",
    slug: "episodic",
    category: TagCategory.FORMAT,
    description:
      "Self-contained arcs, short investigations, or modular adventures within a broader tapestry.",
  },
];

const NOVELS: SeedNovel[] = [
  // --- KOREAN (KR) ---
  {
    slug: "solo-leveling",
    title: "Solo Leveling",
    author: "Chugong",
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
    author: "Sing-Shong",
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
    author: "Jee Gab Song",
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
    author: "Yoo Ryeo Han",
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
    author: "Ro Yu-jin",
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
    author: "Park Saenal",
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
    author: "Biga",
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
    author: "Geunseo",
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
    author: "Sadoyeon",
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
    author: "Mogma",
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
    author: "idengbyeol",
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
    author: "Gwon Gyeoeul",
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
    author: "Cuttlefish That Loves Diving",
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
    author: "Gu Zhen Ren",
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
    author: "Er Gen",
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
    author: "Er Gen",
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
    author: "Legend of the Paladin",
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
    author: "Chocolion",
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
    author: "Er Mu",
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
    author: "I Fix Air-Conditioner",
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
    author: "Er Gen",
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
    author: "Er Gen",
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
    author: "nobody103",
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
    author: "Guiltythree",
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
    author: "TurtleMe",
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
    author: "Casualfarmer",
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
    author: "Void Herald",
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
    author: "Matt Dinniman",
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
    author: "Zogarth",
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
    author: "TheFirstDefier",
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
    author: "Sleyca",
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
    author: "pirateaba",
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
    author: "Rifujin na Magonote",
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
    author: "Tappei Nagatsuki",
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
    author: "Miya Kazuki",
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
    author: "Kugane Maruyama",
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
    author: "Daisuke Aizawa",
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
    author: "Okina Baba",
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
const existingNames = new Set(
  ALL_NOVELS.flatMap((novel) => [
    normalizeCatalogName(novel.title),
    ...novel.aliases.map(normalizeCatalogName),
  ]),
);
for (const candidate of CATALOG_CANDIDATES) {
  if (
    !existingSlugs.has(candidate.slug) &&
    !existingNames.has(normalizeCatalogName(candidate.title)) &&
    !candidate.aliases.some((alias) =>
      existingNames.has(normalizeCatalogName(alias)),
    )
  ) {
    ALL_NOVELS.push(candidate);
    existingSlugs.add(candidate.slug);
    existingNames.add(normalizeCatalogName(candidate.title));
    for (const alias of candidate.aliases)
      existingNames.add(normalizeCatalogName(alias));
  }
}

type CoverEntry = { url: string; source?: string; verified?: boolean };

function loadVerifiedCovers(): Record<string, CoverEntry> {
  const file = path.join(__dirname, "covers.json");
  if (!existsSync(file)) return {};
  const parsed = JSON.parse(readFileSync(file, "utf8")) as {
    covers?: Record<string, CoverEntry>;
  };
  return parsed.covers ?? {};
}

const verifiedCovers = loadVerifiedCovers();
for (const novel of ALL_NOVELS) {
  const cover = verifiedCovers[novel.slug];
  if (cover?.url && cover.verified !== false && !novel.coverImageUrl) {
    novel.coverImageUrl = cover.url;
  }
}

async function main() {
  validateSeedCatalog(ALL_NOVELS, new Set(TAGS.map((t) => t.slug)));
  console.log(`Seeding ${TAGS.length} tags...`);
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {
        name: tag.name,
        category: tag.category,
        description: tag.description ?? null,
        isApproved: true,
      },
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
