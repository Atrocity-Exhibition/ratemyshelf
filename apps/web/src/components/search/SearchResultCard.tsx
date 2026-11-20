import Link from "next/link";
import type { SearchHit } from "@/types/catalog";

export function SearchResultCard({ hit }: { hit: SearchHit }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <Link href={`/novels/${hit.slug}`} className="font-medium text-slate-100">
        {hit.title}
      </Link>
      {hit.originalTitle && (
        <p className="text-sm text-slate-500">{hit.originalTitle}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
        <span>{hit.status}</span>
        <span>{hit.countryOfOrigin}</span>
        <span>{hit.chapterCount} ch.</span>
        {typeof hit.bayesianScore === "number" && (
          <span className="text-amber-400">★ {hit.bayesianScore.toFixed(2)}</span>
        )}
      </div>
    </article>
  );
}
