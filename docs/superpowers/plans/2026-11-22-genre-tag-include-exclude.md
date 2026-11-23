# Genre and Tag Include/Exclude Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add separate genre and tag include/exclude filters that behave consistently in catalog browsing, search, URL state, Postgres, and Meilisearch.

**Architecture:** Reuse the existing `GenreLink` relation and `NovelTag` relation. Extend the existing catalog list input and search input with four slug-array filters, use Prisma relation filters for catalog queries, and generate equivalent Meilisearch clauses against indexed slug fields for search queries. Extend the existing filter panel and server page URL parsing without adding a database migration.

**Tech Stack:** Next.js App Router, React, tRPC, Zod, Prisma/PostgreSQL, Meilisearch, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-11-22-genre-tag-include-exclude-design.md`

## Global Constraints

- Genres remain separate from tags; do not migrate or delete legacy `TagCategory.GENRE` rows.
- Include filters require every selected value.
- Exclude filters reject any matching value.
- URL parameters are comma-separated slugs: `genres`, `excludeGenres`, `tags`, `excludeTags`.
- No new database table or migration.
- Preserve existing status, country, sort, search, moderation, and novel editing behavior.

## Review Focus

- Multiple included values must use AND semantics, not the current any-match behavior; pin in router/search filter tests.
- Any excluded genre or tag must remove the novel; pin in router/search filter tests.
- Empty, duplicate, and malformed URL values must not create invalid filters; pin in page/filter parsing tests or shared parser tests.
- Search and non-search catalog views must produce equivalent results; pin in Postgres and Meilisearch filter tests.
- Existing requests with no new parameters must retain current behavior; pin in input and filter-builder regression tests.

---

### Task 1: Normalize Catalog Filter Inputs

**Files:**

- Create: `apps/web/src/lib/catalogFilters.ts`
- Test: `apps/web/src/lib/catalogFilters.test.ts`
- Modify: `apps/web/src/server/routers/novels.ts`

**Interfaces:**

- Produces `parseSlugList(value: string | undefined): string[]`, returning trimmed, non-empty, deduplicated slugs.
- Produces `buildRelationClauses(relation: "genres" | "tags", include: string[] | undefined, exclude: string[] | undefined)`, returning Prisma-compatible `NovelWhereInput[]`; each included slug becomes a `some` clause and exclusions become one `none` clause.
- `novels.list` accepts `genreSlugs`, `excludeGenreSlugs`, `tagSlugs`, and `excludeTagSlugs`, each an optional array of at most 20 strings.

- [ ] **Step 1: Write failing tests** for slug trimming/deduplication, include-only, exclude-only, combined filters, and empty arrays.
- [ ] **Step 2: Run the focused test and verify it fails** because the helper does not exist.
- [ ] **Step 3: Implement the helpers** and extend `novels.list` input and Prisma `where` construction. Use one `some` relation clause per included slug so multiple includes have AND semantics; use `none` with an `in` list for exclusions. Preserve the existing `tagSlugs` input behavior for callers that do not provide exclusions.
- [ ] **Step 4: Run the focused tests** and verify they pass.
- [ ] **Step 5: Commit** with message `feat: add catalog genre and tag filters`.

### Task 2: Add Search Include/Exclude Filters

**Files:**

- Modify: `apps/web/src/server/routers/search.ts`
- Modify: `packages/db/src/search.ts`
- Test: `apps/web/src/lib/search.test.ts`

**Interfaces:**

- Search input accepts `tags`, `excludeTags`, `genres`, and `excludeGenres`, each optional and capped at 20 values.
- Search documents retain display-name `tags`/`genres` and add `tagSlugs`/`genreSlugs`; the new slug fields are filterable.
- `buildFilter(filters)` emits one equality clause per included slug and one `NOT IN` clause per excluded slug, joined with `AND`.

- [ ] **Step 1: Add failing tests** asserting:
  - two included genres produce two ANDed clauses;
  - excluded genres/tags produce `NOT IN [...]`;
  - combined genre/tag filters are all ANDed;
  - no new filters returns the existing filter output.
- [ ] **Step 2: Run `pnpm vitest run apps/web/src/lib/search.test.ts`** and verify the new assertions fail.
- [ ] **Step 3: Extend `NovelSearchDocument`, `toSearchDocument`, and `configureNovelIndex`** with filterable `tagSlugs` and `genreSlugs` fields populated from the existing relations.
- [ ] **Step 4: Extend `searchInput` and `buildFilter`** to filter the new slug fields using normalized JSON-quoted values.
- [ ] **Step 5: Run the focused search tests** and verify they pass.
- [ ] **Step 6: Commit** with message `feat: support search genre and tag exclusions`.

### Task 3: Wire URL State and Catalog UI

**Files:**

- Create: `apps/web/src/lib/catalogQuery.test.ts`
- Modify: `apps/web/src/app/novels/page.tsx`
- Modify: `apps/web/src/components/catalog/FilterPanel.tsx`

**Interfaces:**

- The page parses `genres`, `excludeGenres`, `tags`, and `excludeTags` with comma-separated slug parsing.
- The page passes those arrays to either `api.novels.list` or `api.search.novels`.
- Pagination, reset, and clear-query links preserve active filters.

- [ ] **Step 1: Add failing tests** for parsing comma-separated values, removing blanks/duplicates, and preserving all four filter parameters in generated pagination state.
- [ ] **Step 2: Run the focused test and verify it fails** because the shared query helper is absent.
- [ ] **Step 3: Implement the shared query parsing/preservation helper** and use it in `novels/page.tsx`.
- [ ] **Step 4: Update `FilterPanel`** with four compact inputs: included genres, excluded genres, included tags, and excluded tags. Each updates its URL parameter on blur and resets the page.
- [ ] **Step 5: Run the focused tests and web lint** and verify both pass without warnings.
- [ ] **Step 6: Commit** with message `feat: expose genre and tag include exclude controls`.

### Task 4: End-to-End Verification and Search Refresh

**Files:**

- Modify only if needed after verification.

- [ ] **Step 1: Run the full test suite:** `pnpm test`; expected all tests pass.
- [ ] **Step 2: Run type checking:** `pnpm typecheck`; expected no TypeScript errors.
- [ ] **Step 3: Run web lint:** `pnpm --filter @ratemyshelf/web lint`; expected no warnings or errors.
- [ ] **Step 4: Run the production build only when no development server is writing to `.next`:** `SKIP_ENV_VALIDATION=1 pnpm build`.
- [ ] **Step 5: Reindex existing novels:** `pnpm db:index`, ensuring current genre/tag fields are searchable.
- [ ] **Step 6: Run `git diff --check` and review the final diff** for accidental changes.
- [ ] **Step 7: Commit any verification-only corrections** with a focused message and push the completed branch.
