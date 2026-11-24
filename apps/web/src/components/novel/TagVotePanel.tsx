"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const CATEGORIES = [
  "GENRE",
  "CONTENT_WARNING",
  "THEME",
  "SETTING",
  "FORMAT",
] as const;
type Category = (typeof CATEGORIES)[number];

export function TagVotePanel({
  novelId,
  currentTagIds,
}: {
  novelId: string;
  currentTagIds: string[];
}) {
  const utils = trpc.useUtils();
  const { data: tags } = trpc.tags.list.useQuery({});
  const [tagId, setTagId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("THEME");
  const [message, setMessage] = useState<string | null>(null);

  const vote = trpc.tags.vote.useMutation({
    onSuccess: () => {
      setMessage("Vote recorded. Tags apply after net +5 votes.");
      void utils.tags.list.invalidate();
    },
    onError: (error) => setMessage(error.message),
  });

  const propose = trpc.tags.propose.useMutation({
    onSuccess: (tag) => {
      setName("");
      vote.mutate({ tagId: tag.id, novelId, vote: 1 });
      setMessage("Tag proposed and upvoted.");
      void utils.tags.list.invalidate();
    },
    onError: (error) => setMessage(error.message),
  });

  const available = (tags ?? []).filter(
    (tag) => !currentTagIds.includes(tag.id),
  );

  return (
    <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-[#16171c]">
      <div>
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Community tags
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Vote on missing tags. A tag is attached at net +5 and removed at net
          -5.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-neutral-600 dark:text-neutral-400">
            Existing tag
          </span>
          <select
            value={tagId}
            onChange={(event) => setTagId(event.target.value)}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <option value="">Select a tag</option>
            {available.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!tagId || vote.isPending}
          onClick={() => vote.mutate({ tagId, novelId, vote: 1 })}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 disabled:opacity-40"
        >
          Upvote
        </button>
        <button
          type="button"
          disabled={!tagId || vote.isPending}
          onClick={() => vote.mutate({ tagId, novelId, vote: -1 })}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/40 disabled:opacity-40"
        >
          Downvote
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2.5 border-t border-neutral-100 pt-3.5 dark:border-neutral-800">
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-neutral-600 dark:text-neutral-400">
            Propose a tag
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tag name"
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          />
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold text-neutral-600 dark:text-neutral-400">
            Category
          </span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className="rounded-lg border border-neutral-300 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value === "THEME" ? "GENRE" : value.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={name.trim().length < 2 || propose.isPending}
          onClick={() => propose.mutate({ name: name.trim(), category })}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600 disabled:opacity-40"
        >
          Propose
        </button>
      </div>

      {message && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {message}
        </p>
      )}
    </section>
  );
}
