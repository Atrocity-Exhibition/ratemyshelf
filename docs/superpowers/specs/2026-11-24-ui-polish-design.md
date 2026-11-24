# UI Polish: Hero Spacing, Mobile Collapsible Filters, Novel Details & Genre Renaming Design

## Intent and Why

Refine the user experience across the homepage, catalog filtering, and novel detail pages based on direct feedback:

1. Simplify homepage messaging, remove redundant taglines, and remove the accidental 40px top gap pushing the hero down.
2. Optimize mobile catalog browsing by allowing phone users to collapse the long vertical filter panel so novel cards are visible without extensive scrolling.
3. Improve novel detail discovery by moving known aliases directly into the synopsis block, styling and repositioning community tags to the bottom of the page, and upgrading external links to a dedicated "Official Links" section.
4. Harmonize terminology across the application by replacing "themes" with "genre" in user-facing UI.

## Goals

- Clean, tight hero section on homepage without "Read with intention", with button copy "Create account", and without unintended top margin.
- Collapsible filter panel on `< lg` viewport, defaulting to compact bar with active filter count; always expanded as a sidebar on `>= lg`.
- Known aliases integrated directly under the description/original title on novel detail pages.
- External links transformed into an "Official Links" section with clean badges supporting reading sites, fandom/wikis, reddit, discord, and canonical platforms.
- `TagVotePanel` relocated to the bottom of the novel page with proper light/dark theme styling.
- All user-facing occurrences of "themes" renamed to "genres".

## Non-Goals

- Changing backend database schemas or Prisma enum definitions (`TagCategory.THEME` remains in the DB schema for compatibility; UI displays "Genre").
- Changing search engine ranking algorithms or rating calculation logic.

## Detailed Requirements

### 1. Homepage Hero & Spacing

- `apps/web/src/components/home/HomeHero.tsx`:
  - Delete `<p className="... uppercase tracking-[0.2em] ...">Read with intention</p>`.
  - Update secondary CTA button text from `"Create a free account"` to `"Create account"`.
- `apps/web/src/app/page.tsx`:
  - Isolate or reposition `<h1 className="sr-only">` so that Tailwind's `space-y-10` does not inject a 40px `margin-top` onto `<HomeHero />`.

### 2. Collapsible Filter Panel on Mobile

- `apps/web/src/components/catalog/FilterPanel.tsx`:
  - Add client state `const [isExpanded, setIsExpanded] = useState(false)`.
  - Header displays a mobile toggle button (`lg:hidden`) with `Filter` icon, active filter count badge (e.g., `"2 active"` when filters are set), and a `ChevronDown`/`ChevronUp` indicator.
  - The filter body (status, country, sort, rated-only, genre/tag chips, active chips) is conditioned:
    - On mobile (`< lg`): visible only when `isExpanded` is true.
    - On desktop (`>= lg`): always visible (`className="space-y-4 ... [expanded on mobile] lg:block"`).

### 3. Novel Detail Page Layout & Official Links

- `apps/web/src/components/novel/NovelHeader.tsx`:
  - Accept `aliases: { id: string; alias: string }[]` from `novel`.
  - Directly beneath the synopsis (or alongside original title), if `novel.aliases.length > 0`, render:
    `Also known as: [Alias 1], [Alias 2], ...` with subtle styling (`text-xs text-neutral-500 dark:text-neutral-400`).
- Remove standalone `AliasesSection` component or merge it cleanly into `NovelHeader`.
- `apps/web/src/components/novel/ExternalLinksPanel.tsx`:
  - Rename heading to `"Official Links"` (or `"Official & Community Links"`).
  - Clean light/dark badges:
    `rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:text-white`.
  - Include platform helper icons/labels where recognizable (Webnovel, KakaoPage, Munpia, Qidian, Royal Road, Reddit, Discord, Fandom/Wiki).
- Move `TagVotePanel` to the bottom of `apps/web/src/app/novels/[slug]/page.tsx` (below Reviews).
- In `TagVotePanel.tsx`:
  - Replace hardcoded `bg-slate-900/40 text-slate-200 border-slate-800/80` with design tokens:
    `border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#16171c]`.
  - Replace form input colors with `bg-neutral-50 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200`.

### 4. Rename "Themes" to "Genre" Everywhere

- `NovelTagList.tsx`:
  - Heading changed from `"Tags & Themes"` to `"Genres & Tags"`.
  - Render both `novel.genres` (linking to `/novels?genres=...`) and `novel.tags` (linking to `/novels?tags=...`).
- `TagVotePanel.tsx`:
  - Label for `THEME` in category dropdown changed to `"Genre"`.
- `apps/web/src/app/genres-tags/page.tsx`:
  - Replace "themes" with "genres" in category descriptions.
