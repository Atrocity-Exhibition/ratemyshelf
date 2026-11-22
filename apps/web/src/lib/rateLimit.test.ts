import { describe, expect, it, vi } from "vitest";

const redisMocks = vi.hoisted(() => {
  const pipeline = {
    zremrangebyscore: vi.fn(),
    zadd: vi.fn(),
    zcard: vi.fn(),
    pexpire: vi.fn(),
    exec: vi.fn(),
  };

  return {
    pipeline,
    redis: {
      multi: vi.fn(() => pipeline),
      zrem: vi.fn(),
    },
  };
});

vi.mock("@ratemyshelf/db", () => ({ redis: redisMocks.redis }));

import { rateLimit, releaseRateLimit } from "./rateLimit";

describe("rateLimit", () => {
  it("does not retain the rejected attempt in the window", async () => {
    redisMocks.pipeline.exec.mockResolvedValueOnce([
      [null, 0],
      [null, 1],
      [null, 21],
      [null, 1],
    ]);

    const result = await rateLimit({
      key: "ratelimit:review:user-1",
      limit: 20,
      windowSeconds: 3600,
    });

    expect(result.allowed).toBe(false);
    expect(redisMocks.redis.zrem).toHaveBeenCalledWith(
      "ratelimit:review:user-1",
      expect.stringMatching(/^\d+-/),
    );
  });

  it("can release a reserved successful attempt when the operation fails", async () => {
    await releaseRateLimit({
      key: "ratelimit:review:user-1",
      member: "reserved-member",
    });

    expect(redisMocks.redis.zrem).toHaveBeenCalledWith(
      "ratelimit:review:user-1",
      "reserved-member",
    );
  });
});
