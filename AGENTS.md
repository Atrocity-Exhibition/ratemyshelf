# Agent notes

## Current state

Working application exists (2026-11-20). `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `SKIP_ENV_VALIDATION=1 pnpm build` pass. Core flows are wired: catalog, search + command palette, novel detail, reviews (with helpful votes, reports, editing, sorting/pagination, spoiler stripping), public user profiles, shelves, custom lists, community tags with moderator approval, contributor submissions, admin novel/moderation queues, and email verification.

Docker services are running and the stack has been smoke-tested: migrations + trigram indexes applied, 12 novels seeded and indexed in Meilisearch, registration/login, tRPC reads/writes, review submission, and worker-driven score recalculation all verified. Dev server and worker are running on :3000. Git is initialized on `master` with a single commit (`feat: initial TrackWn full-stack application`); the working tree is clean.

The app lives in `apps/web`; the repository root only holds workspace config. Do not add Next.js files at the root — the root `next.config.js` and `tsconfig.json` are intentionally inert placeholders.

## Commands

```bash
docker compose up -d         # Postgres 16, Redis 7, Meilisearch (requires a running Docker daemon)
pnpm install                 # workspace install
pnpm dev                     # Next.js dev server on :3000
pnpm build                   # production build; needs SKIP_ENV_VALIDATION=1 without a full .env
pnpm lint                    # next lint (apps/web); db package is a no-op
pnpm typecheck               # tsc --noEmit in packages/db and apps/web
pnpm test                    # vitest in apps/web; db package is a no-op
pnpm db:generate             # prisma generate (packages/db)
pnpm db:push                 # prisma db push, dev only
pnpm db:migrate              # prisma migrate deploy
pnpm db:seed                 # idempotent seed; 12 sample novels
pnpm db:index                # bulk-index novels into Meilisearch
pnpm db:studio               # Prisma Studio
pnpm --filter @trackwn/web worker   # pg-boss workers + cron schedules
k6 run tests/load/novel-browse.js   # optional load test; needs k6 installed
```

CI order is `lint → typecheck → test → build` (`.github/workflows/ci.yml`).

## Layout and entry points

```
apps/web/src/app/            App Router pages + API routes
apps/web/src/server/root.ts  merged tRPC router
apps/web/src/server/context.ts  tRPC context: { session, db, redis, enqueue }
apps/web/src/server/routers/    novels, tags, search, reviews, shelves, lists, moderation, auth
apps/web/src/server/jobs/       pg-boss handlers + worker entrypoint
apps/web/src/trpc/          client.ts, server.ts (RSC caller), react.tsx (providers)
apps/web/src/auth.ts        Auth.js v5 config
apps/web/src/lib/           tokens, sanitize, rateLimit, slug
packages/db/prisma/         schema, migration, extras.sql, seed
packages/db/src/            client, redis, queue, search singletons
```

`@trackwn/db` is consumed as TypeScript source. `apps/web/next.config.ts` sets `transpilePackages: ["@trackwn/db"]`; keep that or imports break.

## Non-obvious gotchas

- **`serverExternalPackages` is required.** `isomorphic-dompurify` pulls in `jsdom`, whose `default-stylesheet.css` path is rewritten by webpack and breaks `next build` with `ENOENT .../.next/browser/default-stylesheet.css`. Keep `isomorphic-dompurify`, `jsdom`, `pg-boss`, `ioredis`, `meilisearch`, and `@prisma/client` in `serverExternalPackages`.
- **Trigram indexes are not in Prisma migrations.** After `pnpm db:migrate`, run `psql "$DATABASE_URL" -f packages/db/prisma/migrations/001_init/extras.sql`. CI does this explicitly.
- **Redis is lazy during builds.** `packages/db/src/redis.ts` checks `NEXT_PHASE === "phase-production-build"`; removing that guard makes builds log reconnect errors.
- **Never run `pnpm build` while `pnpm dev` is running.** Both write to `apps/web/.next`; the build replaces dev chunks with production hashes, so the browser gets 404s and `text/plain` MIME errors for `_next/static/*`. Stop dev (or move `.next` aside) before building, then restart dev with a clean `.next`.
- **Auth.js sessions are 15-minute JWTs.** Refresh tokens are opaque, stored in Redis under `refresh:{token}`, rotated on every `auth.refresh`, and replayed tokens revoke the whole family. Email verification uses single-use Redis tokens under `verify:email:{token}` sent through Resend's REST API (`lib/email.ts`). When `RESEND_API_KEY` is unset, registration auto-verifies so local sign-in works.
- **The session cookie name matters.** `lib/tokens.ts` exports `SESSION_COOKIE` (`authjs.session-token` in dev, `__Secure-authjs.session-token` in production). `auth.refresh` mints a replacement with `@auth/core/jwt`'s `encode`.
- **Reviews are gated.** A user must be 7 days old (moderators/admins bypass) and may have one review per novel (`@@unique([novelId, userId])`). Bodies are sanitized with `isomorphic-dompurify` before Prisma writes.
- **Spoilers are stripped server-side.** `reviews.forNovel` replaces the body with `[SPOILER HIDDEN]` for viewers who are not the author or a moderator; the client does not receive the spoiler text.
- **Search uses Meilisearch, not Postgres.** The browser key must be a search-only key scoped to `novels`. Novel mutations enqueue `sync-search-index`; nothing updates the index synchronously. `pnpm db:index` also applies the index settings before bulk loading.
- **The command palette is mounted in the root layout.** `Cmd/Ctrl+K` opens `components/search/CommandPalette.tsx`; it queries the same `search.novels` procedure and is separate from the `/search` page.
- **Background work needs the worker process.** `pnpm dev` does not start pg-boss. Run `pnpm --filter @trackwn/web worker` separately or score recalculation, index sync, abuse sweeps, and tag-vote resolution will not run.
- **Seed is only 12 novels.** It is idempotent via `upsert`; the plan's 500+ catalog is not loaded yet.
- **Env files have three entry points.** Next.js loads `apps/web/.env` (a symlink to the root `.env`), Prisma CLI loads `packages/db/.env` (contains only `DATABASE_URL`), and the standalone `seed`, `index`, and `worker` scripts use `tsx --env-file=../../.env`. Keep all three in sync when adding variables.
- **pg-boss queues must be created explicitly.** With pg-boss v10, `work()`/`send()` do not create queues. `registerJobs()` calls `createQueue()` sequentially for all four job names; parallel creation deadlocks on the shared queue table. Sends to a non-existent queue return `null` silently, so a missing worker means enqueued jobs vanish.
- **Meilisearch needs a search-only key.** Create one with `POST /keys` using the master key and `{"actions":["search"],"indexes":["novels"]}`, then put it in `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY`. Never expose the master key to the browser.

## Conventions

- Roles ascend `ANONYMOUS < USER < CONTRIBUTOR < MODERATOR < ADMIN`; use `roleProcedure(Role.X)` from `server/trpc.ts` for gated procedures.
- Cache reads must fall back to Postgres; `packages/db/src/redis.ts` helpers swallow Redis errors.
- Job payloads are untrusted: validate them with Zod inside handlers.
- Admin routes live under `app/admin/` and re-check the role server-side; middleware only checks for a session cookie.
- `AuditLog` is append-only by convention; moderation actions write an entry.

## Environment

`apps/web/src/env.ts` validates env at startup. Server-only: `DATABASE_URL`, `REDIS_URL`, `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `AUTH_SECRET` (min 16 chars). Client: `NEXT_PUBLIC_MEILISEARCH_HOST`, `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY`. Optional: `RESEND_API_KEY`, `EMAIL_FROM`, R2 keys, `NEXT_PUBLIC_R2_PUBLIC_URL`, `NEXT_PUBLIC_SITE_URL`. Use `.env.example` as the template; set `SKIP_ENV_VALIDATION=1` only for build/CI checks.
