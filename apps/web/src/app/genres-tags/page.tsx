import Link from "next/link";
import { getApi } from "@/trpc/server";
import { tagHref, genreHref, sortDiscoveryItems } from "@/lib/discovery";

export const dynamic = "force-dynamic";

const GENRE_DESCRIPTIONS: Record<string, string> = {
  action:
    "Fast-moving stories driven by conflict, danger, and decisive heroes.",
  adventure:
    "Journeys into unfamiliar places, with discovery around every turn.",
  "alternate-history":
    "Fiction that reimagines the path history could have taken.",
  biopunk:
    "Speculative stories shaped by biology, mutation, and living technology.",
  comedy: "Stories built to surprise, delight, and make you laugh.",
  contemporary: "Stories grounded in recognizable modern life and society.",
  "dark-fantasy": "Fantasy where wonder and danger share the same shadow.",
  drama:
    "Character-centered stories shaped by emotional stakes and difficult choices.",
  "fan-fiction": "New stories built from an existing fictional world.",
  fantasy:
    "Impossible worlds, strange magic, and adventures beyond the ordinary.",
  gaming: "Stories where games, virtual worlds, or competition shape the plot.",
  horror: "Stories designed to unsettle, frighten, and keep the lights on.",
  "martial-arts":
    "Stories of discipline, combat, rival schools, and personal mastery.",
  military: "Stories centered on campaigns, command, and the cost of conflict.",
  mystery: "Questions, clues, and hidden truths waiting to be uncovered.",
  political:
    "Power, institutions, and competing ideals drive the central conflict.",
  progression:
    "Stories focused on visible growth, training, and steadily earned power.",
  romance: "Relationships and emotional connection at the heart of the story.",
  "school-life": "Stories shaped by classrooms, friendships, and growing up.",
  "science-fiction":
    "Speculative futures, advanced technology, and unfamiliar frontiers.",
  "sci-fi":
    "Speculative futures, advanced technology, and unfamiliar frontiers.",
  strategy:
    "Victories earned through planning, adaptation, and clever decisions.",
  superhero:
    "Extraordinary people navigating power, responsibility, and public life.",
  supernatural: "The hidden uncanny pressing against the ordinary world.",
  wuxia:
    "Martial heroes, honor, and wandering adventures in a historical world.",
  xianxia:
    "Immortal cultivation, spiritual realms, and the pursuit of transcendence.",
  xuanhuan:
    "Fantasy worlds blending cultivation, myth, and extraordinary power.",
};

export default async function GenresTagsPage() {
  const api = await getApi();

  let genres: { name: string; slug: string }[] = [];
  let tags: { name: string; slug: string }[] = [];
  let failed = false;

  try {
    [genres, tags] = await Promise.all([
      api.novels.genres(),
      api.tags.list({}),
    ]);
  } catch {
    failed = true;
  }

  if (failed) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Genres &amp; tags are unavailable
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          We could not load the catalog taxonomy just now. Try again in a
          moment, or browse the full catalog directly.
        </p>
        <Link
          href="/novels"
          className="mt-6 inline-flex rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500 dark:border-neutral-700 dark:bg-[#16171c] dark:text-neutral-200 dark:hover:border-neutral-500"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  const sortedGenres = sortDiscoveryItems(genres).map((genre) => ({
    ...genre,
    description:
      GENRE_DESCRIPTIONS[genre.slug] ??
      "Explore novels connected by a shared story tradition or genre.",
  }));
  const sortedTags = sortDiscoveryItems(tags).map(({ name, slug }) => ({
    name,
    slug,
  }));

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d66d11]">
          Find your next read
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
          Genres &amp; tags
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Browse the catalog by the kind of story you want, or by the details
          readers use to describe it.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section aria-labelledby="genres-heading">
          <div className="mb-4 flex items-end justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
            <div>
              <h2 id="genres-heading" className="text-xl font-bold">
                Genres
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Broad story categories to start your search.
              </p>
            </div>
            <span className="text-xs text-neutral-400">
              {sortedGenres.length}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {sortedGenres.map((genre) => (
              <Link
                key={genre.slug}
                href={genreHref(genre.slug)}
                className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#d66d11]/60 hover:shadow-sm dark:border-neutral-800 dark:bg-[#16171c] dark:hover:border-[#d66d11]/60"
              >
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {genre.name}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {genre.description}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="tags-heading">
          <div className="mb-4 flex items-end justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
            <div>
              <h2 id="tags-heading" className="text-xl font-bold">
                Tags
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Specific story elements and details.
              </p>
            </div>
            <span className="text-xs text-neutral-400">
              {sortedTags.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map((tag) => (
              <Link
                key={tag.slug}
                href={tagHref(tag.slug)}
                className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-[#0eb23a]/60 hover:text-[#0eb23a] dark:border-neutral-800 dark:bg-[#16171c] dark:text-neutral-300 dark:hover:border-[#0eb23a]/60 dark:hover:text-[#0eb23a]"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
