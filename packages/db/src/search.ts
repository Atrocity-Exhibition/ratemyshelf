import { MeiliSearch } from "meilisearch";
import type {
  Novel,
  NovelAlias,
  NovelTag,
  Tag,
  GenreLink,
} from "@prisma/client";

export const NOVELS_INDEX = "novels";

export type NovelWithRelations = Novel & {
  aliases: NovelAlias[];
  tags: (NovelTag & { tag: Tag })[];
  genres: GenreLink[];
};

export type NovelSearchDocument = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  coverImageUrl: string | null;
  aliases: string[];
  synopsis: string;
  tags: string[];
  tagSlugs: string[];
  genres: string[];
  genreSlugs: string[];
  status: string;
  countryOfOrigin: string;
  chapterCount: number;
  bayesianScore: number | null;
  reviewCount: number;
  createdAt: string;
};

export function getSearchClient(): MeiliSearch {
  return new MeiliSearch({
    host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_API_KEY ?? "",
  });
}

export function toSearchDocument(
  novel: NovelWithRelations,
  score?: { bayesianScore: number; reviewCount: number } | null,
): NovelSearchDocument {
  return {
    id: novel.id,
    slug: novel.slug,
    title: novel.title,
    originalTitle: novel.originalTitle,
    coverImageUrl: novel.coverImageUrl,
    aliases: novel.aliases.map((alias) => alias.alias),
    synopsis: novel.synopsis,
    tags: novel.tags.map((entry) => entry.tag.name),
    tagSlugs: novel.tags.map((entry) => entry.tag.slug),
    genres: novel.genres.map((genre) => genre.name),
    genreSlugs: novel.genres.map((genre) => genre.slug),
    status: novel.status,
    countryOfOrigin: novel.countryOfOrigin,
    chapterCount: novel.chapterCount,
    bayesianScore: score?.bayesianScore ?? null,
    reviewCount: score?.reviewCount ?? 0,
    createdAt: novel.createdAt.toISOString(),
  };
}

export async function configureNovelIndex(): Promise<void> {
  const client = getSearchClient();
  const index = client.index(NOVELS_INDEX);

  await index.updateSettings({
    searchableAttributes: [
      "title",
      "originalTitle",
      "aliases",
      "synopsis",
      "tags",
      "genres",
      "tagSlugs",
      "genreSlugs",
    ],
    filterableAttributes: [
      "status",
      "countryOfOrigin",
      "tags",
      "genres",
      "tagSlugs",
      "genreSlugs",
      "bayesianScore",
      "reviewCount",
    ],
    sortableAttributes: [
      "bayesianScore",
      "reviewCount",
      "chapterCount",
      "createdAt",
    ],
    typoTolerance: {
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ],
  });
}
