export type NovelCardData = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  coverImageUrl: string | null;
  status: string;
  countryOfOrigin: string;
  chapterCount: number;
  scoreCache: {
    bayesianScore: number;
    reviewCount: number;
    avgStory: number | null;
    avgTranslation: number | null;
    avgCharacters: number | null;
    avgWorldBuilding: number | null;
    avgOverall: number;
  } | null;
  tags: { tag: { name: string; slug: string } }[];
};

export type NovelDetailData = NovelCardData & {
  synopsis: string;
  aliases: { id: string; alias: string }[];
  genres: { id: string; name: string; slug: string }[];
  externalLinks: { source: string; url: string }[];
};

export type ReviewData = {
  id: string;
  userId: string;
  status: string;
  body: string | null;
  containsSpoiler: boolean;
  scoreStory: number | null;
  scoreTranslation: number | null;
  scoreCharacters: number | null;
  scoreWorldBuilding: number | null;
  scoreOverall: number;
  helpfulVotes: number;
  createdAt: string | Date;
  user: { id: string; username: string; avatarUrl: string | null };
};

export type ShelfItemData = {
  id: string;
  status: string;
  lastChapter: number | null;
  novel: NovelCardData;
};

export type SearchHit = {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string | null;
  coverImageUrl?: string | null;
  aliases?: string[];
  synopsis?: string;
  status: string;
  countryOfOrigin: string;
  chapterCount: number;
  bayesianScore?: number | null;
  reviewCount?: number;
  _formatted?: {
    title?: string;
    originalTitle?: string;
    aliases?: string[];
  };
};
