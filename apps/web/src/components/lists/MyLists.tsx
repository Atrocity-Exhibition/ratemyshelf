"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/trpc/client";

type ListSummary = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  _count: { items: number };
};

export function MyLists({ initialLists }: { initialLists: ListSummary[] }) {
  const [title, setTitle] = useState("");
  const utils = trpc.useUtils();
  const create = trpc.lists.create.useMutation({
    onSuccess: () => {
      setTitle("");
      void utils.lists.myLists.invalidate();
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Custom lists</h2>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          create.mutate({ title: title.trim() });
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New list name"
          className="flex-1 rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-slate-100"
        />
        <button
          type="submit"
          disabled={create.isPending || !title.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          Create
        </button>
      </form>

      {initialLists.length === 0 ? (
        <p className="text-sm text-slate-500">No custom lists yet.</p>
      ) : (
        <ul className="space-y-2">
          {initialLists.map((list) => (
            <li
              key={list.id}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition hover:border-slate-700/80"
            >
              <div>
                <Link href={`/lists/${list.id}`} className="font-medium text-slate-100 transition-colors hover:underline">
                  {list.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {list._count.items} novels · {list.isPublic ? "public" : "private"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
