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
        className="rounded border border-slate-700 px-3 py-1.5 text-sm hover:border-slate-500"
      >
        Add to list
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 space-y-2 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl">
          {!lists || lists.length === 0 ? (
            <p className="text-sm text-slate-500">
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
                    className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-slate-800 disabled:opacity-40"
                  >
                    {list.title}
                    <span className="ml-1 text-xs text-slate-500">
                      ({list._count.items})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {notice && <p className="text-xs text-slate-400">{notice}</p>}
        </div>
      )}
    </div>
  );
}
