"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";

export function AddToListButton({ novelId }: { novelId: string }) {
  const { status } = useSession();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: lists } = trpc.lists.myLists.useQuery(undefined, {
    enabled: status === "authenticated" && open,
  });

  const add = trpc.lists.addNovel.useMutation({
    onSuccess: () => {
      setNotice("Added to list.");
      void utils.lists.myLists.invalidate();
    },
    onError: (error) => setNotice(error.message),
  });

  if (status !== "authenticated") return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-700"
      >
        + Add to list
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 space-y-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-[#16171c]">
          {!lists || lists.length === 0 ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              No lists yet. Create one from your dashboard.
            </p>
          ) : (
            <ul className="space-y-1">
              {lists.map((list) => (
                <li key={list.id}>
                  <button
                    type="button"
                    disabled={add.isPending}
                    onClick={() => add.mutate({ listId: list.id, novelId })}
                    className="w-full rounded px-2 py-1.5 text-left text-xs text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    {list.title}
                    <span className="ml-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                      ({list._count.items})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {notice && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {notice}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
