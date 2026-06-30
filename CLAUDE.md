# CLAUDE.md

Guidance for working in this repository. Read this first to get oriented.

## Overview

This service (package name `testworker`) is a **DB-backed, cron-polled job scheduler/dispatcher**
that automates posting and reposting of property listings to real-estate portals
(PropertyGuru, iProperty) on behalf of agents. It does **not** perform the browser automation
itself — it schedules jobs, dispatches them via HTTP to an **external worker service**
(`WORKER_URL`), and records the results, retries, timeouts, cooldowns, and per-agent trust scores.

It is **not** a chatbot or trading bot. The Express HTTP layer is intentionally minimal — the
only endpoint is `GET /v1/health`. All real work happens in the `node-cron` jobs that poll the
MySQL job queue. Entry point `src/index.js` connects to the DB and then calls
`cronService.init()`; if the cron scheduler isn't running, nothing happens.

Stack: Node.js + Express 5, Sequelize 6 / MySQL (mysql2), node-cron, Winston logging, Babel
(ESM transpilation), PM2 for production. Tests via Jest + Supertest.

## Commands

```bash
npm run dev        # Dev server: nodemon + babel-node on src/index.js (hot reload)
npm run compile    # Babel transpile src/ -> dist/ (inline source maps, copies files)
npm run production # Start/restart via PM2 (ecosystem.config.js, --only worker, env production)
npm test           # Jest (tests in src/tests/integration/)
npm run lint       # ESLint over src/ (uses legacy .eslintrc.json config)
npm run format     # Prettier --write over src/

# Database migrations (Sequelize CLI uses sequelizeConfig.js, NOT src/config)
npx sequelize-cli db:migrate --config sequelizeConfig.js
npx sequelize-cli db:migrate:undo:all --config sequelizeConfig.js
```

## Architecture: job lifecycle

Job flow: a generator creates a `Job` (status `pending`) → `JobDispatcher` claims it and POSTs
to the worker, creating a `JobAttempt` → worker response updates the `Job`/`JobAttempt` →
`RetryScheduler` / `TimeoutMonitor` recover stuck or failed jobs.

`Job.status` enum: `pending, in_progress, success, failed, timeout, cooldown, cancelled`.

The active cron jobs are registered in **`src/services/cron/jobs/index.js`** and scheduled in
**`src/services/cron/index.js`** (each job is `{ name, schedule, handler }`; cron uses 6-field
expressions with seconds):

| Job | Schedule | What it does |
|-----|----------|--------------|
| `JobDispatcher` (`JobDispatcher.js`) | `*/1 * * * * *` (every 1s) | Claims due `pending`/`cooldown` jobs (capped at `maxConcurrentJobs`) under a `READ_COMMITTED` transaction with `LOCK.UPDATE` to prevent double-dispatch. Creates a `JobAttempt`, decrypts portal credentials, POSTs the full unit payload to `WORKER_URL`. Updates trust score & status from the response. |
| `HandPickJobGenerator` (`HandPickJobGenerator.js`, exported as `HandPickJobDispatcher`) | every 5s | Drains `RepostSubsale` rows (status `pending`) in batches of 10 using row locking, creates `Job`s. Scheduling formula = base interval + agent trust modifier + recent-failure penalty + jitter. |
| `RetryScheduler` (`RetryScheduler.js`) | every 5s | Retries failed/timeout/cooldown jobs up to `max_retries` (default 3); marks `failed` when exhausted; extends cooldown on captcha. |
| `TimeoutMonitor` (`TimeoutMonitor.js`) | every 5s | Marks `in_progress` jobs stuck past the execution timeout (default 900s) as `timeout` and schedules a retry. |

**Gotcha:** `JobGenerator.js` (auto-discovery of new `subsale` rows) exists but is **commented
out** in `src/services/cron/jobs/index.js` — it is **not active**. Don't assume jobs are
auto-created from the `subsale` table; reposts come through `RepostSubsale` via
`HandPickJobGenerator`.

### Trust score (defined in `JobDispatcher.js`)

Per-agent `agent_trust_score`, clamped to `[0.2, 1.0]`: **+0.02** on success, **−0.05** on
failure, **−0.10** on captcha. On captcha the job goes to `cooldown` for **6 hours**. Normal
failures (under `max_retries`) reschedule `+1 minute`.

## Data model

Sequelize models live in `src/models/` (`db` object aggregates them). Key entities:

- `Job`, `JobAttempt` (+ `JobAttemptLog`) — the queue and execution records.
- `Subsale` (the property unit) with associations: `Country`, `State`, `City`, `PropertyType`
  → `PropertyCategory`, `SubsaleContent` (images), `SubsaleDescription`, `SubsaleFurnishList`,
  `SubsaleRoom`.
- `RepostSubsale` — the repost request queue feeding `HandPickJobGenerator`.
- `Agent`, `Portal`, `PortalCredential` (username/password stored **encrypted**).

MySQL via Sequelize, timezone `+08:00`. Jobs/attempts use soft deletes (`paranoid`).
Migrations are in `migrations/`.

## Configuration & environment

Config is read in **`src/config/index.js`** via `dotenv`. There is **no `.env.example`** — the
required vars (with defaults shown) are:

| Var | Default | Notes |
|-----|---------|-------|
| `NODE_ENV` | `development` | |
| `PORT` | `3000` | HTTP server port |
| `LOG_LEVEL` | `debug` | Winston level |
| `DB_USERNAME` | `root` | |
| `DB_PASSWORD` | `null` | |
| `DB_NAME` | `scheduler_db` | |
| `DB_HOST` | `127.0.0.1` | |
| `DB_PORT` | `3306` | |
| `WORKER_URL` | _(none)_ | External worker endpoint — **required for dispatch**; jobs fail without it |
| `MAX_CONCURRENT_JOBS` | `1` | Caps in-flight `JobAttempt`s |
| `PROPNEX_APP_KEY` | _(none)_ | AES-256-CBC key for `src/lib/Encryption.js` |

`src/lib/Encryption.js` (`decrypt`) decodes AES-256-CBC portal credentials and also handles
PHP-serialized payloads (legacy integration).

## Conventions & gotchas

- **ESM transpiled by Babel** — `import`/`export` everywhere; run via `babel-node` (dev) or
  compiled `dist/` (prod). Don't add CommonJS `require` in `src/`.
- **Concurrency** is bounded by `MAX_CONCURRENT_JOBS` (default 1) and enforced by counting
  `in_progress` `JobAttempt`s. Transactions + `LOCK.UPDATE` guard against double-dispatch.
- **Worker is external** — this repo only schedules/dispatches and records outcomes. The worker
  is expected to return `{ status, captchaDetected, error }`.
- **Logging**: Winston with daily rotation to `logs/` (`src/lib/Logger.js`). PM2 writes
  `logs/pm2-*.log`.
- **Two config files**: app runtime uses `src/config/index.js`; the Sequelize CLI uses the
  separate `sequelizeConfig.js`. Keep DB settings in sync between them.
