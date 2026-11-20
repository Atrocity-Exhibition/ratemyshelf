"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/trpc/client";
import type { SearchHit } from "@/types/catalog";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = trpc.search.novels.useQuery(
    { q: query, page: 1, hitsPerPage: 5, sort: "relevance" },
    { enabled: open && query.trim().length > 0 },
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
    setQuery("");
  }, [open]);

  if (!open) return null;

  const hits = (data?.hits ?? []) as SearchHit[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 p-4 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search novels"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Jump to a novel…"
          className="w-full border-b border-slate-800 bg-transparent px-4 py-3 outline-none"
        />
        <ul className="max-h-80 overflow-auto p-2">
          {isFetching && (
            <li className="px-3 py-2 text-sm text-slate-500">Searching…</li>
          )}
          {!isFetching && query.trim() && hits.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No matches.</li>
          )}
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-slate-800"
                onClick={() => {
                  setOpen(false);
                  router.push(`/novels/${hit.slug}`);
                }}
              >
                <span>
                  <span className="block font-medium">{hit.title}</span>
                  {hit.originalTitle && (
                    <span className="block text-xs text-slate-500">
                      {hit.originalTitle}
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-500">{hit.status}</span>
              </button>
            </li>
          ))}
          {!query.trim() && (
            <li className="px-3 py-2 text-sm text-slate-500">
              Type a title, alias, or genre. Press Esc to close.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
