import Image from "next/image";
import Link from "next/link";
import type { NovelCardData } from "@/types/catalog";
import { AddToShelfButton } from "@/components/shelf/AddToShelfButton";

const STATUS_LABEL: Record<string, string> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  HIATUS: "Hiatus",
  DROPPED: "Dropped",
};

export function NovelCard({ novel }: { novel: NovelCardData }) {
  const score = novel.scoreCache?.bayesianScore;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.6),0_0_15px_-3px_rgba(56,189,248,0.12)]">
      <div>
        <Link href={`/novels/${novel.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-slate-800/60">
            {novel.coverImageUrl ? (
              <Image
                src={novel.coverImageUrl}
                alt={`${novel.title} cover`}
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-500">
                {novel.title}
              </div>
            )}
            <span className="absolute left-2.5 top-2.5 rounded-md border border-white/10 bg-slate-950/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-200 shadow-sm backdrop-blur-sm">
              {novel.countryOfOrigin}
            </span>
          </div>
        </Link>
        <div className="space-y-2 p-3.5">
          <Link
            href={`/novels/${novel.slug}`}
            className="line-clamp-2 font-medium text-slate-100 transition-colors group-hover:text-sky-300"
          >
            {novel.title}
          </Link>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{STATUS_LABEL[novel.status] ?? novel.status}</span>
            <span>{novel.chapterCount} ch.</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            {score ? (
              <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 font-semibold text-amber-300 border border-amber-400/20">
                ★ {score.toFixed(2)}
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Unrated</span>
            )}
            <span className="text-slate-500">
              {novel.scoreCache?.reviewCount ?? 0} reviews
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 border-t border-slate-800/80 bg-slate-950/30 px-3 py-2.5">
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {novel.tags.slice(0, 2).map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/novels?tags=${tag.slug}`}
              className="rounded-md border border-slate-700/50 bg-slate-800/60 px-1.5 py-0.5 text-[11px] text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <AddToShelfButton novelId={novel.id} compact />
      </div>
    </article>
  );
}
