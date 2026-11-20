import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApi } from "@/trpc/server";
import { NovelHeader } from "@/components/novel/NovelHeader";
import { NovelScorePanel } from "@/components/novel/NovelScorePanel";
import { NovelTagList } from "@/components/novel/NovelTagList";
import { TagVotePanel } from "@/components/novel/TagVotePanel";
import { AliasesSection } from "@/components/novel/AliasesSection";
import { ExternalLinksPanel } from "@/components/novel/ExternalLinksPanel";
import { AddToShelfButton } from "@/components/shelf/AddToShelfButton";
import { AddToListButton } from "@/components/lists/AddToListButton";
import { ReviewForm } from "@/components/review/ReviewForm";
import { ReviewList } from "@/components/review/ReviewList";
import type { NovelDetailData } from "@/types/catalog";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function loadNovel(slug: string) {
  const api = await getApi();
  try {
    return await api.novels.bySlug({ slug });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const novel = await loadNovel(slug);
  if (!novel) return { title: "Novel not found" };

  return {
    title: novel.title,
    description: novel.synopsis.slice(0, 160),
    openGraph: {
      title: novel.title,
      description: novel.synopsis.slice(0, 160),
      images: novel.coverImageUrl ? [novel.coverImageUrl] : undefined,
    },
  };
}

export default async function NovelPage({ params }: { params: Params }) {
  const { slug } = await params;
  const novel = await loadNovel(slug);
  if (!novel) notFound();

  const api = await getApi();
  const reviews = await api.reviews.forNovel({
    novelId: novel.id,
    page: 1,
    limit: 10,
    sort: "helpful",
  });

  const detail = {
    ...novel,
    externalLinks: (novel.externalLinks ?? []) as NovelDetailData["externalLinks"],
  } as NovelDetailData;

  return (
    <div className="space-y-8">
      <NovelHeader novel={detail} />

      <div className="flex flex-wrap items-center gap-4">
        <AddToShelfButton novelId={novel.id} />
        <AddToListButton novelId={novel.id} />
      </div>

      <NovelScorePanel novel={detail} />
      <NovelTagList novel={detail} />
      <TagVotePanel
        novelId={novel.id}
        currentTagIds={novel.tags.map((entry) => entry.tagId)}
      />
      <AliasesSection novel={detail} />
      <ExternalLinksPanel novel={detail} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <ReviewForm novelId={novel.id} />
        <ReviewList
          novelId={novel.id}
          initialData={reviews as unknown as Parameters<typeof ReviewList>[0]["initialData"]}
        />
      </section>
    </div>
  );
}
