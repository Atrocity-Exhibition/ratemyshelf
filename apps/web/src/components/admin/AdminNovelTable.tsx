"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type AdminNovel = {
  id: string;
  slug: string;
  title: string;
  status: string;
  isHidden: boolean;
  chapterCount: number;
  updatedAt: string | Date;
};

export function AdminNovelTable({
  initialData,
}: {
  initialData: {
    items: AdminNovel[];
    total: number;
    page: number;
    totalPages: number;
  };
}) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);
  const utils = trpc.useUtils();

  const { data } = trpc.novels.adminList.useQuery(
    { page: 1, limit: 50, q: debounced || undefined },
    { initialData: initialData as never },
  );

  const setHidden = trpc.novels.setHidden.useMutation({
    onSuccess: () => utils.novels.adminList.invalidate(),
  });

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter by title…"
        className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto rounded border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ch.</th>
              <th className="px-3 py-2">Visibility</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((novel) => (
              <tr key={novel.id} className="border-t border-slate-800">
                <td className="px-3 py-2">
                  <Link href={`/novels/${novel.slug}`} className="font-medium">
                    {novel.title}
                  </Link>
                </td>
                <td className="px-3 py-2 text-slate-400">{novel.status}</td>
                <td className="px-3 py-2 text-slate-400">{novel.chapterCount}</td>
                <td className="px-3 py-2">
                  {novel.isHidden ? (
                    <span className="text-amber-400">Hidden</span>
                  ) : (
                    <span className="text-emerald-400">Visible</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    disabled={setHidden.isPending}
                    onClick={() =>
                      setHidden.mutate({ id: novel.id, isHidden: !novel.isHidden })
                    }
                    className="rounded border border-slate-700 px-2 py-1 text-xs hover:border-slate-500 disabled:opacity-40"
                  >
                    {novel.isHidden ? "Unhide" : "Hide"}
                  </button>
                </td>
              </tr>
            ))}
            {(data?.items ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  No novels match that filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">{data?.total ?? 0} novels total</p>
    </div>
  );
}
