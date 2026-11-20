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
      <div className="relative aspect-[3/4] w-full max-w-[200px] shrink-0 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-800/60 shadow-lg">
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{novel.title}</h1>
          {novel.originalTitle && (
            <p className="text-slate-400">{novel.originalTitle}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-md border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200">
            {STATUS_LABEL[novel.status] ?? novel.status}
          </span>
          <span className="rounded-md border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200">
            {novel.countryOfOrigin}
          </span>
          <span className="rounded-md border border-slate-700/60 bg-slate-800/70 px-2.5 py-1 text-xs font-medium text-slate-200">
            {novel.chapterCount} chapters
          </span>
        </div>
        <p className="max-w-3xl whitespace-pre-line text-slate-300 leading-relaxed">
          {novel.synopsis}
        </p>
      </div>
    </header>
  );
}
