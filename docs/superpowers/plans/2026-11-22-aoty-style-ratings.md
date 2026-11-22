# AOTY-Style Ratings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current mandatory 1–10 review workflow with signed-in users' required 0–100 overall ratings plus optional 1–10 dimensions and unlimited optional reviews.

**Architecture:** Extend the existing `Review` model rather than introducing a second rating model. A row represents one user's rating for one novel; nullable body and dimensions allow rating-only submissions, while the existing moderation, helpful-vote, spoiler, and pg-boss recalculation flows remain attached to that row.

**Tech Stack:** Prisma/PostgreSQL, tRPC, Zod, Next.js/React, Vitest, pg-boss.

**Spec:** `docs/superpowers/specs/2026-11-22-aoty-style-ratings-design.md`

## Global Constraints

- Only authenticated, non-banned users may submit ratings.
- `scoreOverall` is required and ranges from 0–100.
- Story, characters, and worldbuilding are optional and range from 1–10.
- Review text is optional, sanitized, and has no character limit.
- Existing overall scores migrate from 1–10 to 10–100.
- Existing unique-per-user-per-novel, moderation, helpful-vote, spoiler, rate-limit, and worker behavior remains.
- Do not add a separate `Rating` model.

## Review Focus

- Rating-only submissions must persist with a null body and null dimensions; cover in router and integration-oriented validation tests.
- A score of exactly 0 must be accepted and must not be treated as missing; cover in validation and aggregation tests.
- Missing dimensions must not lower or distort their averages; cover in score recalculation tests.
- Existing review rows and cached overall scores must migrate without losing data; cover in migration SQL review and post-migration verification.
- Empty or null spoiler bodies must never be rendered as HTML; cover in component/type updates and review display tests where practical.

---

### Task 1: Update rating validation tests

**Files:**

- Modify: `apps/web/src/lib/reviews.test.ts`
- Create or modify: `apps/web/src/lib/reviewValidation.ts` if shared validation is extracted

**Interfaces:**

- Produces the expected validation contract for `reviews.submit` and `reviews.update`: required `novelId` and `scoreOverall` (0–100), optional dimensions (1–10), optional unlimited body, and optional spoiler flag.

- [ ] **Step 1: Replace legacy tests with failing AOTY-style cases**
  - Assert `scoreOverall` accepts 0 and 100.
  - Assert scores below 0, above 100, and dimensions outside 1–10 are rejected.
  - Assert a payload containing only `novelId` and `scoreOverall` is valid.
  - Assert an empty and a very long body are valid when supplied.
  - Replace the seven-day eligibility test with an immediate authenticated-user eligibility expectation.

- [ ] **Step 2: Run the focused test file and verify it fails against the current rules**

Run:

```bash
pnpm exec vitest run apps/web/src/lib/reviews.test.ts
```

Expected: FAIL because the current schema requires a 150-character body, all dimensions, and a 1–10 overall score.

- [ ] **Step 3: Commit the red tests**

```bash
git add apps/web/src/lib/reviews.test.ts
git commit -m "test: define AOTY-style rating rules"
```

### Task 2: Migrate the Prisma review schema and existing data

**Files:**

- Modify: `packages/db/prisma/schema.prisma:167-192`
- Create: `packages/db/prisma/migrations/002_aoty_style_ratings/migration.sql`

**Interfaces:**

- Prisma `Review` exposes nullable `body`, `scoreStory`, `scoreCharacters`, and `scoreWorldBuilding`; `scoreOverall` remains required.

- [ ] **Step 1: Write the migration SQL**
  - Drop `NOT NULL` from `Review.body`, `scoreStory`, `scoreCharacters`, and `scoreWorldBuilding`.
  - Multiply existing `Review.scoreOverall` values by 10.
  - Multiply existing `NovelScoreCache.avgOverall` and `bayesianScore` values by 10 so cached overall values remain on the new scale.
  - Do not remove `scoreTranslation` in this migration; preserve it for compatibility with existing rows and follow-up cleanup.

- [ ] **Step 2: Update `schema.prisma` to match the migration**
  - Use `String?` for `body`.
  - Use `Int?` for the three optional dimensions.
  - Keep `scoreOverall Int`.

- [ ] **Step 3: Generate Prisma and verify schema consistency**

Run:

```bash
pnpm db:generate
pnpm typecheck
```

Expected: Prisma generation succeeds; typecheck may identify call sites that still assume non-null review fields and will be addressed in later tasks.

- [ ] **Step 4: Commit the schema migration**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/002_aoty_style_ratings/migration.sql
git commit -m "feat: migrate reviews to AOTY-style ratings"
```

### Task 3: Implement server validation, submission, editing, and aggregation

**Files:**

- Modify: `apps/web/src/server/routers/reviews.ts`
- Modify: `apps/web/src/server/jobs/recalculateScore.ts`
- Modify: `apps/web/src/lib/reviews.test.ts`

**Interfaces:**

- `reviews.submit` accepts `{ novelId, scoreOverall, scoreStory?, scoreCharacters?, scoreWorldBuilding?, body?, containsSpoiler? }`.
- `reviews.update` accepts the same optional fields plus `id`.
- `recalculateNovelScore(novelId: string)` continues writing `NovelScoreCache`, with overall values on 0–100 and optional dimensions averaged only across submitted values.

- [ ] **Step 1: Add failing server-rule tests**
  - Validate rating-only input.
  - Validate 0 overall.
  - Validate unlimited body input.
  - Assert no account-age rejection for a newly created eligible account.
  - Assert optional dimensions are omitted rather than defaulted.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
pnpm exec vitest run apps/web/src/lib/reviews.test.ts
```

- [ ] **Step 3: Update `reviewsRouter` input schemas**
  - Remove the 150-character minimum and 10,000-character maximum.
  - Make `body`, `scoreStory`, `scoreCharacters`, and `scoreWorldBuilding` optional.
  - Change `scoreOverall` to integer min 0/max 100.
  - Retain `scoreTranslation` only if required to read/update legacy rows; remove it from the active submit/edit contract.
  - Remove `MIN_ACCOUNT_AGE_DAYS` and the age check while retaining banned-account protection and rate limiting.
  - Sanitize only non-empty bodies and store empty bodies as `null`.
  - Force `containsSpoiler` false when no body is present.

- [ ] **Step 4: Update score recalculation**
  - Change Bayesian prior mean from 5.0 to 50.0.
  - Keep optional dimension averaging null-aware.
  - Ensure overall score 0 is included in weighted calculations.
  - Remove translation from active score-cache aggregation, or leave its legacy cache value untouched until an explicit cleanup migration; the UI must no longer require or display it.

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
pnpm exec vitest run apps/web/src/lib/reviews.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit the server behavior**

```bash
git add apps/web/src/server/routers/reviews.ts apps/web/src/server/jobs/recalculateScore.ts apps/web/src/lib/reviews.test.ts
git commit -m "feat: support rating-only submissions"
```

### Task 4: Update shared review types and display components

**Files:**

- Modify: `apps/web/src/types/catalog.ts`
- Modify: `apps/web/src/components/review/ReviewCard.tsx`
- Modify: `apps/web/src/components/common/ScoreBadge.tsx`
- Modify: `apps/web/src/components/novel/NovelScorePanel.tsx`
- Modify: `apps/web/src/components/admin/FlaggedReviews.tsx` as needed for nullable bodies

**Interfaces:**

- `ReviewData.body`, `scoreStory`, `scoreCharacters`, and `scoreWorldBuilding` are nullable.
- Overall badges display on a 0–100 scale.
- Optional dimension badges and bars display only when values are numeric.

- [ ] **Step 1: Add/update display tests or type-level fixtures for null dimensions and null body**
  - Assert a rating-only review can be represented.
  - Assert overall score 0 displays as `0`, not as an empty/missing score.

- [ ] **Step 2: Update types and components**
  - Use `ScoreBadge scale={100}` for overall scores.
  - Make score bars accept a scale so overall uses 100 and dimensions use 10.
  - Hide optional dimension chips and bars when null.
  - Render no review body section for rating-only entries.
  - Keep spoiler UI disabled when body is null.
  - Remove active translation display.
  - Make moderation preview safe for null bodies.

- [ ] **Step 3: Run checks**

Run:

```bash
pnpm typecheck
pnpm lint
```

- [ ] **Step 4: Commit shared display changes**

```bash
git add apps/web/src/types/catalog.ts apps/web/src/components/review apps/web/src/components/common/ScoreBadge.tsx apps/web/src/components/novel/NovelScorePanel.tsx apps/web/src/components/admin/FlaggedReviews.tsx
git commit -m "feat: display 100-point ratings and optional review fields"
```

### Task 5: Update the rating form and complete verification

**Files:**

- Modify: `apps/web/src/components/review/ReviewForm.tsx`
- Modify: `apps/web/src/components/review/ScoreSlider.tsx`
- Modify: `apps/web/src/components/review/ReviewCard.tsx` edit form section

**Interfaces:**

- Authenticated users can submit an overall-only rating.
- `ScoreSlider` supports explicit `min`, `max`, and display scale while preserving the existing 1–10 default for dimensions.

- [ ] **Step 1: Add failing form behavior tests or component fixtures**
  - Overall slider/input supports 0–100.
  - Dimension controls are optional and 1–10.
  - Empty review text does not disable submission.
  - Spoiler checkbox is unavailable or ignored without review text.

- [ ] **Step 2: Implement the form**
  - Make overall required with a 0–100 control.
  - Add explicit opt-in controls for each optional dimension rather than silently submitting default 5s.
  - Make the textarea optional and remove the minimum counter.
  - Submit only selected optional dimensions.
  - Change copy from “write a review” to rating/review language.
  - Reset all optional controls after successful submission.

- [ ] **Step 3: Update editing**
  - Allow changing or clearing optional dimensions and body.
  - Preserve the one-entry-per-user-per-novel rule.

- [ ] **Step 4: Run the complete project checks**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
SKIP_ENV_VALIDATION=1 pnpm build
```

Expected: all commands pass.

- [ ] **Step 5: Verify the database migration in a disposable/local database**

Run:

```bash
pnpm db:migrate
```

Verify an existing 1–10 overall becomes 10–100, existing dimensions remain 1–10, and rating-only rows can be inserted.

- [ ] **Step 6: Commit the form and final verification**

```bash
git add apps/web/src/components/review
git commit -m "feat: add AOTY-style rating form"
```

### Task 6: End-to-end smoke test

- [ ] Create or use a newly registered account.
- [ ] Submit an overall-only rating of 0 and confirm it appears as `0/100`.
- [ ] Submit a rating with optional dimensions but no body.
- [ ] Submit a long review body and confirm it renders safely.
- [ ] Edit the entry, clear one dimension, and confirm it disappears from the display.
- [ ] Confirm the Railway worker recalculates the novel score.
- [ ] Confirm moderation, spoiler masking, helpful voting, and deletion still work for entries with and without bodies.

## Verification update

The implementation and follow-up review fixes were verified with:

- `pnpm --filter @ratemyshelf/web exec vitest run src/lib/reviews.test.ts src/lib/search.test.ts src/components/common/ScoreBadge.test.ts`
- `pnpm test`
- `pnpm typecheck`
- `pnpm --filter @ratemyshelf/web lint`
- `SKIP_ENV_VALIDATION=1 pnpm build`
- `pnpm db:migrate`
- `pnpm db:index` (38 novels reindexed)

The focused tests cover shared review validation, rating-only/null-body input, zero
overall scores, optional dimensions, null-aware aggregation, 0–100 search
thresholds/filters, and explicit score-scale color handling.
