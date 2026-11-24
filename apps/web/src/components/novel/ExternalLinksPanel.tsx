import type { NovelDetailData } from "@/types/catalog";

export function ExternalLinksPanel({ novel }: { novel: NovelDetailData }) {
  if (!novel.externalLinks || novel.externalLinks.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Official Links
      </h2>
      <ul className="flex flex-wrap gap-2">
        {novel.externalLinks.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
            >
              <span>{link.source}</span>
              <span className="text-[10px] text-neutral-400">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
