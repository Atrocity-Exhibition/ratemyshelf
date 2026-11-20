import type { Session } from "next-auth";
import { prisma, redis, getQueue, type JobName } from "@ratemyshelf/db";
import { auth } from "@/auth";

export type Context = {
  session: Session | null;
  db: typeof prisma;
  redis: typeof redis;
  enqueue: (job: JobName, data: Record<string, unknown>) => Promise<string | null>;
};

export async function createContext(): Promise<Context> {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  return {
    session,
    db: prisma,
    redis,
    enqueue: async (job, data) => {
      const boss = await getQueue();
      return boss.send(job, data);
    },
  };
}
