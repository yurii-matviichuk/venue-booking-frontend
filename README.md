# Venue Booking

[![CI](https://github.com/yurii-matviichuk/venue-booking-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/yurii-matviichuk/venue-booking-frontend/actions/workflows/ci.yml)

Frontend for a venue booking app, built with React 19, TypeScript, and Vite. Customers browse venues by city, pick an available time slot and the number of spots, log in, and check out to create a booking. They can also view and cancel their bookings. Venue owners confirm or cancel the bookings made at their venues.

> **Demo app:** This is a portfolio project. All venues and bookings are fictional. Please don't enter real personal data when registering.

This is the frontend only. It needs the [venue booking backend](../venue-booking-backend) running (see its README for database setup).

## Stack

- [React 19](https://react.dev/) + TypeScript
- [Vite](https://vite.dev/) for dev server and build
- [React Router](https://reactrouter.com/) (`react-router-dom`) for client-side routing
- [Zustand](https://zustand.docs.pmnd.rs/) for auth and booking flow state
- [Tailwind CSS v4](https://tailwindcss.com/) via the `@tailwindcss/vite` plugin
- [ESLint](https://eslint.org/) (flat config) with `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`
- [Prettier](https://prettier.io/) for formatting
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) for tests

## Getting started

1. Start the backend (it runs on `http://localhost:5001` by default).
2. Then, in this folder:

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`. The backend's `CLIENT_URL` must match this origin exactly, or the session cookie won't be sent.

`VITE_API_URL` (see `.env.example`) is the base URL of the booking API, including the `/api` prefix: `http://localhost:5001/api`. It is read in `src/lib/api.ts`.

### Demo accounts

To try the app without signing up, log in with a seeded account (the backend must be seeded):

| Role     | Email               | Password        | Can do                                               |
| -------- | ------------------- | --------------- | ---------------------------------------------------- |
| Customer | `demo@example.com`  | `demo-password` | Book slots, view and cancel own bookings             |
| Owner    | `owner@example.com` | `demo-password` | See bookings at their venues, confirm or cancel them |

A new booking starts as **pending**. Book as the customer, then log in as the owner and confirm it under "Venue bookings"; the customer sees the status change in "My bookings". A booking nobody confirmed before its time shows as **expired**.

You can also register your own account on `/register` (always a customer). Use made-up details: no verification emails are sent, and accounts are stored in this demo's database.

## Pages

- `/` — venue list, filtered by city (`HomePage`)
- `/login` — log in (`LoginPage`)
- `/register` — create an account (`RegisterPage`)
- `/availability/:venueId` — time slot picker for a venue (`AvailabilityPage`)
- `/checkout` — choose the number of spots (up to 10), review the total and submit the booking, login required (`CheckoutPage`)
- `/confirmation` — booking received message (`ConfirmationPage`)
- `/my-bookings` — the logged-in user's bookings, grouped as waiting, confirmed, past and cancelled (newest first), login required (`MyBookingsPage`)
- `/owner/bookings` — bookings at the owner's venues, grouped as waiting, confirmed, past and cancelled (newest first), with Confirm and Cancel buttons on upcoming ones, owner only (`OwnerBookingsPage`)

Pages marked "login required" are wrapped in `RequireAuth`, which redirects visitors who aren't logged in. The owner page also checks the role and sends other users to the home page.

## State

- `src/store/authStore.ts` — the logged-in user. It is loaded from `GET /auth/me` when the app starts.
- `src/store/bookingStore.ts` — booking selections (venue, slot, price per spot, number of spots) as the user moves between pages. The customer's name and email come from the logged-in user on the backend.

Requests go through `apiFetch` in `src/lib/api.ts`, which sends the session cookie (`credentials: 'include'`) and turns backend errors into an `ApiError`.

## Scripts

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                      |
| `npm run build`        | Type-check (`tsc -b`) and build for production |
| `npm run lint`         | Run ESLint over the project                    |
| `npm run lint:fix`     | Run ESLint and auto-fix what it can            |
| `npm run preview`      | Serve the production build locally             |
| `npm test`             | Run the tests once                             |
| `npm run format`       | Format the project with Prettier               |
| `npm run format:check` | Check formatting without writing changes       |

## Tests

```bash
npm test
```

The tests are small unit tests that sit next to the code (`*.test.ts` / `*.test.tsx`). They cover the parts with real logic: `apiFetch` error handling, the auth and booking stores, the `RequireAuth` redirect and role check, the date and timezone helpers, and the booking helpers (totals, grouping, expired status). `fetch` is mocked, so the backend doesn't need to be running. The booking rules themselves are tested in the backend. There are no tests for the pages yet.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull request. It installs dependencies with `npm ci`, then runs `npm run lint`, `npm run format:check`, `npm run build` and `npm test`. The Husky pre-commit hook runs the same checks except Prettier, and CI also catches commits made with `--no-verify`.

The workflow also runs when Vercel finishes a deployment (a `repository_dispatch` event) and reports the result back as a Vercel Deployment Check, so production isn't promoted unless the checks pass. `main` is protected on GitHub and requires the `check` job to pass.

## Deployment

The app is deployed on Vercel and talks to the API on Render. Set `VITE_API_URL=/api` in the Vercel project settings.

`vercel.json` does two things:

- It forwards every `/api/...` request to the Render API. The browser then only talks to the Vercel domain, so the session cookie is first-party and isn't blocked by browsers that block third-party cookies, such as Safari.
- It serves `index.html` for every other path, so refreshing or opening a route like `/login` directly works with client-side routing.

If the API moves to another URL, update the destination in `vercel.json`. The backend's `CLIENT_URL` must be set to the exact Vercel origin.
