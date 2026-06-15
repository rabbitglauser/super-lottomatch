# Frontend — SuperLottomatch

This package contains the Next.js frontend for SuperLottomatch.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- lucide-react
- recharts
- shadcn/ui source components in `src/components/ui`

## Current routes

Public:

- `/`
- `/login`
- `/mobile`
- `/datenschutz`
- `/impressum`

Dashboard:

- `/dashboard`
- `/dashboard/events`
- `/dashboard/guests`
- `/dashboard/guests/importieren`
- `/dashboard/check-in`
- `/dashboard/prizes`
- `/dashboard/data`
- `/dashboard/settings`

## Development

```bash
npm install
npm run dev
```

Optional environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=
```

Check-in mode selection:

- Uses Supabase when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present.
- Uses backend API only when Supabase env vars are missing and `NEXT_PUBLIC_API_BASE_URL` or `NEXT_PUBLIC_API_URL` is explicitly set.
- Production login on Vercel requires Supabase and calls the `authenticate_user`
  RPC. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
  Vercel, and do not set `NEXT_PUBLIC_API_BASE_URL` for the Vercel frontend.

## Quality checks

```bash
npm run lint -- src
npm run build
```

## Naming conventions

- `Desktop*` components are the main admin/dashboard implementation.
- `Mobile*` components are reserved for dedicated mobile experiences.
- Shared primitives live under `src/components/atoms`, `src/components/molecules`, `src/components/templates`, and `src/components/ui`.
- `PageReveal` provides the shared entrance animation used across dashboard pages.
