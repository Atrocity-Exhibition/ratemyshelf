import type { NovelCardData } from "@/types/catalog";
import { NovelCard } from "./NovelCard";

export function NovelGrid({
  novels,
  emptyMessage = "No novels found.",
}: {
  novels: NovelCardData[];
  emptyMessage?: string;
}) {
  if (novels.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {novels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  );
}
