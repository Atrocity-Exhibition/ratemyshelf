"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, X } from "lucide-react";
import { trpc } from "@/trpc/client";
import { ScoreBadge } from "@/components/common/ScoreBadge";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function TopBarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = trpc.search.novels.useQuery(
    { q: debouncedQuery },
    {
      enabled: debouncedQuery.length > 0,
      staleTime: 60_000,
    },
  );

  const hits = data?.hits ?? [];

  // Keyboard shortcut: Cmd+K or Ctrl+K focuses the input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/novels?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search novels, authors, tags…"
          className="w-full rounded-full border border-neutral-300 bg-neutral-100/90 py-1.5 pl-9 pr-14 text-sm text-neutral-900 placeholder-neutral-500 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-neutral-400 dark:focus:bg-neutral-950 dark:focus:ring-neutral-400"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none hidden rounded border border-neutral-200 bg-neutral-200/50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 sm:inline-block">
              ⌘K
            </kbd>
          )}
        </div>
      </form>

      {/* Live Fuzzy Search Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-800 dark:bg-[#15161b]">
          {isFetching && hits.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-xs text-neutral-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-neutral-400" />
              Searching RateMyShelf…
            </div>
          ) : hits.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
              No novels found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <ul className="space-y-1">
              {hits.slice(0, 6).map((novel) => (
                <li key={novel.id}>
                  <Link
                    href={`/novels/${novel.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
                  >
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                      {novel.coverImageUrl ? (
                        <Image
                          src={novel.coverImageUrl}
                          alt={novel.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-neutral-400">
                          RMS
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {novel.title}
                      </p>
                      {novel.originalTitle && (
                        <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                          {novel.originalTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                        <span>{novel.countryOfOrigin}</span>
                        <span>•</span>
                        <span>{novel.chapterCount} chapters</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <ScoreBadge
                        score={novel.bayesianScore}
                        size="sm"
                        scale={100}
                      />
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-neutral-100 pt-1 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full rounded-md p-1.5 text-center text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  View all results for &ldquo;{query}&rdquo; →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
