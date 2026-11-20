"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import type { ReviewData } from "@/types/catalog";
import { ScoreSlider } from "./ScoreSlider";

const SCORES: { key: keyof ReviewData; label: string }[] = [
  { key: "scoreStory", label: "Story" },
  { key: "scoreCharacters", label: "Characters" },
  { key: "scoreWorldBuilding", label: "World" },
  { key: "scoreOverall", label: "Overall" },
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
  const [editBody, setEditBody] = useState(review.body);
  const [editSpoiler, setEditSpoiler] = useState(review.containsSpoiler);
  const [editScores, setEditScores] = useState({
    story: review.scoreStory,
    characters: review.scoreCharacters,
    worldBuilding: review.scoreWorldBuilding,
    overall: review.scoreOverall,
    translation: review.scoreTranslation ?? 5,
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
    <article className="space-y-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 transition hover:border-slate-700/80">
      <div className="flex items-center justify-between text-sm">
        <Link
          href={`/users/${review.user.username}`}
          className="font-medium text-slate-200 transition-colors hover:text-sky-300"
        >
          {review.user.username}
        </Link>
        <span className="text-slate-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {SCORES.map(({ key, label }) => {
          const value = review[key];
          if (typeof value !== "number") return null;
          return (
            <span key={key} className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-slate-300">
              {label} {value}/10
            </span>
          );
        })}
        {typeof review.scoreTranslation === "number" && (
          <span className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-slate-300">
            Translation {review.scoreTranslation}/10
          </span>
        )}
        {review.status !== "VISIBLE" && (
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">
            {review.status.replaceAll("_", " ").toLowerCase()}
          </span>
        )}
      </div>

      {review.containsSpoiler ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-sm text-amber-300/90">
          Spoiler review hidden. Spoiler content is not sent to browsers that have
          not opted in.
        </p>
      ) : (
        <div
          className="prose prose-invert max-w-none text-sm text-slate-300"
          dangerouslySetInnerHTML={{ __html: review.body }}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <button
          type="button"
          disabled={!signedIn || voteHelpful.isPending}
          onClick={() => voteHelpful.mutate({ reviewId: review.id, vote: 1 })}
          className="rounded-md border border-slate-700/80 bg-slate-800/40 px-2.5 py-1 font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-colors"
          title={signedIn ? "Mark this review helpful" : "Sign in to vote"}
        >
          Helpful ({review.helpfulVotes})
        </button>

        {signedIn && !isAuthor && (
          <button
            type="button"
            onClick={() => setReporting((value) => !value)}
            className="hover:text-slate-300"
          >
            Report
          </button>
        )}

        {isAuthor && (
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="hover:text-slate-300"
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
            className="text-red-400 hover:text-red-300 disabled:opacity-40"
          >
            {isMod && !isAuthor ? "Hide (mod)" : "Delete"}
          </button>
        )}

        {notice && <span className="text-slate-400">{notice}</span>}
      </div>

      {editing && isAuthor && (
        <form
          className="space-y-3 rounded border border-slate-800 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (editBody.trim().length < 150) return;
            update.mutate({
              id: review.id,
              body: editBody,
              containsSpoiler: editSpoiler,
              scoreStory: editScores.story,
              scoreCharacters: editScores.characters,
              scoreWorldBuilding: editScores.worldBuilding,
              scoreOverall: editScores.overall,
              scoreTranslation:
                review.scoreTranslation != null ? editScores.translation : undefined,
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreSlider
              label="Story"
              value={editScores.story}
              onChange={(value) =>
                setEditScores((prev) => ({ ...prev, story: value }))
              }
            />
            <ScoreSlider
              label="Characters"
              value={editScores.characters}
              onChange={(value) =>
                setEditScores((prev) => ({ ...prev, characters: value }))
              }
            />
            <ScoreSlider
              label="World building"
              value={editScores.worldBuilding}
              onChange={(value) =>
                setEditScores((prev) => ({ ...prev, worldBuilding: value }))
              }
            />
            <ScoreSlider
              label="Overall"
              value={editScores.overall}
              onChange={(value) =>
                setEditScores((prev) => ({ ...prev, overall: value }))
              }
            />
            {review.scoreTranslation != null && (
              <ScoreSlider
                label="Translation"
                value={editScores.translation}
                onChange={(value) =>
                  setEditScores((prev) => ({ ...prev, translation: value }))
                }
              />
            )}
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-400">
              Review body ({editBody.trim().length}/150 minimum)
            </span>
            <textarea
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
              rows={6}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={editSpoiler}
              onChange={(event) => setEditSpoiler(event.target.checked)}
            />
            Contains spoilers
          </label>
          <button
            type="submit"
            disabled={editBody.trim().length < 150 || update.isPending}
            className="rounded bg-sky-500 px-3 py-1.5 text-xs font-medium text-slate-950 disabled:opacity-40"
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      {reporting && (
        <form
          className="space-y-2 rounded border border-slate-800 p-3"
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
          <label className="block text-sm">
            <span className="mb-1 block text-slate-400">
              Why are you reporting this review?
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              maxLength={500}
              className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={reason.trim().length < 5 || report.isPending}
              className="rounded bg-sky-500 px-3 py-1.5 text-xs font-medium text-slate-950 disabled:opacity-40"
            >
              Submit report
            </button>
            <button
              type="button"
              onClick={() => setReporting(false)}
              className="rounded border border-slate-700 px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
