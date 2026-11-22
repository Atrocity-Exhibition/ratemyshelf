"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { ScoreSlider } from "./ScoreSlider";

export function ReviewForm({ novelId }: { novelId: string }) {
  const { status } = useSession();
  const utils = trpc.useUtils();
  const [body, setBody] = useState("");
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  const [overall, setOverall] = useState(50);
  const [dimensions, setDimensions] = useState<{
    story: number | null;
    characters: number | null;
    worldBuilding: number | null;
  }>({ story: null, characters: null, worldBuilding: null });

  const submit = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      setBody("");
      setContainsSpoiler(false);
      setOverall(50);
      setDimensions({ story: null, characters: null, worldBuilding: null });
      void utils.reviews.forNovel.invalidate({ novelId });
      void utils.novels.bySlug.invalidate();
    },
  });

  if (status !== "authenticated") {
    return (
      <p className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">
        <Link href="/login">Sign in</Link> to rate this novel.
      </p>
    );
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xs"
      onSubmit={(event) => {
        event.preventDefault();
        submit.mutate({
          novelId,
          scoreOverall: overall,
          scoreStory: dimensions.story ?? undefined,
          scoreCharacters: dimensions.characters ?? undefined,
          scoreWorldBuilding: dimensions.worldBuilding ?? undefined,
          body: body.trim() || undefined,
          containsSpoiler: body.trim() ? containsSpoiler : false,
        });
      }}
    >
      <h2 className="text-lg font-semibold text-slate-100">Rate this novel</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreSlider
          label="Overall"
          value={overall}
          min={0}
          max={100}
          onChange={setOverall}
        />
        {(["story", "characters", "worldBuilding"] as const).map((key) => (
          <div key={key} className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={dimensions[key] !== null}
                onChange={(event) =>
                  setDimensions((prev) => ({
                    ...prev,
                    [key]: event.target.checked ? 5 : null,
                  }))
                }
              />
              Rate {key === "worldBuilding" ? "world building" : key}
            </label>
            {dimensions[key] !== null && (
              <ScoreSlider
                label={key === "worldBuilding" ? "World building" : key}
                value={dimensions[key] ?? 5}
                onChange={(value) =>
                  setDimensions((prev) => ({ ...prev, [key]: value }))
                }
              />
            )}
          </div>
        ))}
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-400">Review (optional)</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={8}
          className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-slate-100"
          placeholder="Share your thoughts (optional)…"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={containsSpoiler}
          disabled={!body.trim()}
          onChange={(event) => setContainsSpoiler(event.target.checked)}
        />
        This review contains spoilers
      </label>
      {submit.error && (
        <p className="text-sm text-red-400">{submit.error.message}</p>
      )}
      <button
        type="submit"
        disabled={submit.isPending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
      >
        {submit.isPending ? "Submitting…" : "Submit rating"}
      </button>
      {submit.isSuccess && (
        <p className="text-sm text-emerald-400">
          Rating submitted. Scores recalculate shortly.
        </p>
      )}
    </form>
  );
}
