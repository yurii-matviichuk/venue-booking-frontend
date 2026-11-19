# Venue Booking Web App

Web app for browsing venues and booking time slots. Visitors browse venues, pick a slot and log in to book spots; customers see their own bookings, and venue owners get a page that groups incoming bookings by status. Slots are shown in each venue's timezone. The app talks to a REST API (`VITE_API_URL`). It is a portfolio demo: all data is fictional.

## Stack

- **UI:** React 19 with TypeScript
- **Build and dev server:** Vite
- **Styling:** Tailwind CSS v4, loaded through the `@tailwindcss/vite` plugin
- **Routing:** `react-router-dom`
- **State:** Zustand
- **Testing:** Vitest, jsdom, React Testing Library
- **Tooling:** ESLint, Prettier, Husky pre-commit hook

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run lint` / `npm run format:check` — run before committing (`lint:fix` and `format` fix issues)
- `npm test` — run the Vitest suite once
- `npm run preview` — serve the production build locally

The pre-commit hook runs `npm run lint && npm run build && npm test`. It does not run Prettier. CI (`.github/workflows/ci.yml`) runs lint, `format:check`, build and tests on pushes to `main`, on pull requests and when Vercel finishes a deployment (reported back as a Vercel Deployment Check).

## Structure

- `src/App.tsx` only defines the routes; each route renders a page from `src/pages/`
- `src/pages/` holds one component per route
- `src/components/` holds shared UI. `BookingCard` is the one booking card used by both booking lists; give it the action buttons as children
- `src/store/` holds the Zustand stores: `authStore` (logged-in user) and `bookingStore` (the in-progress booking)
- `src/lib/` holds `api.ts` (`apiFetch`, `ApiError`), `dates.ts` (timezone-aware date helpers) and `bookings.ts` (booking display helpers shared by the customer and owner lists: status badges, slot text in the venue's timezone, totals, and grouping owner bookings into waiting, confirmed, past and cancelled)
- `src/types/index.ts` holds the shared types. `Booking` is the in-progress selection; `MyBooking` is a saved booking returned by the API.
- `public/images/venues/` holds venue photos, matched to a venue by its `imageFile` name

## Conventions

- Make every request through `apiFetch` in `src/lib/api.ts`. It prefixes `API_URL` (which includes `/api`, so paths look like `/auth/me`), sends the session cookie (`credentials: 'include'`), and throws an `ApiError` (`status`, the API's `code`, first validation message).
- Keep in-progress booking selections in `src/store/bookingStore.ts`, not in the URL or component state.
- Wrap pages that need a logged-in user in `RequireAuth`. It waits for the session check, then redirects to `/login` with the original path in router state. Pass `role="owner"` to restrict a page to one role (other users go to `/`). This only hides the page: the API enforces the real permissions.
- A 401 from `/auth/me` just means nobody is logged in. `logout` also resets the booking store so the next person doesn't inherit the previous selection.
- Show and group slots in the venue's timezone with the helpers in `src/lib/dates.ts`, not the browser's.
- Checkout sends the venue id, slot id and number of spots; the customer is identified by the session. A slot's price is per spot, so the total is `pricePerSpot × spots`.
- Edit `tsconfig.app.json` (code under `src/`) or `tsconfig.node.json` (`vite.config.ts`) for compiler options, not the root `tsconfig.json`, which is only a solution file.
- Tailwind v4 is loaded by the `@tailwindcss/vite` plugin and `@import 'tailwindcss'` in `src/index.css`; there is no `tailwind.config.js`.

## Things to avoid

- Don't call `fetch` directly; use `apiFetch`.
- Don't store or read an auth token; the session is an `httpOnly` cookie set by the API.
- Don't change `src/types/index.ts` to differ from the API's response shapes.
- Don't commit `.env` files or credentials.

## Environment

Copy `.env.example` to `.env` (`.env*` is gitignored). `VITE_API_URL` is the API base URL including `/api`, and is baked in at build time. The API must allow the dev server origin (`http://localhost:5173`) exactly, or the session cookie is not sent.

## Testing

Vitest with `jsdom` and React Testing Library, configured in the `test` block of `vite.config.ts`. Tests sit next to the code as `*.test.ts(x)` in `src/`.

- Import `describe`, `it`, `expect`, `vi` from `vitest` (globals are off). Component tests need `afterEach(cleanup)`, because Testing Library doesn't clean up without globals.
- `VITE_API_URL` is fixed to `http://api.test/api` in the test config, so tests don't depend on `.env`.
- Mock `fetch` with `vi.stubGlobal('fetch', ...)`, returning a new `Response` on every call (a body can only be read once). Never call the real API from tests.
- Zustand stores are global: reset them with `setState` in `beforeEach`.

## Known limitations

- Tests cover only `lib/api.ts`, `lib/dates.ts`, `lib/bookings.ts`, `store/authStore.ts`, `store/bookingStore.ts`, `components/RequireAuth.tsx`, `components/BookingCard.tsx` and `components/ConfirmDialog.tsx`. Pages and the other components, including the owner page, have no tests.
- No end-to-end test of the full flow in a real browser.
