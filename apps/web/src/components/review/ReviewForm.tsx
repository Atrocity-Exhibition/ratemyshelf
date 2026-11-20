"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { ScoreSlider } from "./ScoreSlider";

const MIN_BODY = 150;

export function ReviewForm({ novelId }: { novelId: string }) {
  const { status } = useSession();
  const utils = trpc.useUtils();
  const [body, setBody] = useState("");
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  const [scores, setScores] = useState({
    story: 5,
    translation: 5,
    characters: 5,
    worldBuilding: 5,
    overall: 5,
  });
  const [translationApplicable, setTranslationApplicable] = useState(false);

  const submit = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      setBody("");
      setContainsSpoiler(false);
      void utils.reviews.forNovel.invalidate({ novelId });
      void utils.novels.bySlug.invalidate();
    },
  });

  if (status !== "authenticated") {
    return (
      <p className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">
        <Link href="/login">Sign in</Link> to write a review.
      </p>
    );
  }

  const tooShort = body.trim().length < MIN_BODY;

  return (
    <form
      className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xs"
      onSubmit={(event) => {
        event.preventDefault();
        if (tooShort) return;
        submit.mutate({
          novelId,
          body,
          containsSpoiler,
          scoreStory: scores.story,
          scoreTranslation: translationApplicable ? scores.translation : undefined,
          scoreCharacters: scores.characters,
          scoreWorldBuilding: scores.worldBuilding,
          scoreOverall: scores.overall,
        });
      }}
    >
      <h2 className="text-lg font-semibold text-slate-100">Write a review</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreSlider
          label="Story"
          value={scores.story}
          onChange={(value) => setScores((prev) => ({ ...prev, story: value }))}
        />
        <ScoreSlider
          label="Characters"
          value={scores.characters}
          onChange={(value) => setScores((prev) => ({ ...prev, characters: value }))}
        />
        <ScoreSlider
          label="World building"
          value={scores.worldBuilding}
          onChange={(value) =>
            setScores((prev) => ({ ...prev, worldBuilding: value }))
          }
        />
        <ScoreSlider
          label="Overall"
          value={scores.overall}
          onChange={(value) => setScores((prev) => ({ ...prev, overall: value }))}
        />
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={translationApplicable}
              onChange={(event) => setTranslationApplicable(event.target.checked)}
            />
            Rate the translation
          </label>
          {translationApplicable && (
            <ScoreSlider
              label="Translation"
              value={scores.translation}
              onChange={(value) =>
                setScores((prev) => ({ ...prev, translation: value }))
              }
            />
          )}
        </div>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">
          Review ({body.trim().length}/{MIN_BODY} minimum)
        </span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={8}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-slate-100"
          placeholder="What worked, what did not, and who should read it?"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={containsSpoiler}
          onChange={(event) => setContainsSpoiler(event.target.checked)}
        />
        This review contains spoilers
      </label>

      {submit.error && (
        <p className="text-sm text-red-400">{submit.error.message}</p>
      )}

      <button
        type="submit"
        disabled={tooShort || submit.isPending}
        className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 shadow-sm shadow-sky-500/20 transition hover:bg-sky-400 hover:shadow-sky-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submit.isPending ? "Submitting…" : "Submit review"}
      </button>
      {submit.isSuccess && (
        <p className="text-sm text-emerald-400">
          Review submitted. Scores recalculate shortly.
        </p>
      )}
    </form>
  );
}
