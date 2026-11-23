# Genre and Tag Include/Exclude Filters

## Intent

Make genres and tags distinct, useful catalog filters. Genres are broad
classification data; tags remain descriptive/community metadata.

## Current State

- `Novel` already has a separate `GenreLink[]` relation.
- Novel creation/editing and Meilisearch indexing already persist genres.
- Catalog browsing currently filters only by tags.
- Search has basic tag/genre filters, but no exclude filters and no catalog
  UI for genres.
- Existing `TagCategory.GENRE` data remains valid legacy tag data; this change
  does not migrate or delete it.

## Approved Behavior

Expose separate filter groups:

- Genres: include and exclude
- Tags: include and exclude

Include semantics are AND: a novel must contain every included value.
Exclude semantics are NOT ANY: a novel is rejected if it contains any excluded
value. Include and exclude values are normalized by slug and duplicates are
removed.

Example:

```text
Genres include: Fantasy, Romance
Genres exclude: Horror
Tags include: Slow Burn
Tags exclude: Harem, Tragedy
```

Filters work consistently for:

- `/novels` catalog browsing backed by Postgres
- `/novels?q=...` search backed by Meilisearch
- URL state and pagination/reset links
- Existing admin novel genre/tag editing

Use URL parameters `genres`, `excludeGenres`, `tags`, and `excludeTags`,
encoded as comma-separated slugs.

## UI

Extend the existing catalog `FilterPanel` with four compact comma-separated
inputs: included genres, excluded genres, included tags, and excluded tags.
Keep the current status, country, and sort controls. The controls update URL
state on blur, matching the existing tag filter behavior.

## Server and Search

Extend `novels.list` with `genreSlugs`, `excludeGenreSlugs`, `tagSlugs`, and
`excludeTagSlugs`. Postgres uses one relation `some` clause per included slug
and a relation `none` clause for exclusions.

Extend the search input with the corresponding four arrays. Build Meilisearch
filters that require every included genre/tag and reject any excluded
genre/tag. Search documents retain display-name `tags`/`genres` fields for
text search and add `tagSlugs`/`genreSlugs` fields for exact filtering. The
new slug fields are filterable in Meilisearch.

## Non-Goals

- No new database table or migration.
- No conversion of legacy `TagCategory.GENRE` rows into `GenreLink` rows.
- No changes to tag moderation or voting.
- No bulk import pipeline in this change.

## Verification

Add tests for:

- Postgres filter input validation and include/exclude semantics.
- Meilisearch filter generation for multiple included and excluded values.
- URL parsing and preservation through pagination/reset links.
- Existing behavior when no new filters are supplied.
