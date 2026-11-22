import Link from "next/link";
import type { SearchHit } from "@/types/catalog";
import { ScoreBadge } from "@/components/common/ScoreBadge";

export function SearchResultCard({ hit }: { hit: SearchHit }) {
  return (
    <article className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition dark:border-neutral-800 dark:bg-[#16171c]">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/novels/${hit.slug}`}
          className="font-semibold text-neutral-900 transition hover:underline dark:text-neutral-100"
        >
          {hit.title}
        </Link>
        <ScoreBadge score={hit.bayesianScore} size="sm" scale={100} />
      </div>

      {hit.originalTitle && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {hit.originalTitle}
        </p>
      )}

      {hit.aliases && hit.aliases.length > 0 && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Also known as: {hit.aliases.slice(0, 3).join(", ")}
        </p>
      )}

      {hit.synopsis && (
        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
          {hit.synopsis}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
        <span className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-medium dark:border-neutral-700 dark:bg-neutral-800">
          {hit.status}
        </span>
        <span className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-medium dark:border-neutral-700 dark:bg-neutral-800">
          {hit.countryOfOrigin}
        </span>
        <span>{hit.chapterCount} chapters</span>
      </div>
    </article>
  );
}
