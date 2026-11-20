"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Filter, RotateCcw } from "lucide-react";

const STATUSES = ["ONGOING", "COMPLETED", "HIATUS", "DROPPED"];
const COUNTRIES = ["KR", "CN", "JP", "EN", "OTHER"];

export function FilterPanel() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.push(`/novels?${next.toString()}`);
    },
    [params, router],
  );

  const hasFilters =
    Boolean(params.get("status")) ||
    Boolean(params.get("country")) ||
    Boolean(params.get("tags")) ||
    Boolean(params.get("q")) ||
    params.get("sort") === "score" ||
    params.get("sort") === "chapters";

  const clearAll = () => {
    router.push("/novels");
  };

  return (
    <aside className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#16171c]">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
        <span className="mb-1 block">Status</span>
        <select
          value={params.get("status") ?? ""}
          onChange={(event) => update("status", event.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
        <span className="mb-1 block">Country</span>
        <select
          value={params.get("country") ?? ""}
          onChange={(event) => update("country", event.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option value="">All Origins</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
        <span className="mb-1 block">Sort Order</span>
        <select
          value={params.get("sort") ?? "latest"}
          onChange={(event) => update("sort", event.target.value)}
          className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option value="latest">Recently Added</option>
          <option value="score">Highest Rated (Score)</option>
          <option value="chapters">Most Chapters</option>
        </select>
      </label>

      <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
        <span className="mb-1 block">Tag filter</span>
        <input
          defaultValue={params.get("tags") ?? ""}
          onBlur={(event) => update("tags", event.target.value.trim())}
          placeholder="e.g. cultivation, isekai"
          className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 placeholder-neutral-400 transition dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-neutral-500"
        />
      </label>
    </aside>
  );
}
