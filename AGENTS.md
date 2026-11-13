# Chongkran

Full-stack recipe web app. Single Nuxt 4 deploy — Nitro server routes + Vue client, backed by Postgres (Drizzle), Vercel Blob, and Resend. KV/Redis is disabled; Better-Auth sessions are Postgres-only.

## Commands

| Command                        | What                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `bun dev`                      | Dev server (http://localhost:3000)                                                                                      |
| `bun run build`                | Production build. **Use `bun run`** — a bare `bun build` hits Bun's built-in bundler instead of the package script.     |
| `bun generate` / `bun preview` | Static / preview                                                                                                        |
| `bun predeploy`                | `bun db:migrate && bun run build`                                                                                       |
| `bun lint` / `bun lint:fix`    | oxlint (`oxlint.config.ts`)                                                                                             |
| `bun fmt` / `bun fmt:check`    | oxfmt (`oxfmt.config.ts`: 2-space, double quotes, trailing commas, 100 cols)                                            |
| `bun typecheck`                | `nuxt typecheck` — run before opening a PR                                                                              |
| `bun test`                     | All Vitest projects                                                                                                     |
| `bun test:unit`                | Pure-function tests (`test/unit/`), sub-second                                                                          |
| `bun test:nuxt`                | Server-handler tests (`test/nuxt/`), each file boots its own Nitro server (~5 min)                                      |
| `bun db:generate`              | Regenerate the Drizzle migration from `server/db/schema.ts` (**never hand-roll migrations**)                            |
| `bun db:migrate`               | Apply pending migrations                                                                                                |
| `bunx nitro task run db:seed`  | Won't work — run `curl -X POST http://localhost:3000/_nitro/tasks/db:seed` while `bun dev` is up                        |
| `bun run docker-compose up -d` | Start local Postgres. A bare `bun docker-compose` fails ("Script not found"); `run` falls through to the system binary. |

`bun db:*` wrap the `nuxt-hub` CLI. There is **no** `nuxt db` subcommand (nuxi prints its help and exits 0), and no `hub:db:*` / `hub:task` package scripts.

Seeding creates `admin@chongkran.com` / `Password123!` plus a demo author, categories, and recipes.

## Architecture

- **Single-tier Nitro server**: `server/api/<module>/<route>.{get,post,put,patch,delete}.ts` talks directly to Drizzle/Postgres. No BFF proxy layer. Better-Auth auto-mounts `/api/auth/*`.
- **Better-Auth** is the `@nuxtjs/better-auth` module (the renamed `@onmax/nuxt-better-auth`). It requires the `auth` CLI package as a devDependency — without it `nuxt prepare` dies with "NuxtHub schema generation needs the Better Auth CLI package".
  - `server/auth.config.ts` (`defineServerAuth`), `app/auth.config.ts` (`defineClientAuth` + `adminClient()`), both imported from `@nuxtjs/better-auth/config`.
  - Auto-imports: `requireUserSession(event)`, `requireAdmin(event)`, `requireRole(event, role[])`, `refreshSessionCookieCache(event)` server-side; `useUserSession()` client-side.
- **Sessions** live in the Postgres `session` table — no secondary storage (`hub.kv` and `auth.hubSecondaryStorage` are both off).
- **Route protection** is declarative in `nuxt.config.ts → routeRules` (`/admin/**` → admin, `/profile/**` `/meal-plans/**` `/shopping-lists/**` → auth, `/auth/**` → guest). `app/middleware/auth.global.ts` currently only early-returns for public paths and guards nothing — adding a public route means changing `routeRules`, not that file.

## API response contract

- **Errors still return HTTP 200.** The envelope carries the real status in `status.code` (`ApiResponseCode` in `shared/types/response.ts`); only true crashes produce a 5xx. Assert on `status.code`, never on `response.status`.
- `createResponse({ code }, data, meta?)` — success takes `(status, data, { total, limit, offset })`; error takes `(status, null?)`.
- `requireAdmin` / `requireRole` write that envelope themselves and then throw, so handlers can `return` nothing after calling them.
- Handlers import app tables from `hub:db:schema` and the client from `@nuxthub/db` (virtual modules) — not relative paths.

## Database

- Schema lives in `server/db/schema.ts` — single source of truth. Import the Better-Auth tables via `import { account, session, user } from "#auth/schema"` so app tables can FK into `user.id`.
- Denormalized counters on `user` (`followers_count`, `following_count`, `recipes_count`, `total_views`, `total_likes`) are updated transactionally in the `follows/[id]` handlers; use `GREATEST(count - 1, 0)` on unfollow to avoid negative drift.
- Denormalized `author_name` / `author_avatar` / `author_bio` on `recipes` (set on POST so list reads skip a JOIN).
- Migration `0002` runs `CREATE EXTENSION pg_trgm` and builds GIN trigram indexes — local Postgres needs the contrib extensions, and PGlite only exposes it when `pg_trgm` is passed to `PGlite.create({ extensions })`.
- `relations()` helpers exist in `schema.ts` — use them for relational queries.

## Conventions and gotchas

- **`noUncheckedIndexedAccess: true`** (via `.nuxt/tsconfig.json`): index access yields `T | undefined`. After `const [row] = await db.update(...).returning()`, guard `row` before use.
- **`requireRole(event, [Role.Admin, Role.Author])`** needs the `Role` enum from `shared/types` (`shared/types/user.ts`); string literals don't widen. Use `useUserSession()`, not the removed `useUser()`, on the client.
- **Two different avatar fields**: Better-Auth's session user exposes `image` (`user.image ?? undefined` for `<UAvatar :src>`), while API `UserResponse` exposes `avatar`.
- **Vue templates don't parse `??` inside `:attr` template literals.** Compute a `displayName` in `<script setup>` instead of `${user.firstName ?? ""} ${user.lastName ?? ""}` inline.
- **`$fetch` calls are explicitly typed** — `await $fetch<ApiResponse<T>>(url, …)`. Leaving them untyped lets Nitro's route-type inference blow up with `TS2321 Excessive stack depth` on TS 6.
- **`UForm` nesting** for array items: `<UForm :schema="itemSchema" :name="`items.${index}`" nested>`. The parent schema must exclude nested fields; enforce array-level constraints in a `validate` function.
- **`USelectMenu value-key="id"`** — Drizzle serializes ids as `text`.
- **`UPagination v-model:page`** — Nuxt UI v4, not `v-model`.
- **Semantic colors only** (`text-default`, `bg-elevated`, `border-muted`) — no raw Tailwind palette classes.
- **Zod v4** (`zod@^4`): `z.string("message")` for the invalid_type message, new refinement syntax. Check nearby handlers before writing schemas.
- **Adding an `/admin/*` route** also needs an entry in `navItems` in `app/layouts/admin.vue`.
- **TypeScript is pinned to exactly `6.0.3`** — do not let `bun update --latest` move it.
- The dev server binds **`[::1]:3000`**; probe `http://localhost:3000`, since `127.0.0.1` refuses connections.

## Testing

- **3 Vitest projects** (`vitest.config.ts`): `unit` (`test/unit/`, node env), `e2e` (`test/e2e/`, empty), `nuxt` (`test/nuxt/`, real Nuxt runtime).
- `test/nuxt/**` files call `await setup({ rootDir: process.cwd(), dev: true })`, which starts a real Nitro server against **`DATABASE_URL`** — those tests need a live Postgres with migrations applied (and seeded data for data-dependent assertions). They are integration tests, not mocks.
- There is **no committed `.env.test`** (old docs claimed one): copy `.env.example` → `.env`, then `bun db:migrate` and seed before running the `nuxt` project.
- **`bun:test` stub** (`test/stubs/bun-test.ts`, aliased in `vitest.config.ts`) keeps Vite from trying to bundle Bun's runtime module under Node — don't delete it.
- Workflow: `bun test:unit` before pushing, `bun test:nuxt` before a PR. After a dependency bump, delete `node_modules/.cache` and `.nuxt` or the Vite dep optimizer serves stale chunks (dev server crashes on a missing `deps/config-*.js`).

## Git

- `main` — default branch; `develop` — development branch.
- `.gitignore` excludes `.github/`, `.claude/`, and `CLAUDE.md` — agent config in those paths is not committed.
