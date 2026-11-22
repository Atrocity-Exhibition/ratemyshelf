import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Country, NovelStatus, Prisma, Role } from "@prisma/client";
import { router, publicProcedure, roleProcedure } from "../trpc";
import { slugify } from "@/lib/slug";
import { buildRelationClauses } from "@/lib/catalogFilters";

const novelInclude = {
  scoreCache: true,
  aliases: true,
  genres: true,
  tags: { include: { tag: true } },
} satisfies Prisma.NovelInclude;

const listInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  status: z.nativeEnum(NovelStatus).optional(),
  country: z.nativeEnum(Country).optional(),
  tagSlugs: z.array(z.string()).max(20).optional(),
  genreSlugs: z.array(z.string()).max(20).optional(),
  excludeGenreSlugs: z.array(z.string()).max(20).optional(),
  excludeTagSlugs: z.array(z.string()).max(20).optional(),
  sort: z.enum(["latest", "score", "chapters"]).default("latest"),
});

const novelInput = z.object({
  title: z.string().min(1).max(200),
  originalTitle: z.string().max(200).optional(),
  synopsis: z.string().min(10).max(20_000),
  status: z.nativeEnum(NovelStatus).default(NovelStatus.ONGOING),
  countryOfOrigin: z.nativeEnum(Country),
  chapterCount: z.number().int().min(0).default(0),
  coverImageUrl: z.string().url().optional(),
  externalLinks: z
    .array(z.object({ source: z.string().min(1), url: z.string().url() }))
    .default([]),
  aliases: z.array(z.string().min(1).max(200)).default([]),
  genres: z.array(z.string().min(1).max(100)).default([]),
  tagSlugs: z.array(z.string()).default([]),
});

async function uniqueSlug(db: Prisma.TransactionClient, base: string) {
  let slug = base || "novel";
  let suffix = 1;
  while (await db.novel.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export const novelsRouter = router({
  list: publicProcedure.input(listInput).query(async ({ ctx, input }) => {
    const where: Prisma.NovelWhereInput = { isHidden: false };
    if (input.status) where.status = input.status;
    if (input.country) where.countryOfOrigin = input.country;
    const relationClauses = [
      ...buildRelationClauses(
        "genres",
        input.genreSlugs,
        input.excludeGenreSlugs,
      ),
      ...buildRelationClauses("tags", input.tagSlugs, input.excludeTagSlugs),
    ];
    if (relationClauses.length) where.AND = relationClauses;

    const orderBy: Prisma.NovelOrderByWithRelationInput =
      input.sort === "score"
        ? { scoreCache: { bayesianScore: "desc" } }
        : input.sort === "chapters"
          ? { chapterCount: "desc" }
          : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      ctx.db.novel.findMany({
        where,
        orderBy,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        include: novelInclude,
      }),
      ctx.db.novel.count({ where }),
    ]);

    return {
      items,
      total,
      page: input.page,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    };
  }),

  trending: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(8) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.novel.findMany({
        where: { isHidden: false, scoreCache: { reviewCount: { gt: 0 } } },
        orderBy: { scoreCache: { bayesianScore: "desc" } },
        take: input.limit,
        include: novelInclude,
      });
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const novel = await ctx.db.novel.findUnique({
        where: { slug: input.slug },
        include: novelInclude,
      });
      if (!novel) throw new TRPCError({ code: "NOT_FOUND" });

      const canSeeHidden =
        ctx.session?.user.role === Role.MODERATOR ||
        ctx.session?.user.role === Role.ADMIN;
      if (novel.isHidden && !canSeeHidden) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return novel;
    }),

  create: roleProcedure(Role.CONTRIBUTOR)
    .input(novelInput)
    .mutation(async ({ ctx, input }) => {
      const tagRows = await ctx.db.tag.findMany({
        where: { slug: { in: input.tagSlugs }, isApproved: true },
        select: { id: true },
      });

      const novel = await ctx.db.$transaction(async (tx) => {
        const slug = await uniqueSlug(tx, slugify(input.title));
        return tx.novel.create({
          data: {
            slug,
            title: input.title,
            originalTitle: input.originalTitle,
            synopsis: input.synopsis,
            status: input.status,
            countryOfOrigin: input.countryOfOrigin,
            chapterCount: input.chapterCount,
            coverImageUrl: input.coverImageUrl,
            externalLinks: input.externalLinks,
            aliases: { create: input.aliases.map((alias) => ({ alias })) },
            genres: {
              create: input.genres.map((name) => ({
                name,
                slug: slugify(name),
              })),
            },
            tags: {
              create: tagRows.map((tag) => ({
                tag: { connect: { id: tag.id } },
              })),
            },
          },
          include: novelInclude,
        });
      });

      await ctx.enqueue("sync-search-index", { novelId: novel.id });
      return novel;
    }),

  update: roleProcedure(Role.MODERATOR)
    .input(novelInput.partial().extend({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { id, aliases, genres, tagSlugs, ...scalars } = input;

      const novel = await ctx.db.$transaction(async (tx) => {
        if (aliases) {
          await tx.novelAlias.deleteMany({ where: { novelId: id } });
        }
        if (genres) {
          await tx.genreLink.deleteMany({ where: { novelId: id } });
        }
        if (tagSlugs) {
          await tx.novelTag.deleteMany({ where: { novelId: id } });
        }

        const tagRows = tagSlugs
          ? await tx.tag.findMany({
              where: { slug: { in: tagSlugs }, isApproved: true },
              select: { id: true },
            })
          : [];

        return tx.novel.update({
          where: { id },
          data: {
            ...scalars,
            ...(aliases
              ? { aliases: { create: aliases.map((alias) => ({ alias })) } }
              : {}),
            ...(genres
              ? {
                  genres: {
                    create: genres.map((name) => ({
                      name,
                      slug: slugify(name),
                    })),
                  },
                }
              : {}),
            ...(tagSlugs
              ? {
                  tags: {
                    create: tagRows.map((tag) => ({
                      tag: { connect: { id: tag.id } },
                    })),
                  },
                }
              : {}),
          },
          include: novelInclude,
        });
      });

      await ctx.enqueue("sync-search-index", { novelId: novel.id });
      return novel;
    }),

  delete: roleProcedure(Role.ADMIN)
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.novel.delete({ where: { id: input.id } });
      await ctx.enqueue("sync-search-index", { novelId: input.id });
      return { ok: true };
    }),

  adminList: roleProcedure(Role.MODERATOR)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(50),
        q: z.string().max(200).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.NovelWhereInput = input.q
        ? { title: { contains: input.q, mode: "insensitive" } }
        : {};

      const [items, total] = await Promise.all([
        ctx.db.novel.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            isHidden: true,
            chapterCount: true,
            updatedAt: true,
          },
        }),
        ctx.db.novel.count({ where }),
      ]);

      return {
        items,
        total,
        page: input.page,
        totalPages: Math.max(1, Math.ceil(total / input.limit)),
      };
    }),

  setHidden: roleProcedure(Role.MODERATOR)
    .input(z.object({ id: z.string().min(1), isHidden: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const novel = await ctx.db.novel.update({
        where: { id: input.id },
        data: { isHidden: input.isHidden },
        select: { id: true, slug: true, isHidden: true },
      });

      await ctx.db.auditLog.create({
        data: {
          actorId: ctx.session.user.id,
          action: input.isHidden ? "HIDE_NOVEL" : "UNHIDE_NOVEL",
          targetType: "NOVEL",
          targetId: novel.id,
        },
      });

      await ctx.enqueue("sync-search-index", { novelId: novel.id });
      return novel;
    }),
});
