import Image from "next/image";
import Link from "next/link";
import type { NovelCardData } from "@/types/catalog";

const STATUS_LABEL: Record<string, string> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  HIATUS: "Hiatus",
  DROPPED: "Dropped",
};

export function NovelCard({ novel }: { novel: NovelCardData }) {
  const score = novel.scoreCache?.bayesianScore;

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 transition hover:border-slate-600">
      <Link href={`/novels/${novel.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-slate-800">
          {novel.coverImageUrl ? (
            <Image
              src={novel.coverImageUrl}
              alt={`${novel.title} cover`}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-500">
              {novel.title}
            </div>
          )}
          <span className="absolute left-2 top-2 rounded bg-slate-950/80 px-2 py-0.5 text-xs">
            {novel.countryOfOrigin}
          </span>
        </div>
      </Link>
      <div className="space-y-2 p-3">
        <Link href={`/novels/${novel.slug}`} className="line-clamp-2 font-medium text-slate-100">
          {novel.title}
        </Link>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{STATUS_LABEL[novel.status] ?? novel.status}</span>
          <span>{novel.chapterCount} ch.</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-400">
            {score ? `★ ${score.toFixed(2)}` : "Unrated"}
          </span>
          <span className="text-slate-500">
            {novel.scoreCache?.reviewCount ?? 0} reviews
          </span>
        </div>
        {novel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {novel.tags.slice(0, 3).map(({ tag }) => (
              <Link
                key={tag.slug}
                href={`/novels?tags=${tag.slug}`}
                className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
