# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Venue booking web app. Users browse venues, pick an available time slot, and check out to create a booking against a separate backend API (not part of this repo).

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) then production build via Vite
- `npm run lint` — run ESLint over the whole project
- `npm run lint:fix` — run ESLint and auto-fix what it can
- `npm run format` / `npm run format:check` — write/check formatting with Prettier
- `npm run preview` — serve the production build locally

There is no test runner configured in this project yet.

## Architecture

- **Stack**: React 19 + TypeScript, built with Vite, styled with Tailwind CSS v4 (loaded via the `@tailwindcss/vite` plugin and `@import 'tailwindcss'` in `src/index.css` — there is no `tailwind.config.js`). Routing via `react-router-dom`, client state via `zustand`.
- **Entry point**: `src/main.tsx` mounts `App` from `src/App.tsx` into `#root` (defined in `index.html`) inside `StrictMode`. `App.tsx` only defines the `react-router-dom` routes; each route renders a page from `src/pages/`.
- **Booking flow**: `HomePage` (`/`) lists venues → `AvailabilityPage` (`/availability/:venueId`) shows time slots → selecting a slot writes to the Zustand store and navigates to `CheckoutPage` (`/checkout`), which submits the booking → `ConfirmationPage` (`/confirmation`). In-progress booking selections (venue, slot, price, customer info) live in `src/store/bookingStore.ts`, not in the URL or component state, so pages read/write it directly rather than passing props down the route chain.
- **API access**: `src/lib/api.ts` exports `API_URL`, read from the `VITE_API_URL` env var (see `.env.example`). Pages call the backend directly with `fetch` and `${API_URL}/...`; there is no shared API client/wrapper yet. `axios` is a dependency but not currently used anywhere.
- **Types**: shared domain types (`Venue`, `TimeSlot`, `Booking`) live in `src/types/index.ts`.
- **TypeScript project layout**: `tsconfig.json` is a solution file referencing two project configs — `tsconfig.app.json` (app code under `src/`, targets DOM libs) and `tsconfig.node.json` (`vite.config.ts`, targets Node). When adding compiler options, edit the relevant sub-config, not the root `tsconfig.json`.
- **ESLint**: flat config (`eslint.config.js`) combining `@eslint/js` recommended rules, `typescript-eslint` recommended rules, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (Vite variant), and `eslint-config-prettier` last (disables stylistic rules that conflict with Prettier). Applies to `**/*.{ts,tsx}`; `dist` is ignored.
- **Env vars**: copy `.env.example` to `.env` before running the app. `.env*` files are gitignored.
- **Git hooks**: Husky (installed by the `prepare` script on `npm install`) runs `.husky/pre-commit`, which executes `npm run lint && npm run build` before each commit. Prettier is not in the hook.
