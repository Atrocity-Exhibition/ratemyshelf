"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { ImageUpload } from "@/components/common/ImageUpload";

const STATUSES = ["ONGOING", "COMPLETED", "HIATUS", "DROPPED"] as const;
const COUNTRIES = ["KR", "CN", "JP", "EN", "OTHER"] as const;

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function NovelForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    originalTitle: "",
    synopsis: "",
    status: "ONGOING" as (typeof STATUSES)[number],
    countryOfOrigin: "KR" as (typeof COUNTRIES)[number],
    chapterCount: 0,
    coverImageUrl: "",
    aliases: "",
    genres: "",
    tagSlugs: "",
    links: "",
  });

  const create = trpc.novels.create.useMutation({
    onSuccess: (novel) => {
      router.push(`/novels/${novel.slug}`);
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const externalLinks = form.links
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [source, url] = line.split("|").map((part) => part.trim());
            return { source: source ?? "", url: url ?? "" };
          });

        create.mutate({
          title: form.title.trim(),
          originalTitle: form.originalTitle.trim() || undefined,
          synopsis: form.synopsis.trim(),
          status: form.status,
          countryOfOrigin: form.countryOfOrigin,
          chapterCount: Number(form.chapterCount) || 0,
          coverImageUrl: form.coverImageUrl.trim() || undefined,
          aliases: splitList(form.aliases),
          genres: splitList(form.genres),
          tagSlugs: splitList(form.tagSlugs),
          externalLinks,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-400">Title *</span>
          <input
            required
            maxLength={200}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-400">Original title</span>
          <input
            maxLength={200}
            value={form.originalTitle}
            onChange={(event) => update("originalTitle", event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Status</span>
          <select
            value={form.status}
            onChange={(event) =>
              update("status", event.target.value as (typeof STATUSES)[number])
            }
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Country of origin</span>
          <select
            value={form.countryOfOrigin}
            onChange={(event) =>
              update(
                "countryOfOrigin",
                event.target.value as (typeof COUNTRIES)[number],
              )
            }
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          >
            {COUNTRIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Chapters</span>
          <input
            type="number"
            min={0}
            value={form.chapterCount}
            onChange={(event) => update("chapterCount", Number(event.target.value))}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <div className="sm:col-span-2">
          <ImageUpload
            label="Cover image"
            folder="covers"
            value={form.coverImageUrl}
            onChange={(url) => update("coverImageUrl", url)}
          />
        </div>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-400">Synopsis * (10+ chars)</span>
          <textarea
            required
            minLength={10}
            maxLength={20_000}
            rows={6}
            value={form.synopsis}
            onChange={(event) => update("synopsis", event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Aliases (comma separated)</span>
          <input
            value={form.aliases}
            onChange={(event) => update("aliases", event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-400">Genres (comma separated)</span>
          <input
            value={form.genres}
            onChange={(event) => update("genres", event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-400">
            Tag slugs (comma separated, must be approved)
          </span>
          <input
            value={form.tagSlugs}
            onChange={(event) => update("tagSlugs", event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-slate-400">
            External links (one per line: Source | https://url)
          </span>
          <textarea
            rows={3}
            value={form.links}
            onChange={(event) => update("links", event.target.value)}
            placeholder="Novel Updates | https://www.novelupdates.com/series/…"
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={create.isPending}
        className="rounded-lg bg-sky-500 px-5 py-2 font-semibold text-slate-950 shadow-sm shadow-sky-500/20 transition hover:bg-sky-400 hover:shadow-sky-500/30 active:scale-[0.98] disabled:opacity-50"
      >
        {create.isPending ? "Creating…" : "Create novel"}
      </button>
    </form>
  );
}
