import { randomBytes, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redis } from "@trackwn/db";

export const REFRESH_COOKIE = "refresh_token";
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

type RefreshRecord = {
  userId: string;
  family: string;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export async function issueRefreshToken(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const family = randomUUID();

  await redis.set(
    `refresh:${token}`,
    JSON.stringify({ userId, family } satisfies RefreshRecord),
    "EX",
    REFRESH_TTL_SECONDS,
  );
  await redis.sadd(`refresh:family:${family}`, token);
  await redis.expire(`refresh:family:${family}`, REFRESH_TTL_SECONDS);

  const store = await cookies();
  store.set(REFRESH_COOKIE, token, cookieOptions(REFRESH_TTL_SECONDS));
}

export async function rotateRefreshToken(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const token = store.get(REFRESH_COOKIE)?.value;
  if (!token) return null;

  const raw = await redis.get(`refresh:${token}`);
  if (!raw) return null;

  const record = JSON.parse(raw) as RefreshRecord;
  const isCurrent = await redis.sismember(`refresh:family:${record.family}`, token);

  if (!isCurrent) {
    // A rotated token was replayed: assume theft and revoke the whole family.
    await revokeFamily(record.family);
    store.delete(REFRESH_COOKIE);
    return null;
  }

  await redis.del(`refresh:${token}`);
  await redis.srem(`refresh:family:${record.family}`, token);

  const next = randomBytes(32).toString("base64url");
  await redis.set(
    `refresh:${next}`,
    JSON.stringify({ userId: record.userId, family: record.family } satisfies RefreshRecord),
    "EX",
    REFRESH_TTL_SECONDS,
  );
  await redis.sadd(`refresh:family:${record.family}`, next);
  store.set(REFRESH_COOKIE, next, cookieOptions(REFRESH_TTL_SECONDS));

  return { userId: record.userId };
}

export async function revokeFamily(family: string): Promise<void> {
  const members = await redis.smembers(`refresh:family:${family}`);
  if (members.length > 0) {
    await redis.del(...members.map((token) => `refresh:${token}`));
  }
  await redis.del(`refresh:family:${family}`);
}

export async function revokeCurrentRefreshToken(): Promise<void> {
  const store = await cookies();
  const token = store.get(REFRESH_COOKIE)?.value;
  if (!token) return;

  const raw = await redis.get(`refresh:${token}`);
  if (raw) {
    const record = JSON.parse(raw) as RefreshRecord;
    await revokeFamily(record.family);
  }

  await redis.del(`refresh:${token}`);
  store.delete(REFRESH_COOKIE);
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  const keys = await redis.keys("refresh:*");
  for (const key of keys) {
    if (key.startsWith("refresh:family:")) continue;
    const raw = await redis.get(key);
    if (!raw) continue;
    try {
      const record = JSON.parse(raw) as RefreshRecord;
      if (record.userId === userId) {
        await revokeFamily(record.family);
      }
    } catch {
      // Ignore malformed entries.
    }
  }
}
