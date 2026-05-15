# Architecture

## Data Flow

```text
User input
  -> Pinia stores (config.ts, app.ts)
  -> localStorage (Firebase config, user settings, recent rooms)
  -> Firebase Realtime Database (room state, votes, users, history)
  -> onValue listeners in page components
  -> reactive Vue UI
```

- Firebase config is base64-encoded and persisted in localStorage under `CONFIG_KEY`.
- Shared configuration links use `?config=<encoded>`.
- Room links use `/rooms/:roomId`.
- Shared room links can include `?config=<encoded>`.
- Room state lives entirely in Firebase. There is no custom server-side logic.
- `onDisconnect()` handles automatic user cleanup when a tab closes or disconnects.

## Routing

Routes are defined in `src/router/index.ts`:

- `/` shows the lobby and can consume `?config=<encoded>` and `?roomId=<id>` shared-link parameters.
- `/rooms/:roomId` shows the active room and requires Firebase config.
- `/create` creates a new room and requires Firebase config.
- `/config` shows the standalone Firebase config page.
- `/attributions` shows third-party attribution information.

Config-required routes redirect to `/config?e` when no valid Firebase config is
available.

## Vote Cards

`VOTE_OPTIONS` contains these cards: `0, 1, 2, 3, 5, 8, 13, 21, 34, 55, ?, ☕`.

## Vite Notes

- Base URL is `/poker0matic/` for GitHub Pages.
- Path alias `@` maps to `src/`.
- Vuetify plugin uses auto-import.
- The Vuetify SCSS config file is `src/styles/settings.scss`.
