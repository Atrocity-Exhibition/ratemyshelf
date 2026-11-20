import PgBoss from "pg-boss";

const globalForQueue = globalThis as unknown as {
  boss: PgBoss | undefined;
};

export type JobName =
  | "recalculate-novel-score"
  | "sync-search-index"
  | "sweep-abuse-scores"
  | "resolve-tag-votes";

export async function getQueue(): Promise<PgBoss> {
  if (globalForQueue.boss) return globalForQueue.boss;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to start the pg-boss queue");
  }

  const boss = new PgBoss({ connectionString });
  await boss.start();
  globalForQueue.boss = boss;
  return boss;
}
