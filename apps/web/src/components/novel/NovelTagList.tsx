import Link from "next/link";
import type { NovelDetailData } from "@/types/catalog";

export function NovelTagList({ novel }: { novel: NovelDetailData }) {
  if (novel.tags.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-slate-200">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {novel.tags.map(({ tag }) => (
          <Link
            key={tag.slug}
            href={`/novels?tags=${tag.slug}`}
            className="rounded-md border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-sky-500/40 hover:bg-sky-950/30 hover:text-sky-300"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
