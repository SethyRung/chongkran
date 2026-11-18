# Repository Guidelines

## Project Structure

Chongkran is a full-stack Nuxt 4 recipe app. Put Vue pages, layouts, components, and composables in `app/`. Keep Tailwind styles in `app/assets/css/` and directly served assets such as fonts and the favicon in `public/`.

Put Nitro handlers in `server/api/`, server-only helpers in `server/utils/`, and code shared by client and server in `shared/types/` or `shared/utils/`. Edit the Drizzle schema in `server/db/schema.ts` and generate migrations with `bun run db:generate`. Review the generated SQL in `server/db/migrations/postgresql/`.

## Local Development

- Run `bun install`, copy `.env.example` to `.env`, and set a local Better Auth secret. Keep `.env` out of Git.
- Start Postgres with `docker compose up -d`, apply migrations with `bun run db:migrate`, and start Nuxt with `bun run dev` at `http://localhost:3000`.
- Run `bun run build` for a production build and `bun run preview` to preview it.
- Run `bun run lint`, `bun run fmt:check`, and `bun run typecheck` before opening a PR. Use `bun run fmt` to apply formatting.

## Coding Style

Follow Oxfmt's two-space indentation, double quotes, semicolons, and trailing commas. Use PascalCase for Vue components, `use*` for composables, and Nitro method suffixes such as `[id].get.ts` for handlers. Read `DESIGN.md` before changing UI and use Nuxt UI semantic colors such as `text-default`. Reserve code comments for non-obvious constraints and link issues for workarounds.

## Testing

Use Vitest and name new files `*.test.ts`. Put pure-function tests in `test/unit/` and API integration tests in `test/nuxt/api/`. Run `bun run test:unit --run` or `bun run test:nuxt --run`. The Nuxt suite starts a server per file, runs serially, and needs a migrated local Postgres database. Assert API outcomes through `status.code` in the response body.

## Commits and Pull Requests

Use short, imperative Conventional Commit subjects with optional scopes, such as `feat(api): add public stats`. Omit author trailers. In PRs, summarize behavior changes, link related issues, report verification, and include screenshots for visible UI changes.
