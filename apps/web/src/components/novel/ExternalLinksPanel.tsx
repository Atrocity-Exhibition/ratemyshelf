import type { NovelDetailData } from "@/types/catalog";

export function ExternalLinksPanel({ novel }: { novel: NovelDetailData }) {
  if (novel.externalLinks.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-slate-200">Read elsewhere</h2>
      <ul className="flex flex-wrap gap-2">
        {novel.externalLinks.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            >
              {link.source} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
