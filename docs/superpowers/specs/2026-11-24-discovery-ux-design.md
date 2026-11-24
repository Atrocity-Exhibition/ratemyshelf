# Discovery UX Design

## Intent

Improve the first-time visitor experience and make catalog discovery easier
without expanding the product beyond its current rating, shelf, and catalog
flows.

## Goals

- Make adding a novel to a shelf an obvious action for signed-out visitors.
- Replace fragile free-text catalog filters with discoverable controls.
- Preserve URL-driven filtering, including AND semantics for included genres/tags
  and reject-any semantics for excluded genres/tags.
- Add a concise homepage value proposition for signed-out visitors.
- Replace the homepage's visually empty opening area with intentional hero
  content.
- Present homepage genres as a compact browse/discovery section rather than
  relying on dense card labels.

## Non-goals

- No recommendation engine, social feed, or new rating model.
- No catalog import/upload workflow.
- No full autocomplete search infrastructure.
- No changes to authenticated shelf behavior.

## Approach

The implementation uses the existing server-rendered App Router pages, tRPC
catalog data, NextAuth session state, and URL query format. Genre and tag
controls will be selectable chips populated from the existing catalog metadata.
Active selections will be removable and remain synchronized with the URL.
Signed-out shelf actions will link through the existing login route while
preserving the novel destination.

The homepage hero is rendered only when there is no authenticated session, so
signed-in users go directly to their catalog content. The hero will contain a
short value proposition and two actions: browse the catalog and create an
account. The homepage will also include a limited “Browse by genre” link row
based on the most-used genres, with a fallback to the available sorted genre
list.

## UX details

- Catalog filters retain status, country, sort, search, pagination, and URL
  compatibility.
- Include filters use multi-select chips; each selected value is an independent
  required relation clause.
- Exclude filters use multi-select chips; any selected excluded value rejects a
  novel.
- A “Rated only” toggle is represented by a URL query parameter and works
  independently of score sorting.
- Signed-out detail-page shelf action is a clear button, not an inline status
  link. Its login URL includes a callback to the current novel page.
- Homepage spacing is intentional: the signed-out hero is the first content
  block; authenticated users retain compact section spacing.

## Constraints

- Follow existing Tailwind, Open Sans, dark-mode, and component conventions.
- Do not run a production build while the development server is active.
- Keep the existing catalog API and Prisma relation semantics unless a small
  query extension is required for rated-only behavior.
- Verify typecheck, lint, tests, and browser behavior.
