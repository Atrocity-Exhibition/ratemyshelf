import type { NovelDetailData } from "@/types/catalog";
import { ScoreBadge, getScoreColor } from "@/components/common/ScoreBadge";

function ScoreBar({
  label,
  value,
  scale = 10,
}: {
  label: string;
  value: number;
  scale?: 10 | 100;
}) {
  const colors = getScoreColor(value);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className={`font-mono font-bold ${colors.text}`}>
          {value.toFixed(scale === 100 ? 0 : 1)}/{scale}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors.solidBg}`}
          style={{ width: `${Math.min(100, (value / scale) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function NovelScorePanel({ novel }: { novel: NovelDetailData }) {
  const score = novel.scoreCache;
  if (!score || score.reviewCount === 0) {
    return (
      <section className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-[#16171c] dark:text-neutral-400">
        No ratings yet. Be the first to review this novel.
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-[#16171c]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <ScoreBadge score={score.bayesianScore} size="lg" label="RMS SCORE" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Community Rating
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Based on {score.reviewCount} user{" "}
              {score.reviewCount === 1 ? "review" : "reviews"} · Bayesian
              weighted
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {score.avgStory !== null && (
          <ScoreBar label="Story" value={score.avgStory} />
        )}
        {score.avgCharacters !== null && (
          <ScoreBar label="Characters" value={score.avgCharacters} />
        )}
        {score.avgWorldBuilding !== null && (
          <ScoreBar label="World building" value={score.avgWorldBuilding} />
        )}
        <ScoreBar label="Overall" value={score.avgOverall} scale={100} />
      </div>
    </section>
  );
}
