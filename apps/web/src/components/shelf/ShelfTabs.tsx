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
    <li className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <Link
            href={`/novels/${item.novel.slug}`}
            className="font-medium text-slate-100 hover:text-sky-400"
          >
            {item.novel.title}
          </Link>
          <div className="text-xs text-slate-500">
            {totalChapters > 0 ? `${totalChapters} chapters total` : "Chapter count ongoing"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select
            value={item.status}
            onChange={(e) =>
              setStatus.mutate({
                novelId: item.novel.id,
                status: e.target.value as (typeof STATUSES)[number],
              })
            }
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {LABELS[status]}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Ch.</span>
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
              className="w-16 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={handleIncrement}
              title="Read next chapter"
              className="rounded border border-slate-700 px-2 py-1 text-xs hover:border-slate-500"
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
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        </div>
      </div>

      {totalChapters > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Progress: {percentage}%</span>
            <span>
              {chapter} / {totalChapters} chapters
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded bg-slate-800">
            <div
              className="h-full rounded bg-sky-500 transition-all duration-300"
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
              className={`rounded px-3 py-1.5 text-sm ${
                active === status
                  ? "bg-sky-500 font-medium text-slate-950"
                  : "border border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {LABELS[status]} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
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
