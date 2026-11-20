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
    <article className="group flex flex-col justify-between overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 transition hover:border-slate-600">
      <div>
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
            <span className="absolute left-2 top-2 rounded bg-slate-950/80 px-2 py-0.5 text-xs font-medium text-slate-200">
              {novel.countryOfOrigin}
            </span>
          </div>
        </Link>
        <div className="space-y-2 p-3">
          <Link
            href={`/novels/${novel.slug}`}
            className="line-clamp-2 font-medium text-slate-100 hover:text-sky-400"
          >
            {novel.title}
          </Link>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{STATUS_LABEL[novel.status] ?? novel.status}</span>
            <span>{novel.chapterCount} ch.</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-400 font-medium">
              {score ? `★ ${score.toFixed(2)}` : "Unrated"}
            </span>
            <span className="text-slate-500">
              {novel.scoreCache?.reviewCount ?? 0} reviews
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 border-t border-slate-800/80 px-3 py-2">
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {novel.tags.slice(0, 2).map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/novels?tags=${tag.slug}`}
              className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700"
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
