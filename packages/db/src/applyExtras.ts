import { readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "./client";

/**
 * Applies SQL that Prisma migrations cannot express (pg_trgm extension and
 * trigram indexes). Safe to run repeatedly: every statement is idempotent.
 */
const sqlPath = path.join(
  __dirname,
  "../prisma/migrations/001_init/extras.sql",
);

function statements(sql: string): string[] {
  return sql
    .replace(/--.*$/gm, "")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function main() {
  const sql = readFileSync(sqlPath, "utf8");
  const queries = statements(sql);

  for (const query of queries) {
    await prisma.$executeRawUnsafe(query);
    console.log(`applied: ${query.split("\n")[0]}`);
  }

  console.log(`Applied ${queries.length} statement(s) from extras.sql`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
