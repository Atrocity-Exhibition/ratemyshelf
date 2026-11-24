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
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(typeof window === "undefined" ? "/" : window.location.pathname + window.location.search)}`}
        className="inline-flex rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400"
      >
        Sign in to add to shelf
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
        className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 transition hover:border-neutral-400 cursor-pointer dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
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
    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
      <span>Shelf</span>
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
        className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 transition hover:border-neutral-400 cursor-pointer dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-500"
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
