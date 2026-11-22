# RateMyShelf (RMS)

Community catalog, multi-dimensional rating, review and reading-shelf platform for webnovels. RateMyShelf indexes metadata and external chapter links; it does not host chapters.

## Stack

- Next.js 15 App Router + TypeScript
- tRPC v11 + TanStack Query
- Auth.js v5 (credentials, JWT sessions, Redis refresh tokens)
- PostgreSQL 16 + Prisma
- Meilisearch for fuzzy title/alias search
- Redis for caching and rate limits
- pg-boss for background jobs
- Tailwind CSS

## Local setup

```bash
cp .env.example .env
# Generate a real AUTH_SECRET, e.g. node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
ln -s ../../.env apps/web/.env          # Next.js reads .env from the app directory
grep '^DATABASE_URL=' .env > packages/db/.env  # Prisma CLI reads .env from packages/db
docker compose up -d                    # Postgres, Redis, Meilisearch
pnpm install
pnpm db:generate
pnpm db:migrate                         # or: pnpm db:push for a throwaway database
docker compose exec -T postgres psql -U trackwn -d trackwn \
  -f - < packages/db/prisma/migrations/001_init/extras.sql
pnpm db:seed
pnpm db:index                           # requires Meilisearch running
pnpm dev
```

Create a search-only Meilisearch key before starting the app, then put it in
`NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY` in `.env`:

```bash
curl -X POST http://localhost:7700/keys \
  -H 'Authorization: Bearer masterKey' -H 'Content-Type: application/json' \
  -d '{"description":"RateMyShelf browser search key","actions":["search"],"indexes":["novels"],"expiresAt":null}'
```

Run the background worker in a second terminal:

```bash
pnpm --filter @ratemyshelf/web worker
```

## Commands

```bash
pnpm dev              # Next.js on :3000
pnpm build            # production build
pnpm lint             # next lint
pnpm typecheck        # tsc --noEmit across packages
pnpm test             # vitest (passes with no tests)
pnpm db:generate      # prisma generate
pnpm db:push          # prisma db push (dev only)
pnpm db:migrate       # prisma migrate deploy
pnpm db:seed          # idempotent seed
pnpm db:index         # bulk-index novels into Meilisearch
pnpm db:studio        # Prisma Studio
```

CI order: `lint → typecheck → test → build`.

Load test (optional, needs k6): `k6 run tests/load/novel-browse.js`.

## Notes

- Trigram indexes live in `packages/db/prisma/migrations/001_init/extras.sql`; Prisma migrations do not create them. Run that file after every fresh migration.
- The Meilisearch client key exposed to the browser must be a search-only key scoped to the `novels` index.
- Reviews require an account older than seven days; moderators and admins bypass the gate.
- With `RESEND_API_KEY` set, new accounts must verify their email before signing in. Without it, registration auto-verifies for local development; `NEXT_PUBLIC_SITE_URL` should point at the deployment so verification links resolve correctly.
- Contributors can add novels at `/novels/new`. Moderators can hide entries at `/admin/novels`; hidden novels are removed from the catalog and search index.
- Spoiler review bodies are replaced with a sentinel server-side for viewers who are not the author or a moderator.
