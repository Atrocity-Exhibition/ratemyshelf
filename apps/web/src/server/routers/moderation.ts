import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ReportStatus, ReportTarget, ReviewStatus, Role } from "@prisma/client";
import { router, protectedProcedure, roleProcedure } from "../trpc";
import { revokeAllUserTokens } from "@/lib/tokens";

const reportInput = z.object({
  targetType: z.nativeEnum(ReportTarget),
  targetId: z.string().min(1),
  reason: z.string().min(5).max(500),
});

export const moderationRouter = router({
  submitReport: protectedProcedure
    .input(reportInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.report.create({
        data: {
          reporterId: ctx.session.user.id,
          targetType: input.targetType,
          targetId: input.targetId,
          reason: input.reason,
        },
      });
    }),

  reportQueue: roleProcedure(Role.MODERATOR)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = { status: ReportStatus.PENDING };
      const [items, total] = await Promise.all([
        ctx.db.report.findMany({
          where,
          include: {
            reporter: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "asc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.report.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        totalPages: Math.max(1, Math.ceil(total / input.limit)),
      };
    }),

  resolveReport: roleProcedure(Role.MODERATOR)
    .input(
      z.object({
        reportId: z.string().min(1),
        action: z.enum(["DISMISS", "HIDE_REVIEW", "BAN_USER", "HIDE_NOVEL"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.report.findUnique({
        where: { id: input.reportId },
      });
      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.$transaction(async (tx) => {
        if (input.action === "HIDE_REVIEW") {
          await tx.review.update({
            where: { id: report.targetId },
            data: { status: ReviewStatus.HIDDEN_BY_MOD },
          });
        }

        if (input.action === "BAN_USER") {
          await tx.user.update({
            where: { id: report.targetId },
            data: { isBanned: true },
          });
          await revokeAllUserTokens(report.targetId);
        }

        if (input.action === "HIDE_NOVEL") {
          await tx.novel.update({
            where: { id: report.targetId },
            data: { isHidden: true },
          });
        }

        await tx.auditLog.create({
          data: {
            actorId: ctx.session.user.id,
            action: input.action,
            targetType: report.targetType,
            targetId: report.targetId,
            metadata: { reportId: report.id, reason: report.reason },
          },
        });

        return tx.report.update({
          where: { id: input.reportId },
          data: {
            status:
              input.action === "DISMISS"
                ? ReportStatus.DISMISSED
                : ReportStatus.RESOLVED,
            resolvedBy: ctx.session.user.id,
            resolvedAt: new Date(),
          },
        });
      });
    }),

  flaggedReviews: roleProcedure(Role.MODERATOR)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = { status: ReviewStatus.FLAGGED };
      const [items, total] = await Promise.all([
        ctx.db.review.findMany({
          where,
          include: {
            user: { select: { id: true, username: true } },
            novel: { select: { id: true, slug: true, title: true } },
          },
          orderBy: { abuseScore: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.review.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        totalPages: Math.max(1, Math.ceil(total / input.limit)),
      };
    }),

  overrideAbuseScore: roleProcedure(Role.MODERATOR)
    .input(
      z.object({
        reviewId: z.string().min(1),
        abuseScore: z.number().min(0).max(1),
        status: z.nativeEnum(ReviewStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.review.update({
        where: { id: input.reviewId },
        data: { abuseScore: input.abuseScore, status: input.status },
      });

      await ctx.db.auditLog.create({
        data: {
          actorId: ctx.session.user.id,
          action: "OVERRIDE_ABUSE_SCORE",
          targetType: "REVIEW",
          targetId: input.reviewId,
          metadata: {
            abuseScore: input.abuseScore,
            status: input.status,
          },
        },
      });

      await ctx.enqueue("recalculate-novel-score", {
        novelId: review.novelId,
      });

      return review;
    }),
});
