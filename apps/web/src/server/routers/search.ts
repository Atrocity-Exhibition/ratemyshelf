import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Country, NovelStatus } from "@prisma/client";
import { NOVELS_INDEX, getSearchClient } from "@ratemyshelf/db";
import { router, publicProcedure } from "../trpc";
import { rateLimit } from "@/lib/rateLimit";

const searchInput = z.object({
  q: z.string().max(200).default(""),
  page: z.number().int().min(1).default(1),
  hitsPerPage: z.number().int().min(1).max(50).default(20),
  filters: z
    .object({
      status: z.nativeEnum(NovelStatus).optional(),
      country: z.nativeEnum(Country).optional(),
      tags: z.array(z.string()).max(20).optional(),
      genres: z.array(z.string()).max(20).optional(),
      minScore: z.number().min(0).max(10).optional(),
    })
    .optional(),
  sort: z.enum(["relevance", "score", "latest", "chapters"]).default("relevance"),
});

function buildFilter(filters: NonNullable<z.infer<typeof searchInput>["filters"]>) {
  const clauses: string[] = [];
  if (filters.status) clauses.push(`status = "${filters.status}"`);
  if (filters.country) clauses.push(`countryOfOrigin = "${filters.country}"`);
  if (filters.tags?.length) {
    clauses.push(`tags IN [${filters.tags.map((tag) => JSON.stringify(tag)).join(", ")}]`);
  }
  if (filters.genres?.length) {
    clauses.push(
      `genres IN [${filters.genres.map((genre) => JSON.stringify(genre)).join(", ")}]`,
    );
  }
  if (typeof filters.minScore === "number") {
    clauses.push(`bayesianScore >= ${filters.minScore}`);
  }
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

    const index = getSearchClient().index(NOVELS_INDEX);
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
