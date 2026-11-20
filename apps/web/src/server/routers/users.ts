import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ReviewStatus } from "@prisma/client";
import { router, publicProcedure } from "../trpc";

export const usersRouter = router({
  byUsername: publicProcedure
    .input(z.object({ username: z.string().min(1).max(32) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          accountCreatedAt: true,
          role: true,
          isBanned: true,
          _count: {
            select: {
              reviews: { where: { status: ReviewStatus.VISIBLE } },
              lists: { where: { isPublic: true } },
            },
          },
        },
      });

      if (!user || user.isBanned) throw new TRPCError({ code: "NOT_FOUND" });

      const [reviews, lists] = await Promise.all([
        ctx.db.review.findMany({
          where: { userId: user.id, status: ReviewStatus.VISIBLE },
          include: {
            novel: {
              select: {
                slug: true,
                title: true,
                scoreCache: { select: { bayesianScore: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        ctx.db.userList.findMany({
          where: { userId: user.id, isPublic: true },
          include: { _count: { select: { items: true } } },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
      ]);

      return {
        user,
        reviews,
        lists,
      };
    }),
});
