# AGENTS.md

Notes for OpenCode sessions working in this repo.

## Tooling

- Package manager is **pnpm** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`). Do not use npm/yarn.
- Scripts (`package.json`): `dev`, `build`, `start`, `lint`. There is **no** `test`, `typecheck`, `format`, or Prisma script — invoke the binaries directly (e.g. `pnpm exec prisma generate`).
- Lint: `pnpm lint` runs `eslint` with flat config in `eslint.config.mjs` (Next.js core-web-vitals + TS). `globalIgnores` re-declares `.next`, `out`, `build`, `next-env.d.ts`.
- No test suite exists. Do not invent a test runner without asking.
- Path alias: `@/*` -> repo root (`tsconfig.json`).

## Prisma (v7, generated client)

- Schema: `prisma/schema.prisma`. Generator is `prisma-client` (not `prisma-client-js`) with `output = ../lib/generated/prisma`.
- `lib/generated/prisma/` is **gitignored** — it is not in the repo. After clone and after any schema change run `pnpm exec prisma generate` or imports from `@/lib/prisma` will fail.
- `lib/prisma.ts` constructs the client with the `@prisma/adapter-pg` Pg adapter using `DATABASE_URL`; in dev it is cached on `global`.
- No `prisma/migrations/` directory. Use `pnpm exec prisma db push` to sync schema to the DB; do not commit migration folders unless asked.
- `prisma.config.ts` imports `dotenv/config` so Prisma CLI reads `.env`. Note: `datasource db` block has only `provider` — the URL comes from `prisma.config.ts`.
- Datasource is PostgreSQL (Neon in `.env`); `DATABASE_URL` must be a valid `postgresql://` URL with `?sslmode=require`.

## Environment / env validation

- All env vars are validated at build/runtime by `@t3-oss/env-nextjs` in `lib/env.ts` using zod. Missing/invalid vars fail fast — edit `lib/env.ts` when adding a var, do not read `process.env` directly in app code.
- Required vars (see `.env`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `RESEND_API_KEY`, `ARCJET_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_ENDPOINT_URL_IAM`, `AWS_REGION`, `NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES`. Only the `NEXT_PUBLIC_*` var is exposed to the client.
- `.env` is gitignored but required locally; there is no `.env.example`. Get values out of band.

## Auth & middleware gotcha

- Auth is `better-auth` (`lib/auth.ts`): Prisma adapter, GitHub social provider, `emailOTP` plugin sending via Resend, plus the `admin` plugin. Handler exposed at `app/api/auth/[...all]/route.ts`, where POST is wrapped with Arcjet (bot + sliding-window rate limit + `protectSignup` on `/api/auth/sign-up`). Client helpers in `lib/auth-client.ts`.
- The `admin` plugin means an `admin` role check exists — admin-only UI lives under `app/admin/`; non-admins render `app/not-admin/`.
- **Middleware file is `proxy.ts`, not `middleware.ts`.** Next.js will not run it — the session redirect to `/login` for `/admin/*` and the `matcher` config are effectively dead. Do not assume `/admin` is server-gated; route protection (if any) must live in server components/route handlers. Rename to `middleware.ts` only if the user asks.

## Routing & layout

- App Router. Route groups: `app/(auth)/` (login, verify-request), `app/(public)/` (public landing). Plain folders: `app/admin/` (dashboard, courses, projects) and `app/not-admin/`.
- Admin layout (`app/admin/layout.tsx`) wraps everything under `/admin` with the shadcn sidebar/header.
- API routes: `app/api/auth/[...all]` (better-auth), `app/api/s3/upload` and `app/api/s3/delete` (presigned Tigris/S3 uploads), `app/api/arcjet/route.ts`.

## UI / shadcn

- shadcn/ui configured in `components.json`: style `base-vega`, base color `neutral`, `rsc: true`, icon library lucide. Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`.
- Tailwind v4 via `@tailwindcss/postcss` (`postcss.config.mjs`); theme tokens live in `app/globals.css`. `tw-animate-css` and `@tailwindcss/typography` are installed.
- Add components via `pnpm exec shadcn add <name>`; `components/ui/` is the registry output.
- Rich text uses TipTap (`components/rich-text-editor`), drag-and-drop uses `@dnd-kit/react` + `@dnd-kit/helpers`, charts via `recharts`, forms via `react-hook-form` + `zod` (`@hookform/resolvers`).

## Image / S3

- `next.config.ts` allows `images.remotePatterns` for `${NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.t3.tigrisfiles.io`. Files are uploaded via presigned URLs from `/api/s3/upload`, stored on Tigris (S3-compatible) via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (`lib/S3Client.ts`).

## Versions that bite

- Next.js **16.1.1**, React **19.2.3**, Prisma **^7.8.0** (new client generator API), better-auth **^1.4.10**, Tailwind **v4**, shadcn **^3.6.2**. Do not assume v3/v15 idioms; use the patterns already in the repo as reference.