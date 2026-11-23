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
      bg: "bg-transparent",
      text: "text-neutral-500 dark:text-neutral-400",
      border: "border-neutral-200 dark:border-neutral-700",
      solidBg: "bg-neutral-500",
    };
  }

  const normalized = (score / scale) * 10;

  if (normalized >= 7.0) {
    // High / Universal Acclaim (AOTY Green)
    return {
      bg: "bg-transparent",
      text: "text-[#0eb23a]",
      border: "border-[#0eb23a]",
      solidBg: "bg-[#0eb23a]",
    };
  }

  if (normalized >= 5.0) {
    // Mixed (AOTY Yellow/Amber)
    return {
      bg: "bg-transparent",
      text: "text-[#d66d11]",
      border: "border-[#d66d11]",
      solidBg: "bg-[#d66d11]",
    };
  }

  // Low (AOTY Red)
  return {
    bg: "bg-transparent",
    text: "text-[#db3604]",
    border: "border-[#db3604]",
    solidBg: "bg-[#db3604]",
  };
}

function scoreLabel(
  score: number | null | undefined,
  displayScore: string,
  scale: 10 | 100,
) {
  return score != null && Number.isFinite(score)
    ? `Score ${displayScore} out of ${scale}`
    : "Not rated yet";
}

export function ScoreBadge({
  score,
  label = "SCORE",
  size = "md",
  scale = 10,
  overlay = false,
}: {
  score: number | null | undefined;
  label?: string;
  size?: "sm" | "md" | "lg";
  scale?: 10 | 100;
  /** Dark translucent backing for use on top of cover images. */
  overlay?: boolean;
}) {
  const colors = getScoreColor(score, scale);
  const displayScore: string =
    score != null && Number.isFinite(score)
      ? scale === 100
        ? String(Math.round(score))
        : score.toFixed(1)
      : "—";
  const surface = overlay ? "bg-black/55 backdrop-blur-sm" : colors.bg;
  const accessibleLabel = scoreLabel(score, displayScore, scale);

  if (size === "sm") {
    return (
      <span
        role="img"
        aria-label={accessibleLabel}
        title={accessibleLabel}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 font-sans text-xs font-bold ${surface} ${colors.text} ${colors.border}`}
      >
        {displayScore}
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div className="flex min-w-[84px] flex-col items-center justify-center">
        <span
          role="img"
          aria-label={accessibleLabel}
          title={accessibleLabel}
          className={`flex h-[84px] w-[84px] items-center justify-center rounded-full border-[3px] font-sans text-3xl font-extrabold leading-none tracking-tight ${surface} ${colors.text} ${colors.border}`}
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
    <div className="inline-flex items-center gap-1.5">
      <span
        role="img"
        aria-label={accessibleLabel}
        title={accessibleLabel}
        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-sans text-sm font-bold leading-none ${surface} ${colors.text} ${colors.border}`}
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
