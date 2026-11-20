import Link from "next/link";
import type { NovelDetailData } from "@/types/catalog";

export function NovelTagList({ novel }: { novel: NovelDetailData }) {
  if (novel.tags.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Tags & Themes
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {novel.tags.map(({ tag }) => (
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
