"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/trpc/client";

const LABELS = {
  READING: "Reading",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  DROPPED: "Dropped",
  PLAN_TO_READ: "Plan to read",
} as const;

type ShelfStatus = keyof typeof LABELS;

export function AddToShelfButton({
  novelId,
  compact = false,
}: {
  novelId: string;
  compact?: boolean;
}) {
  const { status } = useSession();
  const utils = trpc.useUtils();
  const { data: shelf } = trpc.shelves.myShelf.useQuery(undefined, {
    enabled: status === "authenticated",
  });
  const currentItem = shelf?.find((item) => item.novel.id === novelId);

  const setStatus = trpc.shelves.setStatus.useMutation({
    onSuccess: () => {
      void utils.shelves.myShelf.invalidate();
    },
  });

  if (status !== "authenticated") {
    if (compact) return null;
    return (
      <Link href="/login" className="text-sm text-sky-400 hover:underline">
        Sign in to add this novel to a shelf
      </Link>
    );
  }

  if (compact) {
    return (
      <select
        value={currentItem?.status ?? ""}
        disabled={setStatus.isPending}
        onChange={(event) => {
          if (!event.target.value) return;
          setStatus.mutate({
            novelId,
            status: event.target.value as ShelfStatus,
          });
        }}
        onClick={(e) => e.stopPropagation()}
        className="rounded border border-slate-700 bg-slate-900/90 px-1.5 py-0.5 text-[11px] text-slate-300 hover:border-slate-500"
      >
        <option value="" disabled>
          + Shelf
        </option>
        {Object.entries(LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">Shelf</span>
      <select
        value={currentItem?.status ?? ""}
        disabled={setStatus.isPending}
        onChange={(event) => {
          if (!event.target.value) return;
          setStatus.mutate({
            novelId,
            status: event.target.value as ShelfStatus,
          });
        }}
        className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm"
      >
        <option value="" disabled>
          Add to shelf…
        </option>
        {Object.entries(LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
