# Frontend (Next.js)

This package implements the Medical Messenger web UI using Next.js (App Router) and TypeScript.

## API Integration

- Reads `NEXT_PUBLIC_API_BASE_URL` from environment for backend calls
- Client-side fetch for `/api/v1/doctors`
- Loading skeleton, error state, and client-side filtering

## Scripts

- `pnpm dev` – start dev server
- `pnpm build` – build
- `pnpm start` – start production build
- `pnpm lint` – lint
- `pnpm test` – run unit tests
- `pnpm typecheck` – TypeScript

## Environment

Create `./.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Testing

- Vitest + Testing Library in JSDOM
- See `src/app/doctors/__tests__` and `src/components/__tests__`
