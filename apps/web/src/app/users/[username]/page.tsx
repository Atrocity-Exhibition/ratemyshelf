import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApi } from "@/trpc/server";
import { ScoreBadge } from "@/components/common/ScoreBadge";

export const dynamic = "force-dynamic";

type Params = Promise<{ username: string }>;

async function loadProfile(username: string) {
  const api = await getApi();
  try {
    return await api.users.byUsername({ username });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await loadProfile(username);
  if (!profile) return { title: "User not found" };

  return {
    title: `${profile.user.username} - RateMyShelf`,
    description:
      profile.user.bio ?? `${profile.user.username}'s profile on RateMyShelf`,
  };
}

export default async function UserPage({ params }: { params: Params }) {
  const { username } = await params;
  const profile = await loadProfile(username);
  if (!profile) notFound();

  const isStaff =
    profile.user.role === "ADMIN" ||
    profile.user.role === "MODERATOR" ||
    profile.user.role === "CONTRIBUTOR";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-[#16171c]">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
          {profile.user.avatarUrl ? (
            <Image
              src={profile.user.avatarUrl}
              alt={profile.user.username}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-neutral-500 dark:text-neutral-400">
              {profile.user.username.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {profile.user.username}
            </h1>
            {isStaff && (
              <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {profile.user.role}
              </span>
            )}
          </div>

          {profile.user.bio && (
            <p className="max-w-2xl text-xs text-neutral-600 dark:text-neutral-300">
              {profile.user.bio}
            </p>
          )}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Member since{" "}
            {new Date(profile.user.accountCreatedAt).toLocaleDateString()} ·{" "}
            {profile.user._count.reviews} public reviews ·{" "}
            {profile.user._count.lists} public lists
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Recent Reviews
        </h2>
        {profile.reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-[#16171c] dark:text-neutral-400">
            No public reviews yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {profile.reviews.map((review) => (
              <li
                key={review.id}
                className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-[#16171c]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <ScoreBadge
                      score={review.scoreOverall}
                      size="sm"
                      scale={100}
                    />
                    <Link
                      href={`/novels/${review.novel.slug}`}
                      className="text-sm font-semibold text-neutral-900 transition hover:underline dark:text-neutral-100"
                    >
                      {review.novel.title}
                    </Link>
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!review.containsSpoiler && review.body && (
                  <p className="line-clamp-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {review.body.replace(/<[^>]*>/g, "").slice(0, 300)}
                  </p>
                )}
                {review.containsSpoiler && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Spoiler content hidden.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Public Lists
        </h2>
        {profile.lists.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:bg-[#16171c] dark:text-neutral-400">
            No public lists yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.lists.map((list) => (
              <li
                key={list.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-[#16171c] dark:hover:border-neutral-700"
              >
                <Link
                  href={`/lists/${list.id}`}
                  className="text-sm font-semibold text-neutral-900 hover:underline dark:text-neutral-100"
                >
                  {list.title}
                </Link>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {list._count.items}{" "}
                  {list._count.items === 1 ? "novel" : "novels"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
