# Discovery UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve signed-out activation, catalog filtering, and homepage discovery for RateMyShelf visitors.

**Architecture:** Keep the existing App Router and tRPC architecture. Add a reusable URL-synchronized filter control, extend the catalog query with a rated-only flag, use the existing `auth()` session check for the signed-out homepage hero, and keep authenticated shelf behavior unchanged.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, tRPC, Prisma, NextAuth, Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-24-discovery-ux-design.md`

## Global Constraints

- Follow existing Tailwind, Open Sans, dark-mode, and component conventions.
- Do not run a production build while the development server is active.
- Keep the existing catalog API and Prisma relation semantics unless a small query extension is required for rated-only behavior.
- Verify typecheck, lint, tests, and browser behavior.

## Review Focus

- URL values containing malformed, duplicate, or empty slugs must be normalized without breaking the page.
- Include filters must use AND semantics; exclude filters must reject any matching genre/tag.
- A rated-only request must exclude novels without a `NovelScoreCache` row and preserve pagination totals.
- Signed-out shelf login must return to the current novel instead of losing the user's context.
- Homepage hero must not render for authenticated users and must remain useful when catalog metadata is unavailable.

### Task 1: Catalog query and API rated-only support

**Files:**

- Modify: `apps/web/src/lib/catalogQuery.ts`
- Modify: `apps/web/src/server/routers/novels.ts`
- Modify: `apps/web/src/server/routers/search.ts`
- Test: `apps/web/src/lib/catalogQuery.test.ts`
- Test: `apps/web/src/lib/catalogFilters.test.ts`

**Interfaces:**

- Add `ratedOnly?: boolean` to `CatalogQuery`.
- Parse/build `rated=1` as the URL representation.
- Add optional `ratedOnly: z.boolean().default(false)` to `novels.list` and the search filter input.

- [ ] Add tests proving `rated=1` round-trips and malformed values default to false.
- [ ] Add `ratedOnly` to the catalog query parser/builder.
- [ ] Add the Prisma `scoreCache: { isNot: null }` condition to `novels.list` when requested.
- [ ] Add the equivalent Meilisearch `reviewCount > 0` filter for search.
- [ ] Run the focused catalog tests and typecheck.
- [ ] Commit: `feat(catalog): add rated-only filtering`

### Task 2: URL-synchronized chip filter controls

**Files:**

- Create: `apps/web/src/components/catalog/FilterChips.tsx`
- Modify: `apps/web/src/components/catalog/FilterPanel.tsx`
- Modify: `apps/web/src/app/novels/page.tsx`

**Interfaces:**

- `FilterChips` accepts `title`, `items: { name: string; slug: string }[]`, `selected: string[]`, and `onChange: (slugs: string[]) => void`.
- `FilterPanel` loads approved tags and genres through the existing server caller and renders controlled selections from `useSearchParams()`.

- [ ] Implement a chip group with keyboard-accessible buttons, selected state, and a compact “show more” treatment for long lists.
- [ ] Replace free-text include/exclude inputs with genre and tag chip groups.
- [ ] Add removable active-filter chips and a “Rated only” checkbox/toggle.
- [ ] Preserve status, country, sort, search, reset, and pagination behavior.
- [ ] Verify include/exclude URL updates retain all unrelated query parameters.
- [ ] Run lint, typecheck, and catalog tests.
- [ ] Commit: `feat(catalog): replace text filters with discovery chips`

### Task 3: Signed-out shelf CTA

**Files:**

- Modify: `apps/web/src/components/shelf/AddToShelfButton.tsx`
- Test: `apps/web/src/components/shelf/AddToShelfButton.test.tsx` (if the existing test setup supports component rendering; otherwise cover the URL helper with a unit test)

**Interfaces:**

- Add a callback URL based on `window.location.pathname + window.location.search`.
- Preserve compact-card behavior for signed-out users.

- [ ] Replace the detail-page signed-out text link with a prominent accessible button-style link labeled “Sign in to add to shelf”.
- [ ] Link to `/login?callbackUrl=...` with a properly encoded current novel URL.
- [ ] Keep authenticated select behavior unchanged.
- [ ] Verify the CTA has visible focus, dark-mode contrast, and no card click propagation issues.
- [ ] Run the focused test/lint checks.
- [ ] Commit: `feat(shelf): clarify signed-out add-to-shelf action`

### Task 4: Signed-out homepage hero and genre discovery

**Files:**

- Modify: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/components/home/HomeHero.tsx`
- Create: `apps/web/src/components/home/GenreBrowse.tsx`

**Interfaces:**

- `HomeHero` is a presentational component with browse and registration links.
- `GenreBrowse` accepts `genres: { name: string; slug: string }[]` and links to `/novels?genres=<slug>`.

- [ ] Use `auth()` in the homepage server component to determine whether the visitor is signed in.
- [ ] Render the hero only for signed-out visitors with concise value proposition copy and “Browse catalog” / “Create a free account” actions.
- [ ] Load genres alongside the existing homepage data, with a graceful empty fallback.
- [ ] Add a compact “Browse by genre” section using curated top genres and a link to all genres/tags.
- [ ] Adjust homepage spacing so the top content starts intentionally with the hero or first catalog section, eliminating the unexplained dead space.
- [ ] Verify signed-out and signed-in render paths, dark mode, mobile layout, and DB-error fallback.
- [ ] Commit: `feat(home): add signed-out discovery hero and genre browse`

### Task 5: Full verification and production smoke test

**Files:**

- No planned source changes.

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm --filter @ratemyshelf/web lint`.
- [ ] Run `pnpm test`.
- [ ] Use the running dev server to verify `/`, `/novels`, `/novels?rated=1`, genre/tag selection, reset, and a novel detail page.
- [ ] Confirm no browser console errors and that login callback URLs are correct.
- [ ] Review `git diff --check` and commit any required test fixes separately.
