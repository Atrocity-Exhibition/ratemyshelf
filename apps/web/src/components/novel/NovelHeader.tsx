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
      <div className="relative aspect-[3/4] w-full max-w-[200px] shrink-0 overflow-hidden rounded-lg bg-slate-800">
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
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-500">
            {novel.title}
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold">{novel.title}</h1>
          {novel.originalTitle && (
            <p className="text-slate-400">{novel.originalTitle}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded bg-slate-800 px-2 py-1">
            {STATUS_LABEL[novel.status] ?? novel.status}
          </span>
          <span className="rounded bg-slate-800 px-2 py-1">
            {novel.countryOfOrigin}
          </span>
          <span className="rounded bg-slate-800 px-2 py-1">
            {novel.chapterCount} chapters
          </span>
        </div>
        <p className="max-w-3xl whitespace-pre-line text-slate-300">
          {novel.synopsis}
        </p>
      </div>
    </header>
  );
}
