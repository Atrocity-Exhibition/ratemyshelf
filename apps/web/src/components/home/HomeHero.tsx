import Link from "next/link";

export function HomeHero() {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 dark:border-emerald-900/70 dark:bg-emerald-950/30 sm:px-10">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
        Read with intention
      </p>
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
        Find your next webnovel, then make it yours.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        Explore community ratings, honest reviews, and personal shelves for the
        stories worth your time.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/novels"
          className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          Browse catalog
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-800 hover:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-500"
        >
          Create a free account
        </Link>
      </div>
    </section>
  );
}
