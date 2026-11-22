"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import type { ReviewData } from "@/types/catalog";
import { ScoreSlider } from "./ScoreSlider";
import { ScoreBadge } from "@/components/common/ScoreBadge";

const SCORES: { key: keyof ReviewData; label: string }[] = [
  { key: "scoreStory", label: "Story" },
  { key: "scoreCharacters", label: "Characters" },
  { key: "scoreWorldBuilding", label: "World" },
];

export function ReviewCard({
  review,
  novelId,
}: {
  review: ReviewData;
  novelId: string;
}) {
  const { data: session, status } = useSession();
  const utils = trpc.useUtils();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [editBody, setEditBody] = useState(review.body ?? "");
  const [editSpoiler, setEditSpoiler] = useState(review.containsSpoiler);
  const [editScores, setEditScores] = useState({
    story: review.scoreStory ?? 5,
    characters: review.scoreCharacters ?? 5,
    worldBuilding: review.scoreWorldBuilding ?? 5,
    overall: review.scoreOverall,
  });
  const [editDimensions, setEditDimensions] = useState({
    story: review.scoreStory !== null,
    characters: review.scoreCharacters !== null,
    worldBuilding: review.scoreWorldBuilding !== null,
  });

  const voteHelpful = trpc.reviews.voteHelpful.useMutation({
    onSuccess: () => utils.reviews.forNovel.invalidate({ novelId }),
    onError: (error) => setNotice(error.message),
  });

  const report = trpc.moderation.submitReport.useMutation({
    onSuccess: () => {
      setReporting(false);
      setReason("");
      setNotice("Report submitted. Moderators will review it.");
    },
    onError: (error) => setNotice(error.message),
  });

  const hide = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      setNotice("Review hidden.");
      void utils.reviews.forNovel.invalidate({ novelId });
    },
    onError: (error) => setNotice(error.message),
  });

  const update = trpc.reviews.update.useMutation({
    onSuccess: () => {
      setEditing(false);
      setNotice("Review updated.");
      void utils.reviews.forNovel.invalidate({ novelId });
    },
    onError: (error) => setNotice(error.message),
  });

  const signedIn = status === "authenticated";
  const isAuthor = signedIn && session?.user.id === review.userId;
  const isMod =
    signedIn &&
    (session?.user.role === "MODERATOR" || session?.user.role === "ADMIN");

  return (
    <article className="space-y-3.5 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition dark:border-neutral-800 dark:bg-[#16171c]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScoreBadge score={review.scoreOverall} size="sm" scale={100} />
          <Link
            href={`/users/${review.user.username}`}
            className="text-xs font-bold text-neutral-900 transition hover:underline dark:text-neutral-100"
          >
            {review.user.username}
          </Link>
        </div>
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {SCORES.map(({ key, label }) => {
          const value = review[key];
          if (typeof value !== "number") return null;
          return (
            <span
              key={key}
              className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-400"
            >
              {label} {value}/10
            </span>
          );
        })}
        {review.status !== "VISIBLE" && (
          <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
            {review.status.replaceAll("_", " ").toLowerCase()}
          </span>
        )}
      </div>

      {review.body === null ? null : review.containsSpoiler &&
        !showSpoiler &&
        review.body !== "[SPOILER HIDDEN]" ? (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          <span>This review contains spoilers.</span>
          <button
            type="button"
            onClick={() => setShowSpoiler(true)}
            className="font-semibold underline hover:no-underline"
          >
            Reveal spoiler
          </button>
        </div>
      ) : review.body === "[SPOILER HIDDEN]" ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          Spoiler review hidden server-side.
        </p>
      ) : review.body !== null ? (
        <div className="space-y-2">
          {review.containsSpoiler && (
            <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400">
              <span>(Spoiler visible)</span>
              <button
                type="button"
                onClick={() => setShowSpoiler(false)}
                className="hover:underline"
              >
                Hide spoiler
              </button>
            </div>
          )}
          <div
            className="prose max-w-none text-xs leading-relaxed text-neutral-700 dark:prose-invert dark:text-neutral-300"
            dangerouslySetInnerHTML={{ __html: review.body }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800/80 dark:text-neutral-400">
        <button
          type="button"
          disabled={!signedIn || voteHelpful.isPending}
          onClick={() => voteHelpful.mutate({ reviewId: review.id, vote: 1 })}
          className="rounded border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
          title={signedIn ? "Mark this review helpful" : "Sign in to vote"}
        >
          Helpful ({review.helpfulVotes})
        </button>

        {signedIn && !isAuthor && (
          <button
            type="button"
            onClick={() => setReporting((value) => !value)}
            className="text-[11px] hover:text-neutral-900 dark:hover:text-white"
          >
            Report
          </button>
        )}

        {isAuthor && (
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="text-[11px] hover:text-neutral-900 dark:hover:text-white"
          >
            {editing ? "Cancel edit" : "Edit"}
          </button>
        )}

        {(isAuthor || isMod) && (
          <button
            type="button"
            disabled={hide.isPending}
            onClick={() => {
              if (window.confirm("Hide this review?")) {
                hide.mutate({ id: review.id });
              }
            }}
            className="text-[11px] text-rose-600 hover:underline disabled:opacity-40 dark:text-rose-400"
          >
            {isMod && !isAuthor ? "Hide (mod)" : "Delete"}
          </button>
        )}

        {notice && (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            {notice}
          </span>
        )}
      </div>

      {editing && isAuthor && (
        <form
          className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate({
              id: review.id,
              body: editBody.trim() || null,
              containsSpoiler: editBody.trim() ? editSpoiler : false,
              scoreStory: editDimensions.story ? editScores.story : null,
              scoreCharacters: editDimensions.characters
                ? editScores.characters
                : null,
              scoreWorldBuilding: editDimensions.worldBuilding
                ? editScores.worldBuilding
                : null,
              scoreOverall: editScores.overall,
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {(["story", "characters", "worldBuilding"] as const).map((key) => (
              <div key={key} className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={editDimensions[key]}
                    onChange={(event) =>
                      setEditDimensions((prev) => ({
                        ...prev,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                  Include {key === "worldBuilding" ? "world building" : key}
                </label>
                {editDimensions[key] && (
                  <ScoreSlider
                    label={key}
                    value={editScores[key]}
                    onChange={(value) =>
                      setEditScores((prev) => ({ ...prev, [key]: value }))
                    }
                  />
                )}
              </div>
            ))}
            <ScoreSlider
              label="Overall"
              value={editScores.overall}
              min={0}
              max={100}
              onChange={(value) =>
                setEditScores((prev) => ({ ...prev, overall: value }))
              }
            />
          </div>

          <textarea
            rows={5}
            value={editBody}
            onChange={(event) => setEditBody(event.target.value)}
            className="w-full rounded border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={editSpoiler}
                onChange={(event) => setEditSpoiler(event.target.checked)}
              />
              Contains spoilers
            </label>

            <button
              type="submit"
              disabled={update.isPending}
              className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Save review
            </button>
          </div>
        </form>
      )}

      {reporting && (
        <form
          className="space-y-2 border-t border-neutral-100 pt-3 dark:border-neutral-800"
          onSubmit={(event) => {
            event.preventDefault();
            if (reason.trim().length < 5) return;
            report.mutate({
              targetType: "REVIEW",
              targetId: review.id,
              reason: reason.trim(),
            });
          }}
        >
          <input
            type="text"
            required
            minLength={5}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for reporting this review…"
            className="w-full rounded border border-neutral-300 bg-white p-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <button
            type="submit"
            disabled={report.isPending || reason.trim().length < 5}
            className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
          >
            Submit report
          </button>
        </form>
      )}
    </article>
  );
}
