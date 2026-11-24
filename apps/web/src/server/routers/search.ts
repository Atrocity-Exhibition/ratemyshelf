import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Country, NovelStatus } from "@prisma/client";
import {
  NOVELS_INDEX,
  getSearchClient,
  type NovelSearchDocument,
} from "@ratemyshelf/db";
import { router, publicProcedure } from "../trpc";
import { rateLimit } from "@/lib/rateLimit";
import { slugArraySchema } from "@/lib/catalogFilters";

export const searchInput = z.object({
  q: z.string().max(200).default(""),
  page: z.number().int().min(1).default(1),
  hitsPerPage: z.number().int().min(1).max(50).default(20),
  filters: z
    .object({
      status: z.nativeEnum(NovelStatus).optional(),
      country: z.nativeEnum(Country).optional(),
      tags: slugArraySchema.optional(),
      excludeTags: slugArraySchema.optional(),
      genres: slugArraySchema.optional(),
      excludeGenres: slugArraySchema.optional(),
      minScore: z.number().min(0).max(100).optional(),
      ratedOnly: z.boolean().default(false),
    })
    .optional(),
  sort: z
    .enum(["relevance", "score", "latest", "chapters"])
    .default("relevance"),
});

export function buildFilter(
  filters: Omit<
    NonNullable<z.infer<typeof searchInput>["filters"]>,
    "ratedOnly"
  > & { ratedOnly?: boolean },
) {
  const clauses: string[] = [];
  if (filters.status) clauses.push(`status = "${filters.status}"`);
  if (filters.country) clauses.push(`countryOfOrigin = "${filters.country}"`);
  for (const genre of filters.genres ?? []) {
    clauses.push(`genreSlugs = ${JSON.stringify(genre)}`);
  }
  if (filters.excludeGenres?.length) {
    clauses.push(
      `genreSlugs NOT IN [${filters.excludeGenres.map((genre) => JSON.stringify(genre)).join(", ")}]`,
    );
  }
  for (const tag of filters.tags ?? []) {
    clauses.push(`tagSlugs = ${JSON.stringify(tag)}`);
  }
  if (filters.excludeTags?.length) {
    clauses.push(
      `tagSlugs NOT IN [${filters.excludeTags.map((tag) => JSON.stringify(tag)).join(", ")}]`,
    );
  }
  if (typeof filters.minScore === "number") {
    clauses.push(`bayesianScore >= ${filters.minScore}`);
  }
  if (filters.ratedOnly) clauses.push("reviewCount > 0");
  return clauses.length > 0 ? clauses.join(" AND ") : undefined;
}

export const searchRouter = router({
  novels: publicProcedure.input(searchInput).query(async ({ ctx, input }) => {
    const limiter = await rateLimit({
      key: `ratelimit:search:${ctx.session?.user.id ?? "anonymous"}`,
      limit: 30,
      windowSeconds: 60,
    });

    if (!limiter.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Retry in ${limiter.retryAfterSeconds}s`,
      });
    }

    const index = getSearchClient().index<NovelSearchDocument>(NOVELS_INDEX);
    const sort =
      input.sort === "score"
        ? ["bayesianScore:desc"]
        : input.sort === "chapters"
          ? ["chapterCount:desc"]
          : input.sort === "latest"
            ? ["createdAt:desc"]
            : undefined;

    const result = await index.search(input.q, {
      limit: input.hitsPerPage,
      offset: (input.page - 1) * input.hitsPerPage,
      filter: input.filters ? buildFilter(input.filters) : undefined,
      sort,
    });

    const totalHits = result.estimatedTotalHits ?? 0;

    return {
      hits: result.hits,
      totalHits,
      page: input.page,
      totalPages: Math.max(1, Math.ceil(totalHits / input.hitsPerPage)),
      processingTimeMs: result.processingTimeMs,
    };
  }),
});
