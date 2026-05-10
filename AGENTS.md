# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Working rules

- Follow the existing Vue, Vuetify, Pinia, Vue Router, and Vue I18n patterns.
- Use npm for project commands.
- Keep application code in TypeScript. Vue components should use the existing Composition API and `<script setup>` style.
- Do not commit generated `dist/` output unless explicitly asked. GitHub Actions builds and deploys the app from source.
- Do not add Firebase credentials to source files. Firebase configuration is entered by the user, stored in localStorage, and can be shared through encoded URL parameters.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Type-check + Vite production build → dist/
npm run preview      # Serve dist/ locally
npm run type-check   # Vue TSC type validation only
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run mcp          # Apply Ruler MCP configuration
npm run mcp:revert   # Revert Ruler MCP configuration
```

No test framework is configured. Use `npm run type-check`, `npm run lint`, and `npm run build` as the main verification commands.

Deployment is automatic via GitHub Actions on push to `main`, building and publishing to GitHub Pages at `/poker0matic/`.

## Release and contribution conventions

### Changelog

- Keep `CHANGELOG.md` compatible with [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
- Use the standard intro, keep an `[Unreleased]` section at the top, and list releases in reverse chronological order.
- Use release headings in the form `## [1.2.3] - YYYY-MM-DD`.
- Group changes under the standard section names when they apply: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.
- Write human-readable release notes that explain user-facing or operator-facing impact. Do not dump commit logs.
- Keep version links at the bottom of the file so release sections are linkable.
- Release Drafter generates upcoming GitHub Release notes from merged PRs; update `CHANGELOG.md` manually only for historical releases or when the user explicitly asks.

### Commit messages

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Use the format `<type>(optional scope): <description>`.
- Prefer these types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, and `chore`.
- Use `feat` for user-facing additions or behavior changes, and `fix` for bug fixes.
- Mark breaking changes with `!` after the type or scope, or with a `BREAKING CHANGE:` footer.
- Keep the subject imperative, lowercase, concise, and without a trailing period.

### Pull requests and Release Drafter

- PR titles should read like release-note bullets because Release Drafter uses merged PR titles in generated release notes.
- Write PR titles in imperative present tense, for example `add release drafter workflow` or `fix room share link cleanup`.
- Keep PR titles specific enough to make sense outside the code diff. Avoid vague titles such as `update stuff`, `misc fixes`, or only an issue number.
- Put context, testing notes, screenshots, and migration details in the PR body. Release Drafter should not need to rely on commit history to explain the change.
- Every release-included PR needs one semantic version label: `major`, `minor`, or `patch`.
- Every release-included PR needs one category label: `feature`, `fix`, or `chore`.
- Use `skip-changelog` only when the PR should be omitted from generated release notes.

## Architecture

**Poker0matic** is a real-time collaborative planning poker (story point estimation) SPA. Users join a shared room, cast votes on cards, and reveal results together.

**Stack:** Vue 3, Vuetify 4, Pinia, Vue Router 5, Vue I18n, Firebase Realtime Database, TypeScript, and Vite.

### Data flow

```
User input
  -> Pinia stores (config.ts, app.ts)
  -> localStorage (Firebase config, user settings, recent rooms)
  -> Firebase Realtime Database (room state, votes, users, history)
  -> onValue listeners in page components
  -> reactive Vue UI
```

- Firebase config is base64-encoded and persisted in localStorage under `CONFIG_KEY`.
- Shared configuration links use `?config=<encoded>`.
- Room links use `/rooms/:roomId`; shared room links can include `?config=<encoded>`.
- Room state lives entirely in Firebase. There is no custom server-side logic.
- `onDisconnect()` handles automatic user cleanup when a tab closes or disconnects.

### Key files

| File | Purpose |
|---|---|
| `src/pages/index.vue` | Lobby: config validation, recent rooms, and room entry |
| `src/pages/create.vue` | Room creation flow |
| `src/pages/room.vue` | Active poker room: voting, reveal, reset, presence, history, and real-time Firebase sync |
| `src/pages/config.vue` | Standalone Firebase project config input/storage page |
| `src/components/ConfigModal.vue` | Reusable Firebase config modal used outside the standalone config page |
| `src/components/VoteDock.vue` | Vote card controls |
| `src/components/PokerTable.vue` | Table view for room participants and votes |
| `src/components/SimpleResultsGrid.vue` | Grid results view |
| `src/components/RoomSidePanel.vue` | Room details, controls, and supporting room UI |
| `src/stores/config.ts` | Pinia store for Firebase config, user profile, recent rooms, view mode, and localStorage persistence |
| `src/stores/app.ts` | Pinia store for app-level UI state such as theme, toast, and current room summary |
| `src/router/index.ts` | Routes and guards for config loading, config-required pages, and shared links |
| `src/plugins/` | Vue plugin registrations (Vuetify, Pinia, i18n, Router) |
| `src/styles/settings.scss` | Vuetify SCSS variable overrides |
| `src/App.vue` | Root layout: toolbar, theme toggle, `<router-view>` |

### Routing

Routes are defined in `src/router/index.ts`:

- `/` shows the lobby and can consume `?config=<encoded>` and `?roomId=<id>` shared-link parameters.
- `/rooms/:roomId` shows the active room and requires Firebase config.
- `/create` creates a new room and requires Firebase config.
- `/config` shows the standalone Firebase config page.
- `/attributions` shows third-party attribution information.

Config-required routes redirect to `/config?e` when no valid Firebase config is available.

### Vote cards

Defined as a constant `VOTE_OPTIONS`: `0, 1, 2, 3, 5, 8, 13, 21, 34, 55, ?, ☕`

### Vite config notes

- Base URL is `/poker0matic/` (required for GitHub Pages).
- Path alias `@` → `src/`.
- Vuetify plugin uses auto-import; the SCSS config file is `src/styles/settings.scss`.
