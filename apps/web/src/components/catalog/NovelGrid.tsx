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
      <p className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-slate-500">
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
