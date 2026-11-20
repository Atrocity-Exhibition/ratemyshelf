import { randomBytes } from "crypto";
import { redis } from "@trackwn/db";

const RESET_TTL_SECONDS = 60 * 60; // 1 hour

function key(token: string) {
  return `reset:password:${token}`;
}

export async function createPasswordResetToken(
  userId: string,
): Promise<string | null> {
  try {
    const token = randomBytes(32).toString("base64url");
    await redis.set(key(token), userId, "EX", RESET_TTL_SECONDS);
    return token;
  } catch {
    return null;
  }
}

export async function consumePasswordResetToken(
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

export function passwordResetUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}
