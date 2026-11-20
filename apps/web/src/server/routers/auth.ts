import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { encode } from "@auth/core/jwt";
import { cookies } from "next/headers";
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { env } from "@/env";
import { emailConfigured, sendEmail } from "@/lib/email";
import {
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  verificationUrl,
} from "@/lib/verification";
import { rateLimit } from "@/lib/rateLimit";
import {
  revokeCurrentRefreshToken,
  rotateRefreshToken,
  SESSION_COOKIE,
} from "@/lib/tokens";

const registerInput = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

function verificationEmail(to: string, url: string) {
  return {
    to,
    subject: "Verify your TrackWn email",
    html: `<p>Welcome to TrackWn. Confirm your email by visiting <a href="${url}">this link</a>.</p><p>The link expires in 24 hours. If you did not create this account, ignore this message.</p>`,
    text: `Welcome to TrackWn. Confirm your email: ${url} (expires in 24 hours).`,
  };
}

export const authRouter = router({
  register: publicProcedure
    .input(registerInput)
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();
      const existing = await ctx.db.user.findFirst({
        where: { OR: [{ email }, { username: input.username }] },
        select: { id: true, email: true, username: true },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            existing.email === email
              ? "An account with that email already exists"
              : "That username is already taken",
        });
      }

      // In development without Resend configured, accounts are verified
      // immediately so local sign-in works without an email provider.
      const requiresVerification = emailConfigured();
      const user = await ctx.db.user.create({
        data: {
          username: input.username,
          email,
          passwordHash: await hash(input.password, 12),
          role: Role.USER,
          isVerified: !requiresVerification,
        },
        select: { id: true, username: true, email: true, role: true },
      });

      let requiresEmailVerification = false;
      if (requiresVerification) {
        const token = await createEmailVerificationToken(user.id);
        if (!token) {
          // Redis is unavailable: never lock the new account out.
          await ctx.db.user.update({
            where: { id: user.id },
            data: { isVerified: true },
          });
        } else {
          await sendEmail(verificationEmail(email, verificationUrl(token)));
          requiresEmailVerification = true;
        }
      }

      return { ...user, requiresEmailVerification };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const userId = await consumeEmailVerificationToken(input.token);
      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That verification link is invalid or has expired.",
        });
      }

      const user = await ctx.db.user.update({
        where: { id: userId },
        data: { isVerified: true },
        select: { email: true, username: true },
      });

      return { ok: true, email: user.email, username: user.username };
    }),

  resendVerification: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();
      const limiter = await rateLimit({
        key: `ratelimit:verify:${email}`,
        limit: 3,
        windowSeconds: 60 * 60,
      });
      if (!limiter.allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const user = await ctx.db.user.findUnique({
        where: { email },
        select: { id: true, isVerified: true },
      });

      // Always report success so the endpoint cannot enumerate accounts.
      if (user && !user.isVerified && emailConfigured()) {
        const token = await createEmailVerificationToken(user.id);
        if (token) {
          await sendEmail(verificationEmail(email, verificationUrl(token)));
        }
      }

      return { ok: true };
    }),

  refresh: publicProcedure.mutation(async ({ ctx }) => {
    const rotated = await rotateRefreshToken();
    if (!rotated) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid refresh token" });
    }

    const user = await ctx.db.user.findUnique({ where: { id: rotated.userId } });
    if (!user || user.isBanned) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Account unavailable" });
    }

    const token = await encode({
      token: {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.username,
        role: user.role,
      },
      secret: env.AUTH_SECRET,
      salt: SESSION_COOKIE,
      maxAge: 15 * 60,
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return { ok: true };
  }),

  logout: publicProcedure.mutation(async () => {
    await revokeCurrentRefreshToken();
    const store = await cookies();
    store.delete(SESSION_COOKIE);
    return { ok: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        accountCreatedAt: true,
        isVerified: true,
      },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),
});
