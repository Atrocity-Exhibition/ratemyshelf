import Link from "next/link";
import { getApi } from "@/trpc/server";
import { NovelGrid } from "@/components/catalog/NovelGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const api = await getApi();

  let trending: Awaited<ReturnType<typeof api.novels.trending>> = [];
  let latest: Awaited<ReturnType<typeof api.novels.list>>["items"] = [];

  try {
    [trending, latest] = await Promise.all([
      api.novels.trending({ limit: 8 }),
      api.novels.list({ page: 1, limit: 12, sort: "latest" }),
    ]).then(([t, l]) => [t, l.items] as const);
  } catch {
    // The catalog renders empty until the database is reachable.
  }

  return (
    <div className="space-y-12">
      {/* Editorial Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-xs dark:border-neutral-800 dark:bg-[#16171c]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            RateMyShelf (RMS)
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white">
            Webnovel ratings, reviews &amp; reading shelves.
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            Browse multi-dimensional community scores for story, characters, and translation quality. Organize your personal shelves and find your next obsession.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/novels"
              className="rounded-lg bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Browse Catalog
            </Link>
            <Link
              href="/novels?sort=score"
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-500"
            >
              Top Rated Books
            </Link>
          </div>
        </div>
      </section>

      {/* Trending / Top Section */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
              Highest Rated
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Community favorites weighted by Bayesian user consensus
            </p>
          </div>
          <Link
            href="/novels?sort=score"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
          >
            View all →
          </Link>
        </div>
        <NovelGrid novels={trending} emptyMessage="No rated novels yet." />
      </section>

      {/* Recently Added Section */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
              Recently Added
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Fresh additions to the RateMyShelf catalog
            </p>
          </div>
          <Link
            href="/novels?sort=latest"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
          >
            View all →
          </Link>
        </div>
        <NovelGrid novels={latest} emptyMessage="The catalog is empty." />
      </section>
    </div>
  );
}
