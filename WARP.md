# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install deps (uses npm with package-lock):
  - `npm ci` (CI) or `npm install`
- Dev server (Next.js App Router):
  - `npm run dev`
- Build and run production:
  - `npm run build`
  - `npm run start`
- Lint (Next.js ESLint config):
  - All files: `npm run lint`
  - Single file: `npm run lint -- --file src/app/page.js`

Environment variables (required for Supabase client, loaded automatically by Next from `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=... 
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## High-level architecture

- Framework/runtime
  - Next.js 14 (App Router) with React 18. Minimal `next.config.mjs` and `postcss.config.mjs`.
  - Styling via TailwindCSS + DaisyUI + tailwindcss-neumorphism-ui. Custom palette in `tailwind.config.js`.
  - Linting via `next/core-web-vitals` (`.eslintrc.json`).
  - Path aliases via `jsconfig.json`: `@/*` → `src/*`, `@/lib/*` → `src/lib/*`.

- Data layer
  - Supabase JS client initialized in `src/lib/db.js` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - API route: `src/app/api/projects/route.js`
    - `GET` returns `id, name, description, status` from the `project` table.
    - Note: `POST` is present but appears incomplete (references `params` and uses `Response.json` incorrectly); it’s not used by the UI.
  - README outlines intended schema: `project`, `tag`, `project_tags`, `status` tables; the app currently consumes fields shown above from `project`.

- Pages and data flow
  - Project list (two UIs):
    - `src/app/page.js` – simple card list, fetches `/api/projects` client-side.
    - `src/app/projects/page.js` – richer list using MUI DataGrid with status filter; also fetches `/api/projects`.
  - Project details: `src/app/[project_id]/page.js`
    - Fetches the selected project directly from Supabase (client-side) including related `project_files` and `project_videos`.
    - If `web_link` points to GitHub, it fetches the repo’s README (tries `main` then `master`) and renders it as HTML via `marked`.
    - Embeds: uses `EmbedCarousel` and calls `reloadEmbeds()` to (re)load TikTok/Twitter/Instagram scripts when present.

- Components/utilities
  - `src/app/[project_id]/carousel.js` – image and embed carousels (embed uses `dangerouslySetInnerHTML`).
  - `src/app/[project_id]/embedUtils.js` – idempotently injects/embed scripts for TikTok/Twitter/Instagram after client navigation/renders.
  - `src/app/ProjectProvider.js` – simple React context for a `project` object (not widely used yet).

## Operational notes

- No test tooling is configured (no Jest/Vitest/Playwright). If tests are added later, update this file with how to run all tests and a single test.
- The app currently fetches data both through an API route (`/api/projects`) and directly from Supabase in the details page; keep this in mind when changing the schema or auth.
