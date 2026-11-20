"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

const CATEGORIES = ["GENRE", "CONTENT_WARNING", "THEME", "SETTING", "FORMAT"] as const;
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

  const available = (tags ?? []).filter((tag) => !currentTagIds.includes(tag.id));

  return (
    <section className="space-y-3 rounded-lg border border-slate-800 p-4">
      <h2 className="font-semibold">Community tags</h2>
      <p className="text-sm text-slate-500">
        Vote on missing tags. A tag is attached at net +5 and removed at net -5.
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-400">Existing tag</span>
          <select
            value={tagId}
            onChange={(event) => setTagId(event.target.value)}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
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
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Upvote
        </button>
        <button
          type="button"
          disabled={!tagId || vote.isPending}
          onClick={() => vote.mutate({ tagId, novelId, vote: -1 })}
          className="rounded border border-red-700 px-3 py-1.5 text-sm text-red-300 disabled:opacity-40"
        >
          Downvote
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t border-slate-800 pt-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-400">Propose a tag</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tag name"
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-400">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1.5"
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={name.trim().length < 2 || propose.isPending}
          onClick={() => propose.mutate({ name: name.trim(), category })}
          className="rounded border border-slate-700 px-3 py-1.5 text-sm hover:border-slate-500 disabled:opacity-40"
        >
          Propose
        </button>
      </div>

      {message && <p className="text-sm text-slate-400">{message}</p>}
    </section>
  );
}
