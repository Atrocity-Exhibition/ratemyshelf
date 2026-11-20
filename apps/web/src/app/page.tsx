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
      <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-slate-950/90 p-8 sm:p-10 shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Find your next webnovel</h1>
        <p className="mt-2 max-w-2xl text-base text-slate-400">
          Browse a community catalog, compare multi-dimensional ratings, and track
          what you are reading across every platform.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/novels"
            className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 shadow-sm shadow-sky-500/20 transition hover:bg-sky-400 hover:shadow-sky-500/30 active:scale-[0.98]"
          >
            Browse catalog
          </Link>
          <Link
            href="/search"
            className="rounded-lg border border-slate-700/80 bg-slate-800/30 px-4 py-2 font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
          >
            Search titles
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Trending this week</h2>
          <Link href="/novels?sort=score" className="text-sm font-medium hover:text-sky-300">View top rated</Link>
        </div>
        <NovelGrid novels={trending} emptyMessage="No rated novels yet." />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Recently added</h2>
          <Link href="/novels" className="text-sm font-medium hover:text-sky-300">View all</Link>
        </div>
        <NovelGrid novels={latest} emptyMessage="The catalog is empty." />
      </section>
    </div>
  );
}
