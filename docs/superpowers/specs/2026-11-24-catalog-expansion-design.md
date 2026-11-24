# Catalog Expansion Design

## Intent

Expand RateMyShelf's discovery catalog by enriching every existing novel with
more useful genres and tags, then adding a curated first batch of 24 new
novels. NovelUpdates and Scribble Hub may be used as research references for
titles, classifications, aliases, and source links, but RMS will not scrape
either site or copy their descriptions, covers, ratings, or user content.

## Goals

- Add meaningful, normalized tags and genres to the existing catalog.
- Add 24 new novels with original RMS synopsis text, verified author, country,
  status, aliases, chapter count where available, and source attribution.
- Keep the catalog balanced across Chinese, Korean, and English-language
  webnovels; include Japanese works only when metadata can be verified.
- Preserve the existing seed-as-source-of-truth workflow and idempotent upserts.
- Ensure every new or changed classification is visible to catalog filters.
- Use only cover URLs that are independently verified as official or licensed;
  use the existing no-cover placeholder when that cannot be established.

## Non-goals and anti-goals

- No direct scraper, crawler, or automated extraction from NovelUpdates or
  Scribble Hub.
- No copied synopsis, cover image, rating, review, ranking, or chapter text.
- No user-facing upload/import workflow.
- No deletion of existing tags or novel associations solely to normalize them.
- No claim that source-site genre labels are authoritative; classifications are
  RMS editorial metadata.

## Existing constraints

- Tags are global `Tag` records with a category and approval state.
- Genres are currently per-novel `GenreLink` rows, not a standalone genre table.
- Seed records live in `packages/db/prisma/seed.ts` and
  `packages/db/prisma/catalogCandidates.ts`.
- Novel source attribution is stored in `externalLinks` from `source` and
  `sourceUrl`.
- Seed validation requires unique slugs/titles/aliases and at least 10 CN, KR,
  and EN novels.

## Approaches considered

### 1. Curated, seed-backed expansion — selected

Research source sites manually, verify each candidate against an appropriate
official publisher/author/platform page where possible, write original RMS
copy, and commit the resulting metadata to the seed files. This is auditable,
reproducible, and consistent with the current application.

### 2. Authorized API or licensed feed

Build an ingestion adapter only if a source provides explicit API/feed
permission. This could reduce manual work, but neither named site is currently
an RMS integration, and it would add operational and licensing complexity.
This remains a future option, not part of this batch.

### 3. Direct scraping

Rejected because it is brittle, creates terms-of-service and attribution
risks, and conflicts with RMS's no-unauthorized-scraping policy.

## Data plan

### Existing novels

- Review every existing novel's current genre list.
- Add only normalized, useful genre values; avoid near-duplicates such as
  inconsistent casing or synonymous labels.
- Expand global `TAGS` with missing recurring concepts and assign tags to
  relevant novels.
- Give each new tag a stable slug, category, and concise original description
  where the UI supports it.
- Do not remove existing classifications unless they are objectively
  duplicate or invalid; record any correction in the seed diff.

### New novels

Add 24 records to `catalogCandidates.ts`, with a target distribution of
approximately 8 CN, 8 KR, and 8 EN works. Each record must include:

- unique slug, title, author, country, status, synopsis, tags, genres, aliases;
- source name and a canonical source URL;
- original synopsis text written for RMS;
- independently verified cover URL or no cover;
- chapter count only when the value is reliably available.

NovelUpdates and Scribble Hub links can be retained as discovery/reference
links when appropriate, but the record should prefer an official or licensed
canonical source link when one exists.

## Verification

- Add seed validation for any newly introduced global tag slugs and candidate
  references so a typo cannot silently drop a tag association.
- Run typecheck, lint, tests, and seed validation.
- Run the idempotent seed against the intended database, then verify counts,
  tag/genre associations, source links, no duplicate titles/slugs, and country
  balance.
- Reindex Meilisearch after the seed and verify genre/tag filtering and search.

## Approval

This design requires approval before implementing the metadata batch. The
remaining builder decisions are the exact 24 titles, precise tag vocabulary,
and source-by-source verification; those will be recorded in the seed diff.
