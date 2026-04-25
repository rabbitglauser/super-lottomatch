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
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=
```

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
