import Link from "next/link";
import { notFound } from "next/navigation";
import { getApi } from "@/trpc/server";

export const dynamic = "force-dynamic";

type Params = Promise<{ username: string }>;

export default async function UserPage({ params }: { params: Params }) {
  const { username } = await params;
  const api = await getApi();

  let profile: Awaited<ReturnType<typeof api.users.byUsername>> | null = null;
  try {
    profile = await api.users.byUsername({ username });
  } catch {
    profile = null;
  }

  if (!profile) notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{profile.user.username}</h1>
        {profile.user.bio && <p className="text-slate-300">{profile.user.bio}</p>}
        <p className="text-sm text-slate-500">
          Member since {new Date(profile.user.accountCreatedAt).toLocaleDateString()}{" "}
          · {profile.user._count.reviews} public reviews ·{" "}
          {profile.user._count.lists} public lists
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recent reviews</h2>
        {profile.reviews.length === 0 ? (
          <p className="text-sm text-slate-500">No public reviews yet.</p>
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
                    className="font-medium"
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
          <p className="text-sm text-slate-500">No public lists yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {profile.lists.map((list) => (
              <li key={list.id} className="rounded border border-slate-800 p-3">
                <Link href={`/lists/${list.id}`} className="font-medium">
                  {list.title}
                </Link>
                <p className="text-xs text-slate-500">
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
