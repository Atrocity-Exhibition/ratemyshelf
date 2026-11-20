import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";

const listItemInclude = {
  novel: {
    include: {
      scoreCache: true,
      tags: { include: { tag: true } },
    },
  },
};

export const listsRouter = router({
  myLists: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userList.findMany({
      where: { userId: ctx.session.user.id },
      include: { _count: { select: { items: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const list = await ctx.db.userList.findUnique({
        where: { id: input.id },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
          items: {
            include: listItemInclude,
            orderBy: { position: "asc" },
          },
        },
      });

      if (!list) throw new TRPCError({ code: "NOT_FOUND" });
      if (!list.isPublic && list.userId !== ctx.session?.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return list;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().max(1000).optional(),
        isPublic: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userList.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title,
          description: input.description,
          isPublic: input.isPublic,
        },
      });
    }),

  addNovel: protectedProcedure
    .input(z.object({ listId: z.string().min(1), novelId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.userList.findUnique({
        where: { id: input.listId },
        select: { userId: true },
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const last = await ctx.db.listItem.findFirst({
        where: { listId: input.listId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      return ctx.db.listItem.upsert({
        where: {
          listId_novelId: { listId: input.listId, novelId: input.novelId },
        },
        update: {},
        create: {
          listId: input.listId,
          novelId: input.novelId,
          position: (last?.position ?? -1) + 1,
        },
      });
    }),

  removeNovel: protectedProcedure
    .input(z.object({ listId: z.string().min(1), novelId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.userList.findUnique({
        where: { id: input.listId },
        select: { userId: true },
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.$transaction(async (tx) => {
        await tx.listItem.deleteMany({
          where: { listId: input.listId, novelId: input.novelId },
        });

        const remaining = await tx.listItem.findMany({
          where: { listId: input.listId },
          orderBy: { position: "asc" },
          select: { novelId: true },
        });

        for (const [index, item] of remaining.entries()) {
          await tx.listItem.update({
            where: {
              listId_novelId: {
                listId: input.listId,
                novelId: item.novelId,
              },
            },
            data: { position: index },
          });
        }

        return { ok: true };
      });
    }),

  reorder: protectedProcedure
    .input(
      z.object({
        listId: z.string().min(1),
        orderedNovelIds: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.userList.findUnique({
        where: { id: input.listId },
        select: { userId: true },
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.$transaction(async (tx) => {
        for (const [index, novelId] of input.orderedNovelIds.entries()) {
          await tx.listItem.update({
            where: {
              listId_novelId: { listId: input.listId, novelId },
            },
            data: { position: index },
          });
        }
        return { ok: true };
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.userList.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (!list) throw new TRPCError({ code: "NOT_FOUND" });
      if (list.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.userList.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
