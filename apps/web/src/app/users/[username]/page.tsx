import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApi } from "@/trpc/server";

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
    title: `${profile.user.username} - TrackWn`,
    description: profile.user.bio ?? `${profile.user.username}'s profile on TrackWn`,
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
      <header className="flex flex-wrap items-center gap-5 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
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
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-300">
              {profile.user.username.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">
              {profile.user.username}
            </h1>
            {isStaff && (
              <span className="rounded bg-sky-950/80 px-2.5 py-0.5 text-xs font-medium text-sky-400 border border-sky-800/50">
                {profile.user.role}
              </span>
            )}
          </div>

          {profile.user.bio && (
            <p className="max-w-2xl text-sm text-slate-300">{profile.user.bio}</p>
          )}

          <p className="text-xs text-slate-500">
            Member since {new Date(profile.user.accountCreatedAt).toLocaleDateString()}{" "}
            · {profile.user._count.reviews} public reviews ·{" "}
            {profile.user._count.lists} public lists
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recent reviews</h2>
        {profile.reviews.length === 0 ? (
          <p className="rounded border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
            No public reviews yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {profile.reviews.map((review) => (
              <li
                key={review.id}
                className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/novels/${review.novel.slug}`}
                    className="font-medium text-slate-100 hover:text-sky-400"
                  >
                    {review.novel.title}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString()} · overall{" "}
                    {review.scoreOverall}/10
                    {review.novel.scoreCache?.bayesianScore != null && (
                      <> · novel ★ {review.novel.scoreCache.bayesianScore.toFixed(2)}</>
                    )}
                  </span>
                </div>
                {!review.containsSpoiler && (
                  <p className="line-clamp-3 text-sm text-slate-400">
                    {review.body.replace(/<[^>]*>/g, "").slice(0, 300)}
                  </p>
                )}
                {review.containsSpoiler && (
                  <p className="text-sm text-amber-400">Spoiler content hidden.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Public lists</h2>
        {profile.lists.length === 0 ? (
          <p className="rounded border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
            No public lists yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.lists.map((list) => (
              <li
                key={list.id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-700"
              >
                <Link
                  href={`/lists/${list.id}`}
                  className="font-medium text-slate-100 hover:text-sky-400"
                >
                  {list.title}
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  {list._count.items} novels
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
