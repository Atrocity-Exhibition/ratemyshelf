"use client";

import { trpc } from "@/trpc/client";

type Tag = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  isApproved: boolean;
};

export function TagApprovalQueue() {
  const utils = trpc.useUtils();
  const { data: tags } = trpc.tags.list.useQuery({ includeUnapproved: true });

  const approve = trpc.tags.approve.useMutation({
    onSuccess: () => {
      void utils.tags.list.invalidate();
    },
  });

  const pending = (tags ?? []).filter((tag) => !tag.isApproved) as Tag[];

  if (pending.length === 0) {
    return <p className="text-sm text-slate-500">No proposed tags pending.</p>;
  }

  return (
    <ul className="space-y-2">
      {pending.map((tag) => (
        <li
          key={tag.id}
          className="flex flex-wrap items-center gap-3 rounded border border-slate-800 p-3 text-sm"
        >
          <div className="flex-1">
            <span className="font-medium">{tag.name}</span>
            <span className="ml-2 text-xs text-slate-500">{tag.category}</span>
            {tag.description && (
              <p className="text-xs text-slate-400">{tag.description}</p>
            )}
          </div>
          <button
            type="button"
            disabled={approve.isPending}
            onClick={() => approve.mutate({ id: tag.id })}
            className="rounded border border-emerald-700 px-2 py-1 text-xs text-emerald-300 disabled:opacity-40"
          >
            Approve
          </button>
        </li>
      ))}
    </ul>
  );
}
