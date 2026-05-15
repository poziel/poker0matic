# Key Files

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
| `src/plugins/` | Vue plugin registrations for Vuetify, Pinia, i18n, and Router |
| `src/styles/settings.scss` | Vuetify SCSS variable overrides |
| `src/App.vue` | Root layout, toolbar, theme toggle, and `<router-view>` |
