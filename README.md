# Poker0matic

A real-time collaborative planning poker app for agile teams. Team members join a shared room, cast story point votes anonymously, then reveal all votes simultaneously to spark estimation discussions.

Firebase Realtime Database is the only backend — there is no server. Each team brings their own Firebase project.

Release notes are generated from merged pull requests with Release Drafter. `CHANGELOG.md` is kept for historical release notes.

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

- `src/pages/index.vue` — poker room: voting, reveal, reset, real-time sync
- `src/pages/config.vue` — Firebase config input and sharing
- `src/stores/config.ts` — Pinia store: Firebase config, user identity, localStorage persistence
- `src/router/index.ts` — routes + guard that redirects to `/config` when no config is saved
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
```

## Pull request labels

Release Drafter updates the next GitHub Release draft whenever a PR is merged into `main`. Release-included PRs must have one semantic version label and one changelog category label before merge.

Required semantic version labels:

- `major` — breaking changes.
- `minor` — new features or notable user-facing behavior changes.
- `patch` — bug fixes, polish, or small maintenance changes.

Required changelog category labels:

- `feature` — new or changed user-facing functionality.
- `fix` — bug fixes and regressions.
- `chore` — release-visible maintenance, tooling, docs, or cleanup.

Optional exclusion label:

- `skip-changelog` — omit the PR from generated release notes. Use this only for work that should not appear in the release draft.

Deployment is automatic via GitHub Actions on push to `main`, publishing to GitHub Pages at `/poker0matic/`.
