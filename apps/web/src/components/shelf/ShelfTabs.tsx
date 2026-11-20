"use client";

import { useState } from "react";
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
  const remove = trpc.shelves.remove.useMutation({
    onSuccess: () => utils.shelves.myShelf.invalidate(),
  });

  return (
    <li className="flex flex-wrap items-center gap-3 rounded border border-slate-800 p-3">
      <a href={`/novels/${item.novel.slug}`} className="flex-1 font-medium">
        {item.novel.title}
      </a>
      <label className="flex items-center gap-2 text-sm text-slate-400">
        Chapter
        <input
          type="number"
          min={0}
          max={item.novel.chapterCount}
          value={chapter}
          onChange={(event) => setChapter(Number(event.target.value))}
          onBlur={() => {
            if (chapter !== item.lastChapter) {
              updateProgress.mutate({ novelId: item.novel.id, lastChapter: chapter });
            }
          }}
          className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1"
        />
      </label>
      <button
        type="button"
        onClick={() => remove.mutate({ novelId: item.novel.id })}
        className="text-sm text-red-400 hover:text-red-300"
      >
        Remove
      </button>
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
                  ? "bg-sky-500 text-slate-950"
                  : "border border-slate-700 hover:border-slate-500"
              }`}
            >
              {LABELS[status]} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded border border-dashed border-slate-800 p-6 text-sm text-slate-500">
          Nothing on this shelf yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => (
            <ShelfItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
