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
      <section className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
        <h1 className="text-3xl font-bold">Find your next webnovel</h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Browse a community catalog, compare multi-dimensional ratings, and track
          what you are reading across every platform.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/novels"
            className="rounded bg-sky-500 px-4 py-2 font-medium text-slate-950 hover:bg-sky-400"
          >
            Browse catalog
          </Link>
          <Link
            href="/search"
            className="rounded border border-slate-700 px-4 py-2 font-medium hover:border-slate-500"
          >
            Search titles
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Trending this week</h2>
          <Link href="/novels?sort=score">View top rated</Link>
        </div>
        <NovelGrid novels={trending} emptyMessage="No rated novels yet." />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Recently added</h2>
          <Link href="/novels">View all</Link>
        </div>
        <NovelGrid novels={latest} emptyMessage="The catalog is empty." />
      </section>
    </div>
  );
}
