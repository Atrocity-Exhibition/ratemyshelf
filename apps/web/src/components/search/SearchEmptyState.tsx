import Link from "next/link";

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center">
      <p className="text-slate-400">
        No novels matched {query ? `“${query}”` : "that query"}.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Try a shorter title, an alias, or browse by tag.
      </p>
      <Link href="/novels" className="mt-4 inline-block text-sm">
        Browse the catalog
      </Link>
    </div>
  );
}
