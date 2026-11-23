import { Country, NovelStatus } from "@prisma/client";
import { getApi } from "@/trpc/server";
import { NovelGrid } from "@/components/catalog/NovelGrid";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import Link from "next/link";
import { X, Search } from "lucide-react";
import type { NovelCardData } from "@/types/catalog";
import { buildCatalogQuery, parseCatalogQuery } from "@/lib/catalogQuery";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NovelsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const query = parseCatalogQuery(sp);
  const page = query.page ?? 1;
  const status = query.status as NovelStatus | undefined;
  const country = query.country as Country | undefined;
  const sort = (query.sort ?? "latest") as "latest" | "score" | "chapters";
  const tagSlugs = query.tags;
  const q = query.q;

  const api = await getApi();
  let items: NovelCardData[] = [];
  let total = 0;
  let totalPages = 1;

  if (q) {
    try {
      const searchRes = await api.search.novels({
        q,
        page,
        hitsPerPage: 20,
        sort:
          sort === "score"
            ? "score"
            : sort === "chapters"
              ? "chapters"
              : "relevance",
        filters: {
          status:
            status && Object.values(NovelStatus).includes(status)
              ? status
              : undefined,
          country:
            country && Object.values(Country).includes(country)
              ? country
              : undefined,
          tags: tagSlugs,
          excludeTags: query.excludeTags,
          genres: query.genres,
          excludeGenres: query.excludeGenres,
        },
      });

      items = searchRes.hits.map((hit) => ({
        id: hit.id,
        slug: hit.slug,
        title: hit.title,
        author: hit.author ?? null,
        originalTitle: hit.originalTitle ?? undefined,
        status: hit.status as NovelStatus,
        countryOfOrigin: hit.countryOfOrigin as Country,
        chapterCount: hit.chapterCount,
        coverImageUrl: hit.coverImageUrl ?? undefined,
        scoreCache:
          hit.bayesianScore != null
            ? {
                bayesianScore: hit.bayesianScore,
                reviewCount: hit.reviewCount ?? 0,
              }
            : null,
        tags: ((hit.tags as string[] | undefined) ?? []).map(
          (name: string) => ({
            tag: {
              id: name,
              name,
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            },
          }),
        ),
      })) as NovelCardData[];

      total = searchRes.totalHits;
      totalPages = searchRes.totalPages;
    } catch {
      items = [];
    }
  } else {
    try {
      const listRes = await api.novels.list({
        page,
        limit: 20,
        status:
          status && Object.values(NovelStatus).includes(status)
            ? status
            : undefined,
        country:
          country && Object.values(Country).includes(country)
            ? country
            : undefined,
        tagSlugs,
        genreSlugs: query.genres,
        excludeGenreSlugs: query.excludeGenres,
        excludeTagSlugs: query.excludeTags,
        sort,
      });
      items = listRes.items;
      total = listRes.total;
      totalPages = listRes.totalPages;
    } catch {
      items = [];
    }
  }

  const pageHref = (target: number) => {
    const next = buildCatalogQuery({ ...query, page: target });
    return `/novels?${next.toString()}`;
  };

  const clearQueryHref = () => {
    const next = buildCatalogQuery(query, { omitQuery: true, omitPage: true });
    return `/novels${next.toString() ? `?${next.toString()}` : ""}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <FilterPanel />
      <div className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-2xl">
              {q ? (
                <span className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-neutral-400" />
                  Results for &ldquo;{q}&rdquo;
                </span>
              ) : (
                "Catalog"
              )}
            </h1>
            {q && (
              <Link
                href={clearQueryHref()}
                className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
                Clear search query
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>
              {total} {total === 1 ? "novel" : "novels"}
            </span>
            <Link
              href="/novels/new"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              + Add novel
            </Link>
          </div>
        </div>

        <NovelGrid
          novels={items}
          emptyMessage={
            q
              ? `No novels matched "${q}". Try another search or clear filters.`
              : "No novels match these filters."
          }
        />

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-3 pt-6">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
              >
                Previous
              </Link>
            )}
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
