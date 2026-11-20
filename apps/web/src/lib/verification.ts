import { randomBytes } from "crypto";
import { redis } from "@ratemyshelf/db";

const VERIFY_TTL_SECONDS = 24 * 60 * 60;

function key(token: string) {
  return `verify:email:${token}`;
}

/**
 * Creates a single-use email verification token in Redis.
 * Returns `null` when Redis is unavailable so callers can degrade gracefully.
 */
export async function createEmailVerificationToken(
  userId: string,
): Promise<string | null> {
  try {
    const token = randomBytes(32).toString("base64url");
    await redis.set(key(token), userId, "EX", VERIFY_TTL_SECONDS);
    return token;
  } catch {
    return null;
  }
}

/** Returns the user id for a valid token and deletes it in the same step. */
export async function consumeEmailVerificationToken(
  token: string,
): Promise<string | null> {
  try {
    const userId = await redis.get(key(token));
    if (!userId) return null;
    await redis.del(key(token));
    return userId;
  } catch {
    return null;
  }
}

export function verificationUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
}
