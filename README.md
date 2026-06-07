# Refinimo

![Refinimo logo](public/images/logo.png)

Refinimo is a collaborative planning poker app for teams that want estimation sessions to feel simple, quick, and a little less ceremonial.

Create a room, invite your teammates, vote privately, reveal together, and use the discussion to land on a shared estimate. Refinimo runs as a static web app and uses your own Firebase Realtime Database project for live room sync, so there is no custom backend server to deploy or maintain.

## Why Refinimo Exists

Planning poker is best when it stays out of the way.

Refinimo gives teams the core loop they need:

- create a planning room
- pick an estimation deck
- invite people with a link
- vote without anchoring each other
- reveal the spread
- discuss outliers
- save the useful bits for later

It also includes the practical extras that real sessions eventually ask for: custom decks, task context, round history, timers, leader mode, reactions, profile/avatar preferences, and a separate voting dock for another screen or device.

<details>
<summary>Show screenshots</summary>

### Landing

![Refinimo landing page](docs/screenshots/landing.png)

### Lobby

![Refinimo lobby](docs/screenshots/lobby.png)

### Revealed Room

![Refinimo room with revealed votes](docs/screenshots/room-results.png)

</details>

## How It Works

Refinimo is intentionally small in shape:

```text
Browser app + Firebase Realtime Database = live planning room
```

The Vue app handles the interface, routing, preferences, voting logic, and result display. Firebase stores the shared room state so every participant sees the same room update in real time.

In practice:

1. Someone configures Refinimo with a Firebase web app config.
2. They create a room.
3. Refinimo writes the room to Firebase under `rooms/{roomId}`.
4. Everyone joins the same room link.
5. Votes, reveals, timers, participants, and history sync through Firebase.
6. Personal preferences, such as display name, avatar, theme, recent rooms, and ad opt-in, stay in browser storage.

That means teams keep control of their Firebase project and room data. Refinimo provides the interface; your Firebase project provides the live sync.

## Run It Locally

Clone the repository:

```bash
git clone git@github.com:poziel/refinimo.git
cd refinimo
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

To use real rooms locally, create a Firebase project, enable Realtime Database, register a Firebase Web app, and paste the generated config into Refinimo. The detailed Firebase walkthrough lives in [CONFIG.md](CONFIG.md).

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vuetify
- Pinia
- Vue Router
- Firebase Realtime Database
- Vitest
- Playwright
- ESLint

<details>
<summary>Show the project shape</summary>

```text
src/
  pages/          Route-level screens: landing, lobby, config, create, room, dock
  components/     Room UI, voting controls, profile/config modals, history panels
  stores/         Pinia state for app UI, Firebase config, identity, preferences
  composables/    Shared room and voting behavior
  utils/          Firebase helpers, ad handling, dock links, avatars, timers
  types/          Room, vote, task, timer, and history contracts

tests/
  unit/           Vitest coverage for focused logic
  e2e/            Playwright browser flows

public/
  404.html        GitHub Pages fallback for client-side routes
```

</details>

## Useful Commands

```bash
npm run dev          # start the local Vite dev server
npm run build        # type-check and build production assets
npm run preview      # preview the production build
npm run type-check   # run vue-tsc
npm run lint         # run ESLint
npm run lint:fix     # auto-fix lint issues when possible
npm run test:unit    # run Vitest unit tests
npm run test:e2e     # run Playwright E2E tests
npm run test:e2e:ui  # open the Playwright test UI
npm run test         # run unit tests, then E2E tests
```

Before running Playwright for the first time:

```bash
npx playwright install chromium
```

The E2E suite uses a mocked Firebase server, so tests can exercise room flows without requiring a live Firebase project.

## Deployment

Refinimo is built as static files and is intended to be hosted at:

```text
https://refinimo.app
```

For the custom domain, keep the Vite base path at `/`. GitHub Pages deep links are handled by `public/404.html`, which lets routes such as `/app/room/:roomId` recover correctly after a browser refresh.

Firebase Realtime Database does not need a special domain change for the current app. If Firebase Auth, App Check, or Firebase Hosting are added later, the deployed domain should be added to the relevant Firebase allowed-domain settings.

## Credits

Refinimo is built with Vue, Vite, Vuetify, Firebase, DiceBear, Material Design Icons, Playwright, Vitest, and a lot of small open-source gifts that make web apps nicer to build.
