import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ReadStatus } from "@prisma/client";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { lastChapterForStatus } from "@/lib/shelfProgress";

const shelfInclude = {
  novel: {
    include: {
      scoreCache: true,
      tags: { include: { tag: true } },
    },
  },
};

export const shelvesRouter = router({
  myShelf: protectedProcedure
    .input(z.object({ status: z.nativeEnum(ReadStatus).optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.shelfItem.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.status ? { status: input.status } : {}),
        },
        include: shelfInclude,
        orderBy: { updatedAt: "desc" },
      });
    }),

  setStatus: protectedProcedure
    .input(
      z.object({
        novelId: z.string().min(1),
        status: z.nativeEnum(ReadStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const existing = await ctx.db.shelfItem.findUnique({
        where: {
          userId_novelId: {
            userId: ctx.session.user.id,
            novelId: input.novelId,
          },
        },
      });
      const novel = await ctx.db.novel.findUnique({
        where: { id: input.novelId },
        select: { chapterCount: true },
      });
      const completedProgress = novel
        ? lastChapterForStatus(input.status, novel.chapterCount)
        : undefined;

      return ctx.db.shelfItem.upsert({
        where: {
          userId_novelId: {
            userId: ctx.session.user.id,
            novelId: input.novelId,
          },
        },
        update: {
          status: input.status,
          ...(input.status === ReadStatus.READING && !existing?.startedAt
            ? { startedAt: now }
            : {}),
          ...(input.status === ReadStatus.COMPLETED
            ? {
                completedAt: now,
                ...(completedProgress !== undefined
                  ? { lastChapter: completedProgress }
                  : {}),
              }
            : {}),
        },
        create: {
          userId: ctx.session.user.id,
          novelId: input.novelId,
          status: input.status,
          startedAt: input.status === ReadStatus.READING ? now : undefined,
          completedAt: input.status === ReadStatus.COMPLETED ? now : undefined,
          lastChapter: completedProgress,
        },
      });
    }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        novelId: z.string().min(1),
        lastChapter: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.shelfItem.findUnique({
        where: {
          userId_novelId: {
            userId: ctx.session.user.id,
            novelId: input.novelId,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Add the novel to a shelf before tracking progress",
        });
      }

      return ctx.db.shelfItem.update({
        where: { id: existing.id },
        data: { lastChapter: input.lastChapter },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ novelId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.shelfItem.deleteMany({
        where: { userId: ctx.session.user.id, novelId: input.novelId },
      });
      return { ok: true };
    }),

  publicByUser: publicProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: { id: true, username: true, avatarUrl: true, bio: true },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const items = await ctx.db.shelfItem.findMany({
        where: { userId: user.id },
        include: shelfInclude,
        orderBy: { updatedAt: "desc" },
      });

      return { user, items };
    }),
});
