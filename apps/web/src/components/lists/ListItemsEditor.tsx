"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/trpc/client";

type ListItem = {
  novelId: string;
  position: number;
  novel: { slug: string; title: string; chapterCount: number };
};

export function ListItemsEditor({
  listId,
  items,
}: {
  listId: string;
  items: ListItem[];
}) {
  const utils = trpc.useUtils();
  const [ordered, setOrdered] = useState(items);
  const reorder = trpc.lists.reorder.useMutation({
    onSuccess: () => utils.lists.byId.invalidate({ id: listId }),
  });
  const remove = trpc.lists.removeNovel.useMutation({
    onSuccess: () => utils.lists.byId.invalidate({ id: listId }),
  });

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];
    setOrdered(next);
    reorder.mutate({
      listId,
      orderedNovelIds: next.map((item) => item.novelId),
    });
  };

  return (
    <ol className="space-y-2">
      {ordered.map((item, index) => (
        <li
          key={item.novelId}
          className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition hover:border-slate-700/80"
        >
          <span className="w-6 text-right text-sm text-slate-500">{index + 1}.</span>
          <Link href={`/novels/${item.novel.slug}`} className="flex-1 font-medium text-neutral-900 transition-colors hover:underline dark:text-neutral-100">
            {item.novel.title}
          </Link>
          <span className="text-xs text-slate-500">{item.novel.chapterCount} ch.</span>
          <button
            type="button"
            onClick={() => move(index, -1)}
            disabled={index === 0 || reorder.isPending}
            className="rounded-md border border-slate-700/80 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(index, 1)}
            disabled={index === ordered.length - 1 || reorder.isPending}
            className="rounded-md border border-slate-700/80 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove.mutate({ listId, novelId: item.novelId })}
            disabled={remove.isPending}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        </li>
      ))}
    </ol>
  );
}
