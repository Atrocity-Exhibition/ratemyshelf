"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        This page could not be loaded. Try again, or head back to the catalog.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-neutral-400">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500 dark:border-neutral-700 dark:bg-[#16171c] dark:text-neutral-200 dark:hover:border-neutral-500"
        >
          Try again
        </button>
        <Link
          href="/novels"
          className="rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Browse catalog
        </Link>
      </div>
    </div>
  );
}
