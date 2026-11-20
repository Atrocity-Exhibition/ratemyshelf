import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Role, TagCategory } from "@prisma/client";
import { router, publicProcedure, protectedProcedure, roleProcedure } from "../trpc";
import { slugify } from "@/lib/slug";

export const tagsRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          category: z.nativeEnum(TagCategory).optional(),
          includeUnapproved: z.boolean().default(false),
        })
        .default({ includeUnapproved: false }),
    )
    .query(async ({ ctx, input }) => {
      const canSeeUnapproved =
        input.includeUnapproved &&
        ctx.session?.user &&
        ([Role.MODERATOR, Role.ADMIN] as Role[]).includes(ctx.session.user.role);

      return ctx.db.tag.findMany({
        where: {
          ...(input.category ? { category: input.category } : {}),
          ...(canSeeUnapproved ? {} : { isApproved: true }),
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      });
    }),

  propose: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(64),
        category: z.nativeEnum(TagCategory),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.name);
      const existing = await ctx.db.tag.findUnique({ where: { slug } });
      if (existing) throw new TRPCError({ code: "CONFLICT" });

      return ctx.db.tag.create({
        data: {
          name: input.name,
          slug,
          category: input.category,
          description: input.description,
          isApproved: false,
        },
      });
    }),

  approve: roleProcedure(Role.MODERATOR)
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.update({
        where: { id: input.id },
        data: { isApproved: true },
      });
    }),

  vote: protectedProcedure
    .input(
      z.object({
        tagId: z.string().min(1),
        novelId: z.string().min(1),
        vote: z.union([z.literal(1), z.literal(-1)]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tagVote.upsert({
        where: {
          tagId_userId_novelId: {
            tagId: input.tagId,
            userId: ctx.session.user.id,
            novelId: input.novelId,
          },
        },
        update: { vote: input.vote },
        create: {
          tagId: input.tagId,
          userId: ctx.session.user.id,
          novelId: input.novelId,
          vote: input.vote,
        },
      });
    }),
});
