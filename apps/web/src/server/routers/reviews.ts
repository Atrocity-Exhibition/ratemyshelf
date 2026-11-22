import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Role, ReviewStatus } from "@prisma/client";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { sanitizeReviewBody } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";

const reviewBody = z.string().nullable().optional();

const reviewInput = z.object({
  novelId: z.string().min(1),
  body: reviewBody,
  containsSpoiler: z.boolean().default(false),
  scoreStory: z.number().int().min(1).max(10).nullable().optional(),
  scoreCharacters: z.number().int().min(1).max(10).nullable().optional(),
  scoreWorldBuilding: z.number().int().min(1).max(10).nullable().optional(),
  scoreOverall: z.number().int().min(0).max(100),
});

async function assertCanReview(ctx: {
  db: { user: { findUnique: Function } };
  session: { user: { id: string } };
}) {
  const user = (await ctx.db.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { role: true, isBanned: true },
  })) as { role: Role; isBanned: boolean } | null;

  if (!user || user.isBanned) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account unavailable" });
  }
}

export const reviewsRouter = router({
  forNovel: publicProcedure
    .input(
      z.object({
        novelId: z.string().min(1),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
        sort: z.enum(["helpful", "recent", "score"]).default("helpful"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const viewerId = ctx.session?.user.id;
      const viewerRole = ctx.session?.user.role;

      const where = {
        novelId: input.novelId,
        OR: [
          { status: ReviewStatus.VISIBLE },
          ...(viewerId ? [{ userId: viewerId }] : []),
          ...(viewerRole === Role.MODERATOR || viewerRole === Role.ADMIN
            ? [
                {
                  status: {
                    in: [ReviewStatus.FLAGGED, ReviewStatus.HIDDEN_BY_MOD],
                  },
                },
              ]
            : []),
        ],
      };

      const orderBy =
        input.sort === "recent"
          ? { createdAt: "desc" as const }
          : input.sort === "score"
            ? { scoreOverall: "desc" as const }
            : { helpfulVotes: "desc" as const };

      const [items, total] = await Promise.all([
        ctx.db.review.findMany({
          where,
          orderBy,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        }),
        ctx.db.review.count({ where }),
      ]);

      const canSeeSpoilers =
        viewerRole === Role.MODERATOR || viewerRole === Role.ADMIN;

      return {
        items: items.map((review) => ({
          ...review,
          body:
            review.containsSpoiler &&
            !canSeeSpoilers &&
            review.userId !== viewerId
              ? "[SPOILER HIDDEN]"
              : review.body,
        })),
        total,
        page: input.page,
        totalPages: Math.max(1, Math.ceil(total / input.limit)),
      };
    }),

  submit: protectedProcedure
    .input(reviewInput)
    .mutation(async ({ ctx, input }) => {
      await assertCanReview(ctx);

      const limiter = await rateLimit({
        key: `ratelimit:review:${ctx.session.user.id}`,
        limit: 5,
        windowSeconds: 60 * 60,
      });
      if (!limiter.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const existing = await ctx.db.review.findUnique({
        where: {
          novelId_userId: {
            novelId: input.novelId,
            userId: ctx.session.user.id,
          },
        },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already reviewed this novel",
        });
      }

      const body = input.body?.trim() ? sanitizeReviewBody(input.body) : null;
      const review = await ctx.db.review.create({
        data: {
          novelId: input.novelId,
          userId: ctx.session.user.id,
          body,
          containsSpoiler: body ? input.containsSpoiler : false,
          scoreStory: input.scoreStory,
          scoreCharacters: input.scoreCharacters,
          scoreWorldBuilding: input.scoreWorldBuilding,
          scoreOverall: input.scoreOverall,
        },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      });

      await ctx.enqueue("recalculate-novel-score", { novelId: input.novelId });
      return review;
    }),

  update: protectedProcedure
    .input(
      reviewInput
        .omit({ novelId: true })
        .partial()
        .extend({ id: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.review.findUnique({
        where: { id: input.id },
        select: { userId: true, novelId: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { id, body, containsSpoiler, ...rest } = input;
      const bodyValue =
        body === undefined
          ? undefined
          : body?.trim()
            ? sanitizeReviewBody(body)
            : null;
      const review = await ctx.db.review.update({
        where: { id },
        data: {
          ...rest,
          ...(body !== undefined ? { body: bodyValue } : {}),
          ...(containsSpoiler !== undefined
            ? { containsSpoiler: bodyValue ? containsSpoiler : false }
            : body !== undefined
              ? { containsSpoiler: false }
              : {}),
        },
      });

      await ctx.enqueue("recalculate-novel-score", {
        novelId: existing.novelId,
      });
      return review;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.review.findUnique({
        where: { id: input.id },
        select: { userId: true, novelId: true },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      const isMod =
        ctx.session.user.role === Role.MODERATOR ||
        ctx.session.user.role === Role.ADMIN;
      if (existing.userId !== ctx.session.user.id && !isMod) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const review = await ctx.db.review.update({
        where: { id: input.id },
        data: {
          status: isMod
            ? ReviewStatus.HIDDEN_BY_MOD
            : ReviewStatus.HIDDEN_BY_USER,
        },
      });

      await ctx.enqueue("recalculate-novel-score", {
        novelId: existing.novelId,
      });
      return review;
    }),

  voteHelpful: protectedProcedure
    .input(
      z.object({
        reviewId: z.string().min(1),
        vote: z.union([z.literal(1), z.literal(-1)]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        await tx.reviewHelpfulVote.upsert({
          where: {
            reviewId_userId: {
              reviewId: input.reviewId,
              userId: ctx.session.user.id,
            },
          },
          update: { vote: input.vote },
          create: {
            reviewId: input.reviewId,
            userId: ctx.session.user.id,
            vote: input.vote,
          },
        });

        const aggregate = await tx.reviewHelpfulVote.aggregate({
          where: { reviewId: input.reviewId },
          _sum: { vote: true },
        });

        return tx.review.update({
          where: { id: input.reviewId },
          data: { helpfulVotes: aggregate._sum.vote ?? 0 },
        });
      });
    }),
});
