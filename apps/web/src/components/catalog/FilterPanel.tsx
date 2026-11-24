"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Filter, RotateCcw, X } from "lucide-react";
import { FilterChips } from "./FilterChips";

const STATUSES = ["ONGOING", "COMPLETED", "HIATUS", "DROPPED"];
const COUNTRIES = ["KR", "CN", "JP", "EN", "OTHER"];

type FilterItem = { name: string; slug: string };

function values(params: URLSearchParams, key: string) {
  return (params.get(key) ?? "").split(",").filter(Boolean);
}

export function FilterPanel({
  genres,
  tags,
}: {
  genres: FilterItem[];
  tags: FilterItem[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.push(`/novels${next.toString() ? `?${next}` : ""}`);
    },
    [params, router],
  );
  const updateList = (key: string, selected: string[]) =>
    update(key, selected.join(","));
  const hasFilters =
    [
      "status",
      "country",
      "tags",
      "excludeTags",
      "genres",
      "excludeGenres",
      "q",
      "rated",
    ].some((key) => Boolean(params.get(key))) ||
    ["score", "chapters"].includes(params.get("sort") ?? "");

  const active = [
    ...(["genres", "excludeGenres", "tags", "excludeTags"] as const).flatMap(
      (key) =>
        values(params, key).map((slug) => ({
          key,
          slug,
          label: `${key.startsWith("exclude") ? "−" : "+"} ${
            [...genres, ...tags].find((item) => item.slug === slug)?.name ??
            slug
          }`,
        })),
    ),
  ];

  const totalActiveCount =
    active.length +
    (params.get("status") ? 1 : 0) +
    (params.get("country") ? 1 : 0) +
    (params.get("rated") === "1" ? 1 : 0) +
    (["score", "chapters"].includes(params.get("sort") ?? "") ? 1 : 0);

  return (
    <aside className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-[#16171c]">
      {/* Mobile Collapsible Header */}
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex flex-1 items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {totalActiveCount > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {totalActiveCount} active
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/novels")}
            className="ml-3 flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Desktop Persistent Header */}
      <div className="hidden lg:flex items-center justify-between border-b border-neutral-100 pb-2.5 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/novels")}
            className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      <div
        className={
          isExpanded
            ? "space-y-4 pt-3 border-t border-neutral-100 mt-3 lg:border-t-0 lg:mt-0 lg:pt-3"
            : "hidden lg:block space-y-4 lg:pt-3"
        }
      >
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <span className="mb-1 block">Status</span>
          <select
            value={params.get("status") ?? ""}
            onChange={(e) => update("status", e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <span className="mb-1 block">Country</span>
          <select
            value={params.get("country") ?? ""}
            onChange={(e) => update("country", e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="">All Origins</option>
            {COUNTRIES.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <span className="mb-1 block">Sort Order</span>
          <select
            value={params.get("sort") ?? "latest"}
            onChange={(e) => update("sort", e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="latest">Recently Added</option>
            <option value="score">Highest Rated (Score)</option>
            <option value="chapters">Most Chapters</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <input
            type="checkbox"
            checked={params.get("rated") === "1"}
            onChange={(e) => update("rated", e.target.checked ? "1" : "")}
            className="accent-emerald-600"
          />
          Rated only
        </label>
        <FilterChips
          title="Include genres"
          items={genres}
          selected={values(params, "genres")}
          onChange={(v) => updateList("genres", v)}
        />
        <FilterChips
          title="Exclude genres"
          items={genres}
          selected={values(params, "excludeGenres")}
          onChange={(v) => updateList("excludeGenres", v)}
        />
        <FilterChips
          title="Include tags"
          items={tags}
          selected={values(params, "tags")}
          onChange={(v) => updateList("tags", v)}
        />
        <FilterChips
          title="Exclude tags"
          items={tags}
          selected={values(params, "excludeTags")}
          onChange={(v) => updateList("excludeTags", v)}
        />
        {active.length > 0 && (
          <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Active
            </span>
            <div className="flex flex-wrap gap-1.5">
              {active.map(({ key, slug, label }) => (
                <button
                  key={`${key}-${slug}`}
                  type="button"
                  onClick={() =>
                    updateList(
                      key,
                      values(params, key).filter((value) => value !== slug),
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {label}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
