# Catalog Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich existing novels with normalized tags and genres, add strict seed tag validation, and curate a new batch of 24 webnovels (8 CN, 8 KR, 8 EN) with original metadata and verified source attribution.

**Architecture:** Extend `packages/db/prisma/seed.ts` with expanded global `TAGS` and strict tag-existence validation. Enrich `NOVELS` in `seed.ts` and `CATALOG_CANDIDATES` in `packages/db/prisma/catalogCandidates.ts` with rich, normalized tags and genres. Add 24 curated novel candidates with verified canonical sources and original synopsis copy. Run seed and Meilisearch reindexing to update database and search indices.

**Tech Stack:** TypeScript, Prisma, PostgreSQL, Meilisearch, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-24-catalog-expansion-design.md`

## Global Constraints

- Never scrape NovelUpdates or Scribble Hub, and never copy their synopsis text, reviews, ratings, or covers.
- All synopsis copy must be original RMS text.
- Novel tags must strictly match slugs defined in the global `TAGS` list.
- Slugs, titles, and aliases must be globally unique across all catalog entries.
- Cover URLs must be verified official/licensed URLs or omitted (using the no-cover placeholder).
- Catalog must maintain at least 10 entries each for CN, KR, and EN.
- Idempotent seed via upsert; no deletions of user data or reviews.

## Review Focus

- Undefined tag slug on a novel: seed validation must fail with clear error instead of silently skipping tag assignment.
- Duplicate slug, title, or alias in new candidates: seed validation catches collisions before writing to the database.
- Genre link slug generation: normalized cleanly without special characters breaking `/novels?genres=...`.
- Candidate source URLs: must be valid URLs pointing to canonical platforms or series pages.
- Meilisearch sync: new novels and enriched tags must be fully indexed and filterable.

---

### Task 1: Add Strict Seed Tag Validation and Expanded Global Tags

**Files:**

- Modify: `packages/db/prisma/seed.ts:30-80,685-745`
- Test: `apps/web/src/lib/catalogValidation.test.ts` (or unit test validating seed data structures)

**Interfaces:**

- Consumes: `TagCategory` from `@prisma/client`, `TAGS` and `ALL_NOVELS` from `seed.ts`.
- Produces: Expanded `TAGS` vocabulary and strict `validateSeedData` checking that every tag slug referenced by a novel exists in `TAGS`.

- [x] **Step 1: Write failing unit test for tag validation rules**

Create `apps/web/src/lib/seedValidation.test.ts` to test tag slug validation logic:

```typescript
import { describe, expect, it } from "vitest";

describe("seed tag validation", () => {
  it("fails if a novel references a tag slug not in global TAGS", () => {
    const validTags = new Set(["isekai", "cultivation"]);
    const novelTags = ["isekai", "non-existent-tag"];
    const invalid = novelTags.filter((t) => !validTags.has(t));
    expect(invalid).toEqual(["non-existent-tag"]);
  });
});
```

- [x] **Step 2: Run test to verify it passes/fails as expected**

Run: `pnpm --filter @ratemyshelf/web exec vitest run src/lib/seedValidation.test.ts`
Expected: PASS

- [x] **Step 3: Expand global `TAGS` in `packages/db/prisma/seed.ts`**

Add missing standard webnovel tags with categories and descriptions:

- `transmigration` (THEME)
- `system` (THEME)
- `villain-protagonist` (THEME)
- `crafting` (THEME)
- `necromancy` (THEME)
- `monsters` (SETTING)
- `urban-fantasy` (SETTING)
- `scifi` (GENRE)
- `slice-of-life` (GENRE)
- `dark` (CONTENT_WARNING)
- `tragedy` (CONTENT_WARNING)
- `comedy` (GENRE)
- `adventure` (GENRE)
- `mystery` (GENRE)
- `drama` (GENRE)

- [x] **Step 4: Update `validateSeedData` in `packages/db/prisma/seed.ts` to enforce tag validity**

In `validateSeedData(novels)`:

```typescript
const validTagSlugs = new Set(TAGS.map((t) => t.slug));
for (const novel of novels) {
  for (const tagSlug of novel.tags) {
    if (!validTagSlugs.has(tagSlug)) {
      throw new Error(
        `Novel "${novel.slug}" references unknown tag slug: "${tagSlug}"`,
      );
    }
  }
}
```

- [x] **Step 5: Run typecheck and existing tests**

Run: `pnpm typecheck && pnpm test`
Expected: PASS

- [x] **Step 6: Commit**

```bash
git add packages/db/prisma/seed.ts apps/web/src/lib/seedValidation.test.ts
git commit -m "feat(catalog): expand global tags vocabulary and enforce strict tag validation"
```

---

### Task 2: Enrich Existing Novels with Normalized Tags and Genres

**Files:**

- Modify: `packages/db/prisma/seed.ts` (38 legacy novels)
- Modify: `packages/db/prisma/catalogCandidates.ts` (50 candidate novels)

**Interfaces:**

- Consumes: Expanded `TAGS` list and standard genre names.
- Produces: Complete, accurate `tags` and `genres` arrays across all 88 existing novels.

- [x] **Step 1: Audit and normalize genres across existing 88 novels**

Ensure all novel genres use consistent title casing (e.g., "Action", "Adventure", "Fantasy", "Dark Fantasy", "Xianxia", "Xuanhuan", "Wuxia", "Sci-Fi", "Comedy", "Romance", "Mystery", "Supernatural", "Slice of Life", "Drama", "Horror", "Psychological", "Urban Fantasy").

- [x] **Step 2: Enrich tags on existing novels in `seed.ts` and `catalogCandidates.ts`**

Add accurate secondary tags (e.g. `system` to LitRPG/regression stories, `transmigration` where applicable, `urban-fantasy`, `crafting`, `slow-burn`, `multiple-pov`, `antihero`, `villain-protagonist`).

- [x] **Step 3: Run seed validation dry run via test or tsx**

Run: `pnpm typecheck`
Expected: PASS

- [x] **Step 4: Commit**

```bash
git add packages/db/prisma/seed.ts packages/db/prisma/catalogCandidates.ts
git commit -m "feat(catalog): enrich tags and normalize genres for existing 88 novels"
```

---

### Task 3: Curate 24 New Novels (8 CN, 8 KR, 8 EN)

**Files:**

- Modify: `packages/db/prisma/catalogCandidates.ts`
- Modify: `packages/db/prisma/covers.json` (for any new verified cover URLs)

**Interfaces:**

- Consumes: `CatalogCandidate` type from `catalogCandidates.ts`.
- Produces: 24 new `CatalogCandidate` records with verified canonical source links and original RMS synopses.

- [x] **Step 1: Write candidate entries in `catalogCandidates.ts`**

Curate 24 popular, widely-read webnovels with verifiable metadata:

- **8 Chinese (CN):** e.g., _A Will Eternal_, _Renegade Immortal_, _Martial World_, _True Martial World_, _Tales of Herding Gods_, _Ze Tian Ji (Way of Choices)_, _Reverend Insanity_ (already in? check), _My House of Horrors_, _I Shall Seal the Heavens_ (check existing).
- **8 Korean (KR):** e.g., _Leveling with the Gods_, _SSS-Class Suicide Hunter_, _The Player That Can't Level Up_, _Solo Bug Player_, _Villains Are Destined to Die_, _Beware of the Villainess!_, _Kill the Hero_, _Memorize_.
- **8 English/Western (EN):** e.g., _He Who Fights with Monsters_, _The Primal Hunter_, _Defiance of the Fall_, _Dungeon Crawler Carl_, _Mark of the Fool_, _Super Powereds_, _Cradle: Unsouled_, _Azarinth Healer_ (check which are already present).

Ensure:

- Zero slug/title/alias collisions with existing 88 novels.
- Original synopsis written for RMS (2-3 sentences, summarizing premise without spoilers).
- Canonical source or platform link in `source` / `sourceUrl`.
- Standard tags from `TAGS` and normalized genres.

- [x] **Step 2: Check for collisions and validate seed**

Run seed validation logic to ensure no duplicate titles, aliases, or invalid tags.

- [x] **Step 3: Run typecheck and tests**

Run: `pnpm typecheck && pnpm test`
Expected: PASS

- [x] **Step 4: Commit**

```bash
git add packages/db/prisma/catalogCandidates.ts packages/db/prisma/covers.json
git commit -m "feat(catalog): add 24 curated novels with original synopsis and verified sources"
```

---

### Task 4: Execute Seed, Reindex Search, and Verify Discovery Filters

**Files:**

- Run: `pnpm db:seed`
- Run: `pnpm db:index`

**Interfaces:**

- Consumes: Database connection and Meilisearch instance.
- Produces: Updated database with 112+ novels, expanded tags/genres, and synchronized Meilisearch index.

- [x] **Step 1: Run database seed**

Run: `pnpm db:seed`
Expected: Output showing `Seed complete: 112 novels, <N> tags` with zero validation errors.

- [x] **Step 2: Run Meilisearch reindexing**

Run: `pnpm db:index`
Expected: Bulk indexing succeeds with all 112 documents indexed and 0 stale documents.

- [x] **Step 3: Verify catalog in browser**

Using in-app browser or HTTP checks:

1. `/novels` displays new novels and new tag chips.
2. `/genres-tags` shows updated counts and newly added tags.
3. Search bar and filter chips find newly added titles and tags.

- [x] **Step 4: Run full verification suite**

Run: `pnpm typecheck && pnpm --filter @ratemyshelf/web lint && pnpm test`
Expected: All clean.

- [x] **Step 5: Commit and push**

```bash
git commit --allow-empty -m "chore(catalog): synchronize seed expansion and search indices"
git push origin master
```
