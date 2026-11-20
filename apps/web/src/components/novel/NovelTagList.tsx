import Link from "next/link";
import type { NovelDetailData } from "@/types/catalog";

export function NovelTagList({ novel }: { novel: NovelDetailData }) {
  if (novel.tags.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {novel.tags.map(({ tag }) => (
          <Link
            key={tag.slug}
            href={`/novels?tags=${tag.slug}`}
            className="rounded bg-slate-800 px-2 py-1 text-sm text-slate-200 hover:bg-slate-700"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
