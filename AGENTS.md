# AGENTS.md

Notes for OpenCode sessions working in this repo.

## Tooling

- Package manager is **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`). Do not use npm/yarn.
- Scripts (`package.json`): `dev`, `build`, `start`, `lint`. There is **no** `test`, `typecheck`, `format`, or Prisma script — invoke the binaries directly (e.g. `pnpm exec prisma generate`).
- After edits, verify with `pnpm lint` then `pnpm exec tsc --noEmit`. No test suite exists; do not invent a runner without asking.
- Path alias: `@/*` -> repo root (`tsconfig.json`).
- `pnpm-workspace.yaml` allows only `@prisma/engines` and `prisma` to run install scripts; `sharp` and `unrs-resolver` are blocked.

## Prisma (v7, new client generator)

- Schema: `prisma/schema.prisma`. Generator is `prisma-client` (not `prisma-client-js`) with `output = "../lib/generated/prisma"`.
- `lib/generated/prisma/` is **gitignored** — it is not in the repo. After clone and after any schema change run `pnpm exec prisma generate` or imports from `@/lib/prisma` will fail.
- Import path inside `lib/prisma.ts` is `from "./generated/prisma/client"` (note the nested `client`), not the v6 default. Constructed with `@prisma/adapter-pg` + `DATABASE_URL`; cached on `global` in dev.
- No `prisma/migrations/` folder. Sync schema to the DB with `pnpm exec prisma db push`; do not commit migration folders unless asked.
- `prisma.config.ts` imports `dotenv/config` so Prisma CLI reads `.env`. `datasource db` block only has `provider`; the URL comes from `prisma.config.ts`.
- Datasource is PostgreSQL (Neon in `.env`); `DATABASE_URL` must be a valid `postgresql://` URL with `?sslmode=require`.

## Environment / env validation

- All env vars are validated at build/runtime by `@t3-oss/env-nextjs` in `lib/env.ts` (zod). Missing/invalid vars fail fast — edit `lib/env.ts` when adding a var, do not read `process.env` directly in app code. (Update both `server` and the `experimental__runtimeEnv` map for client vars.)
- Required vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `RESEND_API_KEY`, `ARCJET_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_ENDPOINT_URL_IAM`, `AWS_REGION`, `NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES` (only the `NEXT_PUBLIC_*` is exposed to the client).
- `.env` is gitignored but required locally; there is no `.env.example`. Get values out of band.

## Auth & middleware gotcha

- Auth is `better-auth` (`lib/auth.ts`): Prisma adapter, GitHub social provider, `emailOTP` plugin sending via Resend, plus the `admin` plugin (sets `User.role` — see below). Handler at `app/api/auth/[...all]/route.ts` — POST is wrapped with Arcjet (`detectBot` + sliding-window rate limit + `protectSignup` on `/api/auth/sign-up`). Client helpers in `lib/auth-client.ts`.
- The `admin` plugin means an `admin` role exists. Server-side gate lives at `app/data/admin/require-admin.ts`:
  - No session -> `redirect("/login")`
  - Session but `role !== "admin"` -> `redirect("/not-admin")`
- **Middleware file is `proxy.ts`, not `middleware.ts`.** Next.js will not run it — the session redirect to `/login` for `/admin/*` and its `matcher` config are effectively dead. Do not assume `/admin` is server-gated; real route protection comes from `requireAdmin()` inside server components, route handlers, and server actions. Rename to `middleware.ts` only if the user asks.

## Routing & layout

- App Router. Route groups: `app/(auth)/` (login, verify-request), `app/(public)/` (landing: home, `/courses`, `/courses/[slug]`, `/contact`, `/terms`, `/privacy`, `/license`). Plain folders: `app/admin/` (dashboard, courses, projects, contact-messages) and `app/not-admin/`.
- Admin layout (`app/admin/layout.tsx`) wraps everything under `/admin` with the shadcn sidebar/header in `app/admin/_components/`.
- API routes: `app/api/auth/[...all]` (better-auth), `app/api/s3/upload` and `app/api/s3/delete` (presigned Tigris uploads), `app/api/arcjet/route.ts`.
- Default to **server components**; only add `"use client"` when you need state, effects, or browser-only APIs. Pair client-only subtrees with a server parent that passes plain props (see the FAQ pattern: `FAQ.tsx` server + `FaqList.tsx` client).

## Data fetchers & auth helpers

- Server-side data fetching follows a per-domain folder convention:
  - Admin: `app/data/admin/*.ts` — every file calls `await requireAdmin()` first. Use `revalidatePath` on the admin layout after mutations.
  - Public: `app/data/course/*.ts` — `get-all-courses` and `get-course-by-slug` filter to `status: PUBLISHED` and sort by `createdAt desc`. Server-only (`import "server-only"` at the top).
- Optional-session helper for public pages that render differently signed-in vs signed-out: `app/(public)/_lib/get-optional-session.ts` (`auth.api.getSession({ headers })`, returns `null` when signed out). Server actions in `app/(public)/*/actions.ts` reuse this same helper to attach `userId` when available.

## URL state (nuqs)

- `nuqs` is used for client-side URL state (search params in the course catalog, etc.). The root layout already wraps the body with `<NuqsAdapter>` from `nuqs/adapters/next/app` — do not wrap again. `parseAsStringLiteral(...)` parsers auto-fall back on invalid URL values, no extra plumbing needed.

## UI / shadcn

- shadcn/ui configured in `components.json`: style `base-vega`, base color `neutral`, `rsc: true`, icon library lucide. Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.
- Tailwind v4 via `@tailwindcss/postcss` (`postcss.config.mjs`); theme tokens live in `app/globals.css`. `tw-animate-css` and `@tailwindcss/typography` are installed.
- Add components via `pnpm exec shadcn add <name>`; output lands in `components/ui/`.
- Rich text uses TipTap (`components/rich-text-editor`), drag-and-drop uses `@dnd-kit/react` + `@dnd-kit/helpers`, charts via `recharts`, forms via `react-hook-form` + `zod` (`@hookform/resolvers`), toasts via `sonner`.

## Image / S3 (Tigris)

- `next.config.ts` allows `images.remotePatterns` for `${NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.tigrisfiles.io`.
- Files are uploaded via presigned URLs from `/api/s3/upload`, stored on Tigris (S3-compatible) via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (`lib/S3Client.ts`).

## Versions that bite

- Next.js **16.1.1**, React **19.2.3**, Prisma **^7.8.0** (new client generator API), better-auth **^1.4.10**, Tailwind **v4**, shadcn **^3.6.2**. Do not assume v3/v15 idioms; copy the patterns already in the repo as reference.
