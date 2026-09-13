<div align="center">

# KnowSphere

**A modern, full-stack learning platform for creating, selling, and completing online courses.**

Browse expert-led courses, learn at your own pace, and earn verifiable certificates — backed by an admin console with analytics, content management, and audit logging.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[**Live Demo →**](https://knowsphere.billalbenz.com/)

</div>

---

## Overview

**KnowSphere** is a production-style learning management system (LMS) built with the Next.js App Router. It gives learners a polished experience for discovering and completing courses, and gives administrators a complete back office for managing catalog content, users, and revenue.

The application is built around two audiences:

- **Learners** can browse a searchable course catalog, enroll in free or paid courses, watch lessons, track progress, take quizzes, join lesson discussions, leave reviews, and earn shareable certificates that anyone can verify publicly.
- **Administrators** get a real-time analytics dashboard plus full CRUD tooling for courses, chapters, lessons, quizzes, and categories — with drag-and-drop ordering, rich-text descriptions, moderation queues, and a tamper-evident activity log exported to CSV.

Everything is type-safe end to end, protected by layered authentication and rate limiting, and deployed on modern serverless infrastructure.

---

## Key Features

### For learners

- **Course catalog** — full-text search, level filtering, and sorting (newest, price, duration), with grid/list views and URL-driven state that survives reloads and sharing.
- **Rich course pages** — cover imagery, structured curriculum, ratings and reviews, and a sticky purchase/summary card.
- **Flexible enrollment** — free courses activate instantly; paid courses go through a secure Stripe Checkout flow with success and cancel handling.
- **Wishlist** — save courses for later and return to them from the dashboard.
- **Reviews & ratings** — enrolled learners can rate and review a course, with aggregate scoring and edit tracking.
- **Lesson player & progress** — video lessons with previous/next navigation and per-lesson completion tracking that feeds overall course progress.
- **Interactive quizzes** — single- and multiple-choice questions with per-question feedback, explanations, scoring, and retry.
- **Lesson discussions** — threaded comments with one level of replies, likes, editing, and moderation.
- **Certificates** — automatically issued on course completion, publicly verifiable by code, and hideable via a privacy setting.

### For administrators

- **Analytics dashboard** — totals and 30-day sparklines for users, courses, enrollments, and revenue, plus enrollment/revenue trend charts.
- **Course management** — create, edit, publish/archive, and delete courses with rich-text descriptions and uploaded media.
- **Curriculum builder** — manage chapters and lessons with drag-and-drop reordering and drag-and-drop quiz question ordering.
- **Quiz editor** — build questions and answers, mark correct options, and attach explanations.
- **Categories** — create and manage taxonomies with case-insensitive uniqueness and safe slug generation.
- **Moderation** — review and remove course reviews, and manage contact form submissions.
- **Activity audit log** — a filterable, paginated feed of every admin mutation with actor, entity, and change snapshots.
- **CSV export** — export the activity log (up to 5,000 rows) with proper escaping.
- **Upload hygiene** — a cleanup job that sweeps orphaned, never-saved uploads.

### Platform & engineering

- **Authentication** — GitHub OAuth and passwordless email OTP (via Resend) powered by better-auth, with an admin plugin for roles and banning.
- **Authorization** — server-only guards (`requireAdmin`, `requireUser`) enforce access at the data layer, not just in the UI.
- **Payments** — Stripe Checkout with webhook-driven enrollment activation.
- **Security** — Arcjet bot detection, signup protection, and per-action rate limiting; all inputs validated with Zod.
- **File storage** — presigned S3/Tigris uploads and downloads with a pending-upload ledger and ownership checks.
- **Type-safe by default** — Zod-validated environment variables, discriminated server-action responses, and generated Prisma types.
- **Refined UX** — dark mode, loading skeletons, toasts, confetti on success, and a responsive shadcn/ui design system.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Server Components, Server Actions) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS v4, shadcn/ui, lucide-react, Recharts, sonner, next-themes |
| **Database & ORM** | PostgreSQL, Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`) |
| **Authentication** | better-auth (GitHub OAuth, Email OTP, admin plugin), Resend |
| **Payments** | Stripe Checkout + Webhooks |
| **Security** | Arcjet (bot detection, rate limiting, signup protection), Zod |
| **Storage** | S3-compatible object storage (Tigris) via AWS SDK v3 presigned URLs |
| **Rich text & DnD** | TipTap, `@dnd-kit/react` |
| **Forms & State** | react-hook-form, `@hookform/resolvers`, nuqs (URL state) |
| **Tooling** | pnpm, ESLint, `@t3-oss/env-nextjs` |

---

## Architecture

The project follows a domain-oriented layout. Server components fetch data through a dedicated `app/data/**` layer, while mutations live in colocated server actions.

```text
KnowSphere/
├── app/
│   ├── (auth)/               # Login, OTP verification
│   ├── (public)/             # Landing, catalog, course detail, certificates, legal
│   │   ├── _components/      # Marketing & course UI
│   │   └── _lib/             # Optional-session helper, filters
│   ├── admin/                # Admin console (dashboard, courses, categories, activity…)
│   ├── dashboard/            # Learner area (my learning, wishlist, certificates, settings)
│   ├── api/                  # Route handlers (auth, S3, Stripe webhook, activity export)
│   └── data/                 # server-only data fetchers (admin/, user/, course/, certificate/)
├── components/               # Shared UI (shadcn/ui, file uploader, rich text editor)
├── hooks/                    # Reusable client hooks
├── lib/                      # Auth, Prisma, Stripe, Arcjet, S3, activity, certificates, env
├── prisma/
│   └── schema.prisma         # Data model
└── types/                    # Shared TypeScript types
```

### How it works

**Authentication & authorization.** Authentication is handled by better-auth with a Prisma adapter and two sign-in methods: GitHub OAuth and email OTP. The admin plugin maintains a `role` field. Two server-side gates protect data: `requireAdmin()` redirects unauthenticated users to `/login` and non-admins to `/not-admin`, while `requireUser()` allows any signed-in learner. Every file under `app/data/**` calls the appropriate gate before touching the database.

**Enrollment & payments.** Enrolling in a free course creates an immediately `Active` enrollment. Paid enrollment creates or reuses a Stripe customer, stores a `Pending` enrollment, and opens a Checkout Session. A signed Stripe webhook (`checkout.session.completed`) resolves the user and flips the enrollment to `Active`.

**Certificates.** When the final lesson of a course is completed, an eligibility check runs in a transaction and issues a certificate with a unique verification code and snapshot fields (course title, level, duration, instructor, lesson count). The public `/certificates/[code]` page prefers live course data and falls back to snapshots if a course is later deleted. Learners can hide their certificates from public lookup.

**Activity auditing.** Every admin mutation writes an `Activity` row capturing the actor (with a name snapshot), action, entity, and a structured metadata diff. The log is indexed for fast filtering by actor, action, entity, and date, and can be exported to CSV.

**Uploads.** Files are uploaded directly to object storage using presigned URLs. Each upload is recorded in a `PendingUpload` ledger and cleared on successful save; an admin cleanup job removes orphaned records and objects after 24 hours.

**Security.** Arcjet sits in front of the auth route (signup protection + sliding-window limits) and sensitive server actions (fixed-window rate limits such as 3 enrollment attempts/minute and 1 contact message/minute). All environment variables are validated at startup with Zod, and every action validates its input.

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **pnpm** (the project's package manager)
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech))
- A **Stripe** account and the [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook forwarding

### 1. Clone and install

```bash
git clone https://github.com/billalben/KnowSphere.git
cd KnowSphere
pnpm install
```

> `pnpm install` runs `prisma generate` automatically via `postinstall`.

### 2. Configure environment variables

Copy the template and fill in real values (see the [table below](#environment-variables)):

```bash
cp .env.example .env
```

### 3. Sync the database schema

This project uses `prisma db push` (no migration files):

```bash
pnpm exec prisma db push
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Forward Stripe webhooks (for paid enrollment)

In a second terminal:

```bash
pnpm stripe:listen
```

This forwards Stripe events to `localhost:3000/api/webhook/stripe`.

---

## Environment Variables

All variables are validated at build and runtime by `@t3-oss/env-nextjs` in `lib/env.ts`. Missing or invalid values fail fast.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Server | PostgreSQL connection string (`?sslmode=require`) |
| `BETTER_AUTH_SECRET` | Server | Signing secret for better-auth |
| `BETTER_AUTH_URL` | Server | Base URL used for auth and Stripe redirects |
| `GITHUB_CLIENT_ID` | Server | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Server | GitHub OAuth app client secret |
| `RESEND_API_KEY` | Server | Resend API key for OTP emails |
| `ARCJET_KEY` | Server | Arcjet site key for security rules |
| `AWS_ACCESS_KEY_ID` | Server | Object storage access key |
| `AWS_SECRET_ACCESS_KEY` | Server | Object storage secret key |
| `AWS_ENDPOINT_URL_S3` | Server | S3-compatible endpoint URL |
| `AWS_ENDPOINT_URL_IAM` | Server | IAM endpoint URL |
| `AWS_REGION` | Server | Object storage region |
| `NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES` | Client | Public bucket name for served media |
| `STRIPE_SECRET_KEY` | Server | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Server | Signing secret for the Stripe webhook |

---

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Run the production server |
| `pnpm lint` | Run ESLint |
| `pnpm stripe:listen` | Forward Stripe webhooks to the local API |

Additional one-off commands:

```bash
pnpm exec prisma generate   # Regenerate the Prisma client
pnpm exec prisma db push    # Sync the schema to the database
pnpm exec tsc --noEmit      # Type-check the project
```

---

## Deployment

The app is designed for serverless hosting (e.g. **Vercel**).

1. Provision a managed PostgreSQL database (e.g. Neon) and run `pnpm exec prisma db push`.
2. Add all environment variables from the table above to your hosting provider.
3. Update `BETTER_AUTH_URL` to the production domain and configure the GitHub OAuth callback URL.
4. Create a Stripe webhook endpoint pointing to `/api/webhook/stripe` and set `STRIPE_WEBHOOK_SECRET`.
5. Deploy — `pnpm build` runs the standard Next.js build.

---

## Roadmap & Known Limitations

KnowSphere is an actively evolving project. A few areas are intentionally scoped for future work:

- **Server-side quiz scoring** — quizzes currently grade in the browser and don't persist attempts.
- **Profile page** — the learner profile screen is a placeholder ahead of a full profile editor.
- **Newsletter** — the footer signup is a UI placeholder, not yet wired to a provider.
- **Activity types** — the audit log covers admin mutations; learner-side events are a future extension.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<div align="center">

**KnowSphere** — [Live Demo](https://knowsphere.billalbenz.com/)

</div>
