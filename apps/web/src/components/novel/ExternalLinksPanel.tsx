import type { NovelDetailData } from "@/types/catalog";

export function ExternalLinksPanel({ novel }: { novel: NovelDetailData }) {
  if (novel.externalLinks.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">Read elsewhere</h2>
      <ul className="flex flex-wrap gap-2">
        {novel.externalLinks.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded border border-slate-700 px-3 py-1.5 text-sm hover:border-slate-500"
            >
              {link.source}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
