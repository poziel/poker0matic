# Poker0matic

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
npm run test:e2e  # Playwright browser tests
```

The test setup uses Vitest for isolated TypeScript logic and Playwright for real browser flows.
E2E specs live in `tests/e2e`, unit specs live in `tests/unit`, and test names follow a
Gherkin-inspired `Feature` / `Scenario` style for readability. Before running Playwright locally
for the first time, install the browser binary with:

```bash
npx playwright install chromium
```

Deployment is automatic via GitHub Actions on push to `main`, publishing to GitHub Pages at `/poker0matic/`.
