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
  const debouncedQuery = useDebouncedValue(query, 300);

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
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-slate-400">
          Fuzzy matching across titles, aliases, native-script names and genres.
        </p>
      </div>

      <SearchInput value={query} onChange={setQuery} />

      <div className="flex flex-wrap gap-3 text-sm">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
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
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
        >
          <option value="">Any country</option>
          <option value="KR">KR</option>
          <option value="CN">CN</option>
          <option value="JP">JP</option>
          <option value="EN">EN</option>
          <option value="OTHER">Other</option>
        </select>
        {data && (
          <span className="self-center text-xs text-slate-500">
            {data.totalHits} results · {data.processingTimeMs} ms
            {isFetching ? " · searching…" : ""}
          </span>
        )}
      </div>

      {error && (
        <p className="rounded border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">
          Search is unavailable: {error.message}
        </p>
      )}

      {!error && hits.length === 0 && !isFetching ? (
        <SearchEmptyState query={debouncedQuery} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {hits.map((hit) => (
            <SearchResultCard key={hit.id} hit={hit} />
          ))}
        </div>
      )}
    </div>
  );
}
