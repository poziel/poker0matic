# Refinimo

A real-time collaborative planning poker app for agile teams. Team members join a shared room, cast story point votes anonymously, then reveal all votes simultaneously to spark estimation discussions.

Firebase Realtime Database is the only backend — there is no server. Each team brings their own Firebase project.

## First-time setup

See [CONFIG.md](CONFIG.md) for step-by-step instructions on creating a Firebase project, enabling Realtime Database, and connecting it to the app.

## Stack

- Vue 3 (Composition API) + Vite
- Vuetify 4 (Material Design UI)
- Pinia (state management)
- Vue Router 5
- Vue I18n
- Firebase Realtime Database
- TypeScript

## Project structure

- `src/pages/index.vue` — public landing page and onboarding entry point at `/`
- `src/pages/app.vue` — internal application lobby at `/app`
- `src/pages/room.vue` — poker room: voting, reveal, reset, and real-time sync
- `src/pages/config.vue` — Firebase config input and sharing
- `src/stores/config.ts` — Pinia store: Firebase config, user identity, localStorage persistence
- `src/router/index.ts` — routes, shared-link handling, and page metadata updates
- `src/App.vue` — root layout: toolbar, theme toggle, router outlet
- `src/plugins/` — Vue plugin registrations

## Dev

```bash
npm install
npm run dev       # dev server on port 3000
npm run build     # type-check + production build → dist/
npm run preview   # serve dist/ locally
npm run lint      # ESLint check
npm run lint:fix  # ESLint auto-fix
npm run test      # unit tests, then browser E2E tests
npm run test:unit # Vitest unit tests
npm run test:e2e  # Playwright browser tests on port 3010
```

The test setup uses Vitest for isolated TypeScript logic and Playwright for real browser flows.
E2E specs live in `tests/e2e`, unit specs live in `tests/unit`, and test names follow a
Gherkin-inspired `Feature` / `Scenario` style for readability. Playwright starts its own
mocked E2E dev server on port 3010 by default so it does not conflict with `npm run dev`
on port 3000. Override that with `PORT=<port> npm run test:e2e` when needed.

Before running Playwright locally for the first time, install the browser binary with:

```bash
npx playwright install chromium
```

## Deployment and domain

Deployment is automatic via GitHub Actions on push to `main`, publishing to GitHub Pages. The default build base path is `/` for the custom-domain deployment at `https://refinimo.app`.

When the dedicated Refinimo domain is chosen:

1. Add `refinimo.app` as the GitHub Pages custom domain.
2. Configure the domain DNS records required by GitHub Pages.
3. Keep the repository variable `REFINIMO_BASE_PATH` unset or set to `/` so Vite builds assets for the custom-domain root.

Firebase configuration does not need to change for the current Realtime Database-only implementation. Each team still pastes its own Firebase web app config into Refinimo. If Firebase Auth, App Check, or Firebase Hosting are added later, the chosen Refinimo domain must also be added to the relevant Firebase authorized-domain or allowed-origin settings.
