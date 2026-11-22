# Deploying RateMyShelf (RMS)

The app is split into two processes:

| Process    | What it runs                                                                                  | Where it goes                                               |
| ---------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Web**    | Next.js 15 (App Router, tRPC, Auth.js)                                                        | Vercel                                                      |
| **Worker** | pg-boss consumers (score recalculation, search-index sync, abuse sweeps, tag-vote resolution) | Any always-on container host (Railway, Fly.io, Render, VPS) |

The worker **cannot** run on Vercel serverless functions: pg-boss keeps long-lived Postgres sessions and polls for jobs. Deploy `Dockerfile.worker` to a container host.

```
Browser ──▶ Vercel (Next.js) ──▶ Postgres (Neon)
                    │  │  └────▶ Redis (Upstash)
                    │  └───────▶ Meilisearch (Cloud)
                    └── enqueue ─▶ Postgres (pgboss schema) ◀── Worker container
```

## 1. Provision services

| Service        | Recommended                                         | Notes                                                                                                           |
| -------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Postgres 16    | Neon (Vercel integration)                           | Use the **pooled** connection string for the web app; keep the **direct** string for migrations and the worker. |
| Redis 7        | Upstash                                             | Use the TCP endpoint (`rediss://…`), not the REST API. `ioredis` needs TCP.                                     |
| Meilisearch    | Meilisearch Cloud, or the official Railway template | Needs a host URL and an API key.                                                                                |
| Object storage | Cloudflare R2                                       | Optional; uploads fall back to the local filesystem without it (not durable on Vercel).                         |
| Email          | Resend                                              | Optional in dev; **required** in production, otherwise new accounts are auto-verified.                          |

## 2. Prepare the database (run once, from your machine)

```bash
export DATABASE_URL="postgresql://…direct…"   # direct, not pooled
pnpm db:deploy        # prisma migrate deploy + extras.sql (pg_trgm + trigram indexes)
pnpm db:seed          # 38 sample novels + 19 tags (optional, idempotent)
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' pnpm db:admin
```

`pnpm db:deploy` is idempotent and is the command to re-run on every schema release. It replaces the old manual `psql … -f extras.sql` step.

## 3. Create the Meilisearch search-only key

With the master key:

```bash
curl -X POST "$MEILISEARCH_HOST/keys" \
  -H "Authorization: Bearer $MEILISEARCH_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"description":"RMS browser search key","actions":["search"],"indexes":["novels"],"expiresAt":null}'
```

Put the returned key in `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY`. Then index the catalog:

```bash
pnpm db:index         # applies index settings + bulk loads novels
```

**Required after deploying the genre/tag filter release:** run `pnpm db:index`
against the production database and Meilisearch credentials. This rebuilds
existing documents with the `genreSlugs` and `tagSlugs` fields and applies
their filterable-attribute settings; without it, the new filters will not
work for existing novels.

Novel mutations enqueue `sync-search-index` jobs, so the worker must be running for the index to stay current.

## 4. Deploy the web app to Vercel

1. **Add New → Project → import `Atrocity-Exhibition/ratemyshelf`.**
2. **Root Directory:** `apps/web` (leave “Include files outside the root directory” enabled so the pnpm workspace resolves).
3. Framework preset: **Next.js**. `apps/web/vercel.json` already sets the monorepo install/build commands:
   - install: `cd ../.. && pnpm install --frozen-lockfile`
   - build: `cd ../.. && pnpm --filter @ratemyshelf/db generate && pnpm --filter @ratemyshelf/web build`
4. **Environment variables** (Production + Preview):

| Variable                                                                                                                    | Web | Worker | Notes                                                            |
| --------------------------------------------------------------------------------------------------------------------------- | --- | ------ | ---------------------------------------------------------------- |
| `DATABASE_URL`                                                                                                              | ✅  | ✅     | Pooled URL for web; direct URL for worker.                       |
| `QUEUE_DATABASE_URL`                                                                                                        | ✅  | ✅     | Direct URL for pg-boss. Falls back to `DATABASE_URL` when unset. |
| `REDIS_URL`                                                                                                                 | ✅  | ✅     | `rediss://…` Upstash TCP endpoint.                               |
| `MEILISEARCH_HOST`                                                                                                          | ✅  | ✅     | `https://…`                                                      |
| `MEILISEARCH_API_KEY`                                                                                                       | ✅  | ✅     | Admin/search key used server-side.                               |
| `NEXT_PUBLIC_MEILISEARCH_HOST`                                                                                              | ✅  | —      | Same host, exposed to the browser.                               |
| `NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY`                                                                                        | ✅  | —      | Search-only key.                                                 |
| `AUTH_SECRET`                                                                                                               | ✅  | —      | `openssl rand -base64 48`. Changing it invalidates all sessions. |
| `NEXT_PUBLIC_SITE_URL`                                                                                                      | ✅  | —      | `https://your-domain` — used by sitemap, robots and email links. |
| `RESEND_API_KEY`, `EMAIL_FROM`                                                                                              | ✅  | —      | Required for verification/reset emails.                          |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `NEXT_PUBLIC_R2_PUBLIC_URL` | ✅  | —      | Image uploads.                                                   |

5. Deploy. Add the custom domain under **Settings → Domains**, then update `NEXT_PUBLIC_SITE_URL` to that domain and redeploy.

> Region: set the Vercel function region to the same continent as the Postgres instance (e.g. `bom1` for Mumbai) to avoid cross-region latency on every tRPC call.

## 5. Deploy the worker

Railway (simplest):

1. **New → Deploy from GitHub repo**, same repository.
2. Railway detects `Dockerfile.worker`; if not, set the Dockerfile path explicitly and leave the build context at the repo root.
3. Add the worker env vars from the table above (`DATABASE_URL`/`QUEUE_DATABASE_URL` = direct URL, `REDIS_URL`, `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`).
4. Start command is baked into the image: `pnpm --filter @ratemyshelf/web worker:prod`.
5. Do **not** enable sleeping/scale-to-zero; the worker must stay connected to poll jobs.

Fly.io equivalent:

```bash
fly launch --dockerfile Dockerfile.worker --no-deploy
fly secrets set DATABASE_URL=… QUEUE_DATABASE_URL=… REDIS_URL=… MEILISEARCH_HOST=… MEILISEARCH_API_KEY=…
fly deploy
```

## 6. Post-deploy checklist

- [ ] `GET https://your-domain/api/health` → `{"status":"ok"}` (checks Postgres, Redis, Meilisearch).
- [ ] Register an account → verification email arrives (Resend domain verified, `EMAIL_FROM` on that domain).
- [ ] Sign in, add a novel to a shelf, submit a review → score updates after the worker runs.
- [ ] Search from the top bar returns hits with covers.
- [ ] `/sitemap.xml` and `/robots.txt` use the production URL.
- [ ] Upload a cover/avatar → object served from the R2 public URL (configure R2 CORS for the domain if uploading from the browser).
- [ ] Worker logs show `RateMyShelf (RMS) job worker is running` and no reconnect loops.

## Operational notes

- **Migrations are not run by Vercel.** Run `pnpm db:deploy` before deploying a release that changes the schema.
- **pg-boss and poolers.** Transaction-mode poolers (PgBouncer/Neon pooled) break pg-boss advisory locks and `LISTEN`-style polling. Always point `QUEUE_DATABASE_URL` at the direct endpoint.
- **Redis is optional for correctness.** Cache reads fall back to Postgres, but rate limiting and refresh-token rotation depend on it — treat Redis as required in production.
- **Search index is not updated synchronously.** If the worker is down, new/edited novels stay stale in Meilisearch until a job runs or you re-run `pnpm db:index`.
- **Preview deployments** share the production database unless you add a separate branch database; point preview env vars at a staging database if you need isolation.
