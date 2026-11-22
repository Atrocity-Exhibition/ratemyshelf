"use client";

import { trpc } from "@/trpc/client";

type FlaggedReview = {
  id: string;
  abuseScore: number;
  body: string | null;
  user: { username: string };
  novel: { slug: string; title: string };
};

export function FlaggedReviews({
  initialData,
}: {
  initialData: {
    items: FlaggedReview[];
    total: number;
    page: number;
    totalPages: number;
  };
}) {
  const utils = trpc.useUtils();
  const { data } = trpc.moderation.flaggedReviews.useQuery(
    { page: 1, limit: 20 },
    { initialData: initialData as never },
  );

  const override = trpc.moderation.overrideAbuseScore.useMutation({
    onSuccess: () => {
      void utils.moderation.flaggedReviews.invalidate();
    },
  });

  if (!data || data.items.length === 0) {
    return <p className="text-sm text-slate-500">No flagged reviews.</p>;
  }

  return (
    <ul className="space-y-3">
      {data.items.map((review) => (
        <li
          key={review.id}
          className="space-y-2 rounded border border-slate-800 p-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span>
              {review.user.username} on{" "}
              <a href={`/novels/${review.novel.slug}`}>{review.novel.title}</a>
            </span>
            <span className="text-amber-400">
              abuse {review.abuseScore.toFixed(2)}
            </span>
          </div>
          {review.body && (
            <p className="line-clamp-3 text-sm text-slate-400">{review.body}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                override.mutate({
                  reviewId: review.id,
                  abuseScore: 0,
                  status: "VISIBLE",
                })
              }
              className="rounded border border-emerald-700 px-2 py-1 text-xs text-emerald-300"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() =>
                override.mutate({
                  reviewId: review.id,
                  abuseScore: 1,
                  status: "HIDDEN_BY_MOD",
                })
              }
              className="rounded border border-red-700 px-2 py-1 text-xs text-red-300"
            >
              Hide
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
