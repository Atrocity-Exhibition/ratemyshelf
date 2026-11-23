import Image from "next/image";
import type { NovelDetailData } from "@/types/catalog";

const STATUS_LABEL: Record<string, string> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  HIATUS: "Hiatus",
  DROPPED: "Dropped",
};

export function NovelHeader({ novel }: { novel: NovelDetailData }) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row">
      <div className="relative aspect-[3/4] w-full max-w-[200px] shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-md dark:border-neutral-800 dark:bg-neutral-800">
        {novel.coverImageUrl ? (
          <Image
            src={novel.coverImageUrl}
            alt={`${novel.title} cover`}
            fill
            sizes="200px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {novel.title}
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
            {novel.title}
          </h1>
          {novel.author && (
            <p className="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              by {novel.author}
            </p>
          )}
          {novel.originalTitle && (
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {novel.originalTitle}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300">
            {STATUS_LABEL[novel.status] ?? novel.status}
          </span>
          <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300">
            {novel.countryOfOrigin}
          </span>
          <span className="rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300">
            {novel.chapterCount} chapters
          </span>
        </div>
        <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {novel.synopsis}
        </p>
      </div>
    </header>
  );
}
