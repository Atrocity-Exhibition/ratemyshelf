import type { NovelDetailData } from "@/types/catalog";

export function AliasesSection({ novel }: { novel: NovelDetailData }) {
  if (novel.aliases.length === 0) return null;

  return (
    <details className="rounded-lg border border-slate-800 p-4">
      <summary className="cursor-pointer font-semibold">
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
