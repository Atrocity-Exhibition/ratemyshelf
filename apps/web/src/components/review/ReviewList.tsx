"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import type { ReviewData } from "@/types/catalog";
import { ReviewCard } from "./ReviewCard";

type ReviewPage = {
  items: ReviewData[];
  total: number;
  page: number;
  totalPages: number;
};

const SORTS = {
  helpful: "Most helpful",
  recent: "Most recent",
  score: "Highest score",
} as const;

export function ReviewList({
  novelId,
  initialData,
}: {
  novelId: string;
  initialData: ReviewPage;
}) {
  const [sort, setSort] = useState<keyof typeof SORTS>("helpful");
  const [page, setPage] = useState(1);

  const { data, isFetching } = trpc.reviews.forNovel.useQuery(
    { novelId, page, limit: 10, sort },
    {
      // The server-rendered first page is only valid for the default view.
      initialData: page === 1 && sort === "helpful" ? (initialData as never) : undefined,
    },
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Sort
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as keyof typeof SORTS);
              setPage(1);
            }}
            className="rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-slate-200"
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {isFetching && <span className="text-xs text-slate-500">Loading…</span>}
      </div>

      {!data || data.items.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <>
          {data.items.map((review) => (
            <ReviewCard
              key={review.id}
              review={review as ReviewData}
              novelId={novelId}
            />
          ))}

          {data.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-3 text-sm pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg border border-slate-700/80 bg-slate-800/40 px-3 py-1.5 font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-slate-500">
                Page {data.page} of {data.totalPages} · {data.total} reviews
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg border border-slate-700/80 bg-slate-800/40 px-3 py-1.5 font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
