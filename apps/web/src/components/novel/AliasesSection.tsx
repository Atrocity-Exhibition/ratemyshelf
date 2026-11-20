import type { NovelDetailData } from "@/types/catalog";

export function AliasesSection({ novel }: { novel: NovelDetailData }) {
  if (novel.aliases.length === 0) return null;

  return (
    <details className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 transition">
      <summary className="cursor-pointer font-semibold text-slate-200 hover:text-white">
        Known aliases ({novel.aliases.length})
      </summary>
      <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
        {novel.aliases.map((alias) => (
          <li key={alias.id}>{alias.alias}</li>
        ))}
      </ul>
    </details>
  );
}
