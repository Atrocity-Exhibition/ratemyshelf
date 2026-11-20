import type { MetadataRoute } from "next";
import { prisma } from "@trackwn/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let novels: { slug: string; updatedAt: Date }[] = [];
  try {
    novels = await prisma.novel.findMany({
      where: { isHidden: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 50_000,
    });
  } catch {
    novels = [];
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/novels`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    ...novels.map((novel) => ({
      url: `${baseUrl}/novels/${novel.slug}`,
      lastModified: novel.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
