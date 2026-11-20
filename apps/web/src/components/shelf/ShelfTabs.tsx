"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import type { ShelfItemData } from "@/types/catalog";

const STATUSES = ["READING", "COMPLETED", "ON_HOLD", "DROPPED", "PLAN_TO_READ"] as const;
const LABELS: Record<(typeof STATUSES)[number], string> = {
  READING: "Reading",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  DROPPED: "Dropped",
  PLAN_TO_READ: "Plan to read",
};

function ShelfItemRow({ item }: { item: ShelfItemData }) {
  const utils = trpc.useUtils();
  const [chapter, setChapter] = useState(item.lastChapter ?? 0);

  const updateProgress = trpc.shelves.updateProgress.useMutation({
    onSuccess: () => utils.shelves.myShelf.invalidate(),
  });
  const setStatus = trpc.shelves.setStatus.useMutation({
    onSuccess: () => utils.shelves.myShelf.invalidate(),
  });
  const remove = trpc.shelves.remove.useMutation({
    onSuccess: () => utils.shelves.myShelf.invalidate(),
  });

  const totalChapters = item.novel.chapterCount;
  const percentage =
    totalChapters > 0
      ? Math.min(100, Math.round((chapter / totalChapters) * 100))
      : 0;

  const handleIncrement = () => {
    const nextChapter = Math.min(totalChapters || 99999, chapter + 1);
    setChapter(nextChapter);
    updateProgress.mutate({ novelId: item.novel.id, lastChapter: nextChapter });
  };

  return (
    <li className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-[#16171c] dark:hover:border-neutral-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <Link
            href={`/novels/${item.novel.slug}`}
            className="text-sm font-semibold text-neutral-900 transition hover:underline dark:text-neutral-100"
          >
            {item.novel.title}
          </Link>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {totalChapters > 0 ? `${totalChapters} chapters total` : "Chapter count ongoing"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={item.status}
            onChange={(e) =>
              setStatus.mutate({
                novelId: item.novel.id,
                status: e.target.value as (typeof STATUSES)[number],
              })
            }
            className="rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {LABELS[status]}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Ch.</span>
            <input
              type="number"
              min={0}
              max={totalChapters || 99999}
              value={chapter}
              onChange={(event) => setChapter(Number(event.target.value))}
              onBlur={() => {
                if (chapter !== item.lastChapter) {
                  updateProgress.mutate({
                    novelId: item.novel.id,
                    lastChapter: chapter,
                  });
                }
              }}
              className="w-16 rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs font-mono font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            />
            <button
              type="button"
              onClick={handleIncrement}
              title="Read next chapter"
              className="rounded border border-neutral-300 bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              +1
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Remove this novel from your shelf?")) {
                remove.mutate({ novelId: item.novel.id });
              }
            }}
            className="text-xs text-rose-600 hover:underline dark:text-rose-400"
          >
            Remove
          </button>
        </div>
      </div>

      {totalChapters > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            <span>Progress: {percentage}%</span>
            <span>
              {chapter} / {totalChapters} chapters
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </li>
  );
}

export function ShelfTabs({ items }: { items: ShelfItemData[] }) {
  const [active, setActive] = useState<(typeof STATUSES)[number]>("READING");
  const visible = items.filter((item) => item.status === active);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => {
          const count = items.filter((item) => item.status === status).length;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setActive(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                active === status
                  ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                  : "border border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
              }`}
            >
              {LABELS[status]} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-[#16171c] dark:text-neutral-400">
          Nothing on this shelf yet. Browse the catalog to start tracking novels.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <ShelfItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
