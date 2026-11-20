"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import type { SearchHit } from "@/types/catalog";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const { data, isFetching, error } = trpc.search.novels.useQuery({
    q: debouncedQuery,
    page: 1,
    hitsPerPage: 20,
    sort: "relevance",
    filters: {
      ...(status ? { status: status as never } : {}),
      ...(country ? { country: country as never } : {}),
    },
  });

  const hits = (data?.hits ?? []) as SearchHit[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Search
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Fuzzy typo-tolerant matching across titles, aliases, native-script names and genres.
        </p>
      </div>

      <SearchInput value={query} onChange={setQuery} />

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option value="">Any status</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="HIATUS">Hiatus</option>
          <option value="DROPPED">Dropped</option>
        </select>
        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option value="">Any country</option>
          <option value="KR">KR</option>
          <option value="CN">CN</option>
          <option value="JP">JP</option>
          <option value="EN">EN</option>
          <option value="OTHER">Other</option>
        </select>
        {data && (
          <span className="self-center text-xs text-neutral-500 dark:text-neutral-400">
            {data.totalHits} results · {data.processingTimeMs} ms
            {isFetching ? " · searching…" : ""}
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
          Search is unavailable: {error.message}
        </p>
      )}

      {query && hits.length === 0 && !isFetching && !error && (
        <SearchEmptyState query={query} />
      )}

      <div className="grid gap-4">
        {hits.map((hit) => (
          <SearchResultCard key={hit.id} hit={hit} />
        ))}
      </div>
    </div>
  );
}
