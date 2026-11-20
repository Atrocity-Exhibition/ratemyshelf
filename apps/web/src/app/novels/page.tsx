import { Country, NovelStatus } from "@prisma/client";
import { getApi } from "@/trpc/server";
import { NovelGrid } from "@/components/catalog/NovelGrid";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NovelsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(first(sp.page) ?? 1) || 1);
  const status = first(sp.status) as NovelStatus | undefined;
  const country = first(sp.country) as Country | undefined;
  const sort = (first(sp.sort) ?? "latest") as "latest" | "score" | "chapters";
  const tagSlugs = first(sp.tags)?.split(",").filter(Boolean);

  const api = await getApi();
  let result: Awaited<ReturnType<typeof api.novels.list>> = {
    items: [],
    total: 0,
    page,
    totalPages: 1,
  };

  try {
    result = await api.novels.list({
      page,
      limit: 20,
      status: status && Object.values(NovelStatus).includes(status) ? status : undefined,
      country: country && Object.values(Country).includes(country) ? country : undefined,
      tagSlugs,
      sort,
    });
  } catch {
    // Render the empty state while the database is unavailable.
  }

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (country) params.set("country", country);
  if (sort !== "latest") params.set("sort", sort);
  if (tagSlugs?.length) params.set("tags", tagSlugs.join(","));

  const pageHref = (target: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(target));
    return `/novels?${next.toString()}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <FilterPanel />
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">Catalog</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/novels/new">Add a novel</Link>
            <span className="text-slate-500">{result.total} novels</span>
          </div>
        </div>
        <NovelGrid novels={result.items} emptyMessage="No novels match these filters." />
        {result.totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-4">
            {page > 1 && <Link href={pageHref(page - 1)}>Previous</Link>}
            <span className="text-sm text-slate-500">
              Page {result.page} of {result.totalPages}
            </span>
            {page < result.totalPages && <Link href={pageHref(page + 1)}>Next</Link>}
          </nav>
        )}
      </div>
    </div>
  );
}
