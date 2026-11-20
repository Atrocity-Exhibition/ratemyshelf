import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { Role } from "@prisma/client";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && "issues" in error.cause
            ? (error.cause as { issues: unknown }).issues
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

const ROLE_RANK: Record<Role, number> = {
  [Role.ANONYMOUS]: 0,
  [Role.USER]: 1,
  [Role.CONTRIBUTOR]: 2,
  [Role.MODERATOR]: 3,
  [Role.ADMIN]: 4,
};

export function roleProcedure(minimum: Role) {
  return protectedProcedure.use(({ ctx, next }) => {
    const role = (ctx.session.user.role ?? Role.USER) as Role;
    if (ROLE_RANK[role] < ROLE_RANK[minimum]) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx });
  });
}
