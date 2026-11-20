"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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

  return (
    <aside className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-xs">
      <h2 className="font-semibold text-slate-200">Filters</h2>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">Status</span>
        <select
          value={params.get("status") ?? ""}
          onChange={(event) => update("status", event.target.value)}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-slate-200"
        >
          <option value="">Any</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">Country</span>
        <select
          value={params.get("country") ?? ""}
          onChange={(event) => update("country", event.target.value)}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-slate-200"
        >
          <option value="">Any</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">Sort</span>
        <select
          value={params.get("sort") ?? "latest"}
          onChange={(event) => update("sort", event.target.value)}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-slate-200"
        >
          <option value="latest">Latest</option>
          <option value="score">Highest rated</option>
          <option value="chapters">Most chapters</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">Tag slug</span>
        <input
          defaultValue={params.get("tags") ?? ""}
          onBlur={(event) => update("tags", event.target.value.trim())}
          placeholder="e.g. cultivation"
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-slate-200"
        />
      </label>
    </aside>
  );
}
