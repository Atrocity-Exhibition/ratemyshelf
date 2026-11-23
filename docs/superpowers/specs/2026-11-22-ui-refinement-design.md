# RateMyShelf UI Refinement Design

## Intent

Make the main navigation and discovery flow clearer, separate profile editing
from shelf management, and give ratings and the RMS brand a recognizable
three-color visual language.

## Goals

- Replace the home hero copy with direct browse actions.
- Provide an alphabetical, description-rich genre list and description-free tag
  list that link into existing catalog filters.
- Show the user's actual profile avatar in the top-right account control.
- Keep `/dashboard` focused on shelves and lists; move profile editing to the
  user's profile page.
- Render ratings as larger hollow circles with colored numerals.
- Change the RMS logo from a green square to a white circle with black `RMS`
  text and color `Rate`, `my`, and `Shelf` red/orange/green.

## Non-goals and constraints

- No schema changes or changes to rating calculations, thresholds, or filter
  semantics.
- No upload/import UI.
- Preserve the existing `/novels` URL filter contract:
  `genres=<slug>` and `tags=<slug>`.
- Use the existing Tailwind and Lucide patterns; do not add dependencies.
- Keep dark mode, keyboard focus states, and mobile layouts usable.

## Approach

Use a new server-rendered `/genres-tags` page backed by the existing public
`tags.list` procedure and a small server-side genre aggregation. Add one
navigation destination to the profile dropdown rather than placing a long list
inside the menu. Reuse `ProfileSettings` on `/users/[username]`, gated to the
signed-in user's own profile, and remove it from the dashboard. Update the
shared `ScoreBadge` and root layout brand styles so all score surfaces and
navigation share one visual system.

## Visual direction

- Low scores: `#db3604` red.
- Mid scores: `#d66d11` orange.
- High scores: `#0eb23a` green.
- Score shape: hollow circle, colored border and numeral, no filled square.
- Logo: white circular mark with black `RMS`; wordmark segments use the same
  red/orange/green colors.
- Home actions: three compact, equal-priority browse links replacing the
  removed explanatory hero.
