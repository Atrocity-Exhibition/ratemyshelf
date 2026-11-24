import Link from "next/link";

export function GenreBrowse({
  genres,
}: {
  genres: { name: string; slug: string }[];
}) {
  if (!genres.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Browse by genre
        </h2>
        <Link
          href="/genres-tags"
          className="text-xs font-semibold text-neutral-600 hover:underline dark:text-neutral-400"
        >
          All genres &amp; tags →
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {genres.slice(0, 10).map((genre) => (
          <Link
            key={genre.slug}
            href={`/novels?genres=${encodeURIComponent(genre.slug)}`}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-neutral-800 dark:bg-[#16171c] dark:text-neutral-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
