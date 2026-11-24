import Link from "next/link";
import { getApi } from "@/trpc/server";
import { NovelGrid } from "@/components/catalog/NovelGrid";
import { auth } from "@/auth";
import { HomeHero } from "@/components/home/HomeHero";
import { GenreBrowse } from "@/components/home/GenreBrowse";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const api = await getApi();
  const session = await auth();

  let trending: Awaited<ReturnType<typeof api.novels.trending>> = [];
  let latest: Awaited<ReturnType<typeof api.novels.list>>["items"] = [];
  let genres: { name: string; slug: string }[] = [];

  try {
    [trending, latest] = await Promise.all([
      api.novels.trending({ limit: 8 }),
      api.novels.list({ page: 1, limit: 12, sort: "latest" }),
    ]).then(([t, l]) => [t, l.items] as const);
  } catch {
    // The catalog renders empty until the database is reachable.
  }

  try {
    genres = await api.novels.genres();
  } catch {
    // Genre browsing is optional; the catalog sections can still render.
  }

  return (
    <>
      <h1 className="sr-only">
        RateMyShelf — webnovel ratings, reviews and shelves
      </h1>
      <div className="space-y-10">
        {!session?.user && <HomeHero />}
        <GenreBrowse genres={genres} />
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
    </>
  );
}
