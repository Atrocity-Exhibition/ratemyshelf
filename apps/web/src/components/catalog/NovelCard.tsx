import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { NovelCardData } from "@/types/catalog";
import { AddToShelfButton } from "@/components/shelf/AddToShelfButton";
import { ScoreBadge } from "@/components/common/ScoreBadge";

export const NOVEL_CARD_FOOTER_CLASS = "flex flex-col gap-1.5";
export const NOVEL_CARD_TAGS_CLASS =
  "flex min-w-0 flex-nowrap gap-1 overflow-x-auto whitespace-nowrap pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
export const NOVEL_CARD_SHELF_CLASS = "flex shrink-0 justify-end";

export function NovelCard({ novel }: { novel: NovelCardData }) {
  const score = novel.scoreCache?.bayesianScore;

  return (
    <article className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-xl dark:border-neutral-800/90 dark:bg-[#16171c]">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Link
          href={`/novels/${novel.slug}`}
          aria-label={`View ${novel.title}`}
          className="absolute inset-0"
        >
          {novel.coverImageUrl ? (
            <Image
              src={novel.coverImageUrl}
              alt={`${novel.title} cover`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-100 to-neutral-200 p-3 dark:from-neutral-800 dark:to-neutral-900">
              <ImageOff
                aria-hidden
                className="h-5 w-5 text-neutral-400 dark:text-neutral-500"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                No cover
              </span>
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-black/70 via-black/20 via-[20%] to-transparent" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
          <span className="rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/85 backdrop-blur-sm">
            {novel.countryOfOrigin}
          </span>
          <ScoreBadge score={score} size="sm" scale={100} overlay />
        </div>
      </div>

      <div className="space-y-2 p-3.5">
        <Link
          href={`/novels/${novel.slug}`}
          className="line-clamp-2 text-sm font-bold leading-tight text-neutral-900 transition-colors hover:underline dark:text-neutral-100"
        >
          {novel.title}
        </Link>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {novel.author ?? "Author unknown"}
        </p>
        <div className={NOVEL_CARD_FOOTER_CLASS}>
          <div className={NOVEL_CARD_TAGS_CLASS}>
            {novel.tags.slice(0, 3).map(({ tag }) => (
              <Link
                key={tag.slug}
                href={`/novels?tags=${tag.slug}`}
                className="shrink-0 whitespace-nowrap rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
              >
                {tag.name}
              </Link>
            ))}
          </div>
          <div className={NOVEL_CARD_SHELF_CLASS}>
            <AddToShelfButton novelId={novel.id} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
