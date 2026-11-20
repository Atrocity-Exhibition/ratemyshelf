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

export function AddToShelfButton({ novelId }: { novelId: string }) {
  const { status } = useSession();
  const utils = trpc.useUtils();
  const setStatus = trpc.shelves.setStatus.useMutation({
    onSuccess: () => {
      void utils.shelves.myShelf.invalidate();
    },
  });

  if (status !== "authenticated") {
    return (
      <Link href="/login" className="text-sm">
        Sign in to add this novel to a shelf
      </Link>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-400">Shelf</span>
      <select
        defaultValue=""
        disabled={setStatus.isPending}
        onChange={(event) => {
          if (!event.target.value) return;
          setStatus.mutate({
            novelId,
            status: event.target.value as ShelfStatus,
          });
        }}
        className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
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
