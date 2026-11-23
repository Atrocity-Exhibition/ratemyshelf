import Link from "next/link";

export default function Loading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-7 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-72 animate-pulse rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[3/4] animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <span className="sr-only">Loading catalog</span>
      <noscript>
        <Link href="/novels">Browse the catalog</Link>
      </noscript>
    </div>
  );
}
