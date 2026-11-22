import { redis } from "@ratemyshelf/db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  member?: string;
};

/**
 * Sliding-window rate limiter backed by a Redis sorted set.
 * Fails open when Redis is unavailable so a cache outage cannot take the app down.
 */
export async function rateLimit(options: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = options;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const member = `${now}-${Math.random().toString(36).slice(2)}`;

  try {
    const pipeline = redis.multi();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, member);
    pipeline.zcard(key);
    pipeline.pexpire(key, windowSeconds * 1000);
    const results = await pipeline.exec();
    const count = Number(results?.[2]?.[1] ?? 0);
    const allowed = count <= limit;

    if (!allowed) {
      await redis.zrem(key, member);
    }

    return {
      allowed,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: count > limit ? windowSeconds : 0,
      member: allowed ? member : undefined,
    };
  } catch {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

export async function releaseRateLimit(options: {
  key: string;
  member?: string;
}): Promise<void> {
  if (!options.member) return;
  try {
    await redis.zrem(options.key, options.member);
  } catch {
    // A failed cleanup is harmless; the entry expires with the window.
  }
}
