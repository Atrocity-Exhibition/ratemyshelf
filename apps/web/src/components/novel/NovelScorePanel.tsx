import type { NovelDetailData } from "@/types/catalog";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-slate-800">
        <div
          className="h-full rounded bg-sky-500"
          style={{ width: `${Math.min(100, (value / 10) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function NovelScorePanel({ novel }: { novel: NovelDetailData }) {
  const score = novel.scoreCache;
  if (!score || score.reviewCount === 0) {
    return (
      <section className="rounded-lg border border-slate-800 p-4 text-sm text-slate-500">
        No ratings yet. Be the first to review this novel.
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-amber-400">
          {score.bayesianScore.toFixed(2)}
        </span>
        <span className="text-sm text-slate-400">
          Bayesian score · {score.reviewCount} reviews
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreBar label="Story" value={score.avgStory} />
        <ScoreBar label="Characters" value={score.avgCharacters} />
        <ScoreBar label="World building" value={score.avgWorldBuilding} />
        <ScoreBar label="Overall" value={score.avgOverall} />
        {score.avgTranslation !== null && (
          <ScoreBar label="Translation" value={score.avgTranslation} />
        )}
      </div>
    </section>
  );
}
