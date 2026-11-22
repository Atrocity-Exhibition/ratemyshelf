import { NextResponse } from "next/server";
import { getSearchClient, prisma, redis } from "@ratemyshelf/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CheckStatus = "ok" | "error";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function GET() {
  const checks: Record<string, CheckStatus> = {};

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 3_000);
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  try {
    await withTimeout(redis.ping(), 2_000);
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  try {
    await withTimeout(getSearchClient().health(), 2_000);
    checks.search = "ok";
  } catch {
    checks.search = "error";
  }

  const healthy = Object.values(checks).every((status) => status === "ok");

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
