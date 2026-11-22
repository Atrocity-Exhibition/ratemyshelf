import type { ReactNode } from "react";

export function getScoreColor(
  score: number | null | undefined,
  scale: 10 | 100 = 10,
): {
  bg: string;
  text: string;
  border: string;
  solidBg: string;
} {
  if (score == null || !Number.isFinite(score)) {
    return {
      bg: "bg-neutral-100 dark:bg-neutral-800/60",
      text: "text-neutral-500 dark:text-neutral-400",
      border: "border-neutral-200 dark:border-neutral-700",
      solidBg: "bg-neutral-500",
    };
  }

  const normalized = (score / scale) * 10;

  if (normalized >= 7.0) {
    // High / Universal Acclaim (AOTY Green)
    return {
      bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-500/30",
      solidBg: "bg-emerald-600 dark:bg-emerald-500",
    };
  }

  if (normalized >= 5.0) {
    // Mixed (AOTY Yellow/Amber)
    return {
      bg: "bg-amber-500/15 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-500/30",
      solidBg: "bg-amber-600 dark:bg-amber-500",
    };
  }

  // Low (AOTY Red)
  return {
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/30",
    solidBg: "bg-rose-600 dark:bg-rose-500",
  };
}

export function ScoreBadge({
  score,
  label = "SCORE",
  size = "md",
  scale = 10,
}: {
  score: number | null | undefined;
  label?: string;
  size?: "sm" | "md" | "lg";
  scale?: 10 | 100;
}) {
  const colors = getScoreColor(score, scale);
  const displayScore =
    score != null && Number.isFinite(score)
      ? scale === 100
        ? Math.round(score)
        : score.toFixed(1)
      : "—";

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold font-mono px-1.5 py-0.5 rounded text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
      >
        {displayScore}
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border px-4 py-2.5 min-w-[76px] ${colors.bg} ${colors.border}`}
      >
        <span
          className={`text-3xl font-extrabold font-mono leading-none tracking-tight ${colors.text}`}
        >
          {displayScore}
        </span>
        {label && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 ${colors.bg} ${colors.border}`}
    >
      <span
        className={`font-mono font-bold text-sm leading-none ${colors.text}`}
      >
        {displayScore}
      </span>
      {label && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
      )}
    </div>
  );
}
