import Image from "next/image";
import Link from "next/link";
import type { NovelCardData } from "@/types/catalog";
import { AddToShelfButton } from "@/components/shelf/AddToShelfButton";
import { ScoreBadge } from "@/components/common/ScoreBadge";

const STATUS_LABEL: Record<string, string> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  HIATUS: "Hiatus",
  DROPPED: "Dropped",
};

export function NovelCard({ novel }: { novel: NovelCardData }) {
  const score = novel.scoreCache?.bayesianScore;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-md dark:border-neutral-800/90 dark:bg-[#16171c] dark:hover:border-neutral-600 dark:hover:shadow-xl">
      <div>
        <Link href={`/novels/${novel.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {novel.coverImageUrl ? (
              <Image
                src={novel.coverImageUrl}
                alt={`${novel.title} cover`}
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {novel.title}
              </div>
            )}
            <span className="absolute left-2.5 top-2.5 rounded border border-neutral-200/80 bg-white/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-800 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-neutral-950/85 dark:text-neutral-200">
              {novel.countryOfOrigin}
            </span>
          </div>
        </Link>

        <div className="space-y-2 p-3.5">
          <Link
            href={`/novels/${novel.slug}`}
            className="line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors hover:underline dark:text-neutral-100"
          >
            {novel.title}
          </Link>

          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>{STATUS_LABEL[novel.status] ?? novel.status}</span>
            <span>{novel.chapterCount} ch.</span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <ScoreBadge score={score} size="sm" />
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {novel.scoreCache?.reviewCount ?? 0} reviews
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 border-t border-neutral-100 bg-neutral-50/50 px-3 py-2 dark:border-neutral-800/80 dark:bg-[#121317]">
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {novel.tags.slice(0, 2).map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/novels?tags=${tag.slug}`}
              className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
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
