import { Country, NovelStatus } from "@prisma/client";

export type SeedNovelRecord = {
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

export function normalizeCatalogName(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u4e00-\u9fff\uac00-\ud7af]+/g, "");
}

export function validateSeedCatalog(
  novels: SeedNovelRecord[],
  allowedTagSlugs?: Set<string>,
) {
  const slugs = new Set<string>();
  const names = new Set<string>();

  for (const novel of novels) {
    if (
      !novel.slug ||
      !novel.title ||
      !novel.author ||
      !novel.synopsis ||
      !novel.countryOfOrigin
    ) {
      throw new Error(
        `Invalid catalog record: ${novel.slug || novel.title || "untitled"}`,
      );
    }
    if (slugs.has(novel.slug)) {
      throw new Error(`Duplicate novel slug: ${novel.slug}`);
    }
    const normTitle = normalizeCatalogName(novel.title);
    if (names.has(normTitle)) {
      throw new Error(`Duplicate novel title: ${novel.title}`);
    }
    slugs.add(novel.slug);
    names.add(normTitle);

    for (const alias of novel.aliases) {
      const normAlias = normalizeCatalogName(alias);
      if (names.has(normAlias)) {
        throw new Error(`Duplicate novel alias: ${alias}`);
      }
      names.add(normAlias);
    }

    if (novel.sourceUrl && !/^https?:\/\/\S+$/.test(novel.sourceUrl)) {
      throw new Error(`Invalid source URL for ${novel.slug}`);
    }
    if (novel.coverImageUrl && !/^https?:\/\/\S+$/.test(novel.coverImageUrl)) {
      throw new Error(`Invalid cover URL for ${novel.slug}`);
    }

    if (allowedTagSlugs) {
      for (const tagSlug of novel.tags) {
        if (!allowedTagSlugs.has(tagSlug)) {
          throw new Error(
            `Novel "${novel.slug}" references unknown tag slug: "${tagSlug}"`,
          );
        }
      }
    }
  }

  if (novels.length >= 30) {
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
}
