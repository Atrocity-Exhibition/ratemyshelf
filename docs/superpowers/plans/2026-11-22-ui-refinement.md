# RateMyShelf UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine RateMyShelf navigation, discovery, profile ownership, score badges, and branding according to the approved UI design.

**Architecture:** Keep the existing App Router, tRPC, Tailwind, and Prisma data model. Add a focused server-rendered discovery route, reuse the existing profile editor on the profile route, and centralize score/brand changes in shared components.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS, tRPC, Prisma, Vitest, Lucide.

**Spec:** `docs/superpowers/specs/2026-11-22-ui-refinement-design.md`

## Global Constraints

- Do not change the database schema or rating/filter logic.
- Use existing `/novels?genres=<slug>` and `/novels?tags=<slug>` URLs.
- Do not add dependencies or upload/import UI.
- Preserve dark mode, focus states, and responsive behavior.
- Use exact rating colors `#db3604`, `#d66d11`, and `#0eb23a`.

## Review Focus

- Genre/tag lists must be alphabetized and link to the correct filter query.
- The profile editor must not appear on `/dashboard` and must only be available on the signed-in user's own profile.
- A missing avatar must still render a usable initial/icon in both profile and header controls.
- Score badges must preserve null values, 0–100 scores, 0–10 scores, and existing thresholds while changing only presentation.
- The home actions and logo must remain readable and usable in dark mode and on narrow screens.

### Task 1: Add catalog discovery page

**Files:**

- Create: `apps/web/src/app/genres-tags/page.tsx`
- Create: `apps/web/src/components/catalog/DiscoveryLists.tsx` if a client boundary is needed; prefer server markup
- Modify: `apps/web/src/server/routers/novels.ts` only if a minimal public genre-list query is required
- Modify: `apps/web/src/server/routers/tags.ts` only if the existing public list response cannot support the page
- Test: `apps/web/src/lib/catalogQuery.test.ts` or a focused new discovery test

**Interfaces:**

- Consumes: public tag records from `api.tags.list({})`; genre names/slugs from the existing catalog data.
- Produces: links to `/novels?genres=<slug>` and `/novels?tags=<slug>`.

- [ ] **Step 1: Write the failing test** for stable alphabetical ordering and exact genre/tag query-link construction.
- [ ] **Step 2: Run the focused test** and confirm it fails before the helper/page exists.
- [ ] **Step 3: Implement the page** with alphabetically sorted genres including descriptions, alphabetically sorted approved tags without descriptions, and empty-state copy for either list if no records exist.
- [ ] **Step 4: Run the focused test** and confirm it passes.
- [ ] **Step 5: Verify** the page supports keyboard focus and responsive two-column/stacked layouts.

### Task 2: Refine home and navigation/profile flows

**Files:**

- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/components/navigation/ProfileDropdown.tsx`
- Modify: `apps/web/src/app/dashboard/page.tsx`
- Modify: `apps/web/src/app/users/[username]/page.tsx`
- Modify: `apps/web/src/components/user/ProfileSettings.tsx` only as needed for profile-page ownership
- Test: `apps/web/src/components/navigation/ProfileDropdown.test.tsx` if the project test setup supports component tests; otherwise verify with route/browser smoke tests

**Interfaces:**

- Consumes: existing session user, `avatarUrl`, `ProfileSettings`, and discovery route.
- Produces: `/genres-tags` navigation, profile-owned edit control, and a home action strip.

- [ ] **Step 1: Add/adjust tests** covering the absence of the old hero copy, presence of three browse destinations, and removal of `ProfileSettings` from dashboard markup.
- [ ] **Step 2: Run focused tests** and confirm the new expectations fail.
- [ ] **Step 3: Replace the home hero** with Browse catalog, Top novels, and Genres & tags actions while retaining the existing catalog sections.
- [ ] **Step 4: Add the Genres & tags dropdown destination** and update the visible navigation only if needed for responsive clarity.
- [ ] **Step 5: Remove profile editing from dashboard** and render it on the signed-in user's own `/users/[username]` page, with an Edit profile control and no edit control on other users' pages.
- [ ] **Step 6: Ensure the top-right account control uses the available profile avatar consistently**, retaining the initial/icon fallback.
- [ ] **Step 7: Run focused tests and route smoke checks** for `/`, `/dashboard`, `/users/<current-user>`, `/users/<other-user>`, and `/genres-tags`.

### Task 3: Restyle shared score badges

**Files:**

- Modify: `apps/web/src/components/common/ScoreBadge.tsx`
- Modify: `apps/web/src/components/common/ScoreBadge.test.ts`
- Modify: `apps/web/src/app/globals.css` only if a shared circle style is cleaner than Tailwind classes

**Interfaces:**

- Consumes: existing `ScoreBadge` props: `score`, `label`, `size`, and `scale`.
- Produces: unchanged score values and thresholds with hollow-circle presentation.

- [ ] **Step 1: Extend the score tests** to assert exact color tokens/classes for low, middle, and high scores and null fallback behavior.
- [ ] **Step 2: Run the focused score test** and confirm the new expectations fail.
- [ ] **Step 3: Update `getScoreColor`** to use the exact red/orange/green colors and replace filled rectangular rendering with larger hollow circles for `sm`, `md`, and `lg` variants.
- [ ] **Step 4: Preserve display rules**: rounded integer for scale 100, one decimal for scale 10, and `—` for missing values.
- [ ] **Step 5: Run the focused score test** and check score usage in cards, reviews, search results, and novel detail code paths.

### Task 4: Apply RMS brand treatment

**Files:**

- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css` only if needed for exact brand color utilities
- Test: visual/browser smoke verification

**Interfaces:**

- Consumes: the approved brand colors from the design spec.
- Produces: white circular `RMS` mark with black text and segmented Rate/my/Shelf wordmark.

- [ ] **Step 1: Implement the logo and wordmark** in the root layout without changing navigation routes.
- [ ] **Step 2: Add readable light/dark variants** while keeping the mark white and the RMS text black.
- [ ] **Step 3: Verify keyboard focus, contrast, and mobile truncation** in the header.

### Task 5: Full verification

**Files:**

- Modify only files identified above; do not touch unrelated existing worktree changes.

- [ ] **Step 1: Run `pnpm typecheck`.**
- [ ] **Step 2: Run `pnpm test`.**
- [ ] **Step 3: Run `pnpm lint`.**
- [ ] **Step 4: Start/use the existing dev server and smoke-test home, dropdown, profile, dashboard, discovery, catalog links, and representative score badges at desktop and narrow widths.**
- [ ] **Step 5: Review `git diff` and confirm unrelated `.env.example`, `package.json`, and docs changes remain untouched.**
- [ ] **Step 6: Commit only the focused UI changes with message `feat: refine navigation and rating UI`.**
