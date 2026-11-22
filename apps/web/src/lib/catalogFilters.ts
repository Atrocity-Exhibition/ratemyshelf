import type { Prisma } from "@prisma/client";
import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9][a-z0-9-]*$/, "Invalid slug");

export const slugArraySchema = z
  .array(slugSchema)
  .transform((slugs) => [...new Set(slugs)])
  .pipe(z.array(slugSchema).max(20));

export function normalizeSlugArray(values: readonly string[]): string[] {
  return slugArraySchema.parse(values);
}

export function parseSlugList(value: string | undefined): string[] {
  if (!value) return [];
  return normalizeSlugArray(
    value
      .split(",")
      .map((slug) => slug.trim())
      .filter((slug) => /^[a-z0-9][a-z0-9-]*$/.test(slug)),
  );
}

export function buildRelationClauses(
  relation: "genres" | "tags",
  include: string[] | undefined,
  exclude: string[] | undefined,
): Prisma.NovelWhereInput[] {
  const clauses: Prisma.NovelWhereInput[] = [];
  for (const slug of include ?? []) {
    clauses.push(
      relation === "genres"
        ? { genres: { some: { slug } } }
        : { tags: { some: { tag: { slug } } } },
    );
  }
  if (exclude?.length) {
    clauses.push(
      relation === "genres"
        ? { genres: { none: { slug: { in: exclude } } } }
        : { tags: { none: { tag: { slug: { in: exclude } } } } },
    );
  }
  return clauses;
}
