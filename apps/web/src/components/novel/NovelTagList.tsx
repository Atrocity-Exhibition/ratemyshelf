import Link from "next/link";
import type { NovelDetailData } from "@/types/catalog";

export function NovelTagList({ novel }: { novel: NovelDetailData }) {
  const hasGenres = novel.genres && novel.genres.length > 0;
  const hasTags = novel.tags && novel.tags.length > 0;

  if (!hasGenres && !hasTags) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Genres & Tags
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {hasGenres &&
          novel.genres.map((genre) => (
            <Link
              key={genre.slug}
              href={`/novels?genres=${genre.slug}`}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:border-emerald-400 hover:text-emerald-950 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-600 dark:hover:text-emerald-100"
            >
              {genre.name}
            </Link>
          ))}
        {hasTags &&
          novel.tags.map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/novels?tags=${tag.slug}`}
              className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-xs transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
            >
              {tag.name}
            </Link>
          ))}
      </div>
    </section>
  );
}
