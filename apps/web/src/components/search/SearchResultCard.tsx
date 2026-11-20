import Link from "next/link";
import type { SearchHit } from "@/types/catalog";

export function SearchResultCard({ hit }: { hit: SearchHit }) {
  return (
    <article className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/60">
      <Link href={`/novels/${hit.slug}`} className="font-medium text-neutral-900 transition-colors hover:underline dark:text-neutral-100">
        {hit.title}
      </Link>
      {hit.originalTitle && (
        <p className="text-sm text-slate-500">{hit.originalTitle}</p>
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="rounded-md border border-slate-700/50 bg-slate-800/60 px-1.5 py-0.5">{hit.status}</span>
        <span className="rounded-md border border-slate-700/50 bg-slate-800/60 px-1.5 py-0.5">{hit.countryOfOrigin}</span>
        <span>{hit.chapterCount} ch.</span>
        {typeof hit.bayesianScore === "number" && (
          <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 font-semibold text-amber-300 border border-amber-400/20">
            ★ {hit.bayesianScore.toFixed(2)}
          </span>
        )}
      </div>
    </article>
  );
}
