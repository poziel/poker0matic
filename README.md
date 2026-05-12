# Poker0matic

A real-time collaborative planning poker app for agile teams. Team members join a shared room, cast story point votes anonymously, then reveal all votes simultaneously to spark estimation discussions.

## Backend support

Poker0matic now exposes a backend provider selector in the configuration UI and supports these providers:

- `Firebase`
- `Supabase`
- `PocketBase`
- `Appwrite`

Important: the non-Firebase providers need their storage schema created correctly before Poker0matic can use them. The app does not provision those tables or collections for you.

## First-time setup

See [CONFIG.md](CONFIG.md) for the full setup guide. The most important part is choosing a backend provider and filling the matching fields correctly.

## Backend setup by provider

### Firebase

Status: fully supported.

This is the only provider you can use today for actual rooms, voting, history, and real-time collaboration.

How to start:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable `Realtime Database`.
3. Register a `Web App` inside the project settings.
4. Copy the values from the Firebase config snippet into Poker0matic.

What each field means:

- `apiKey`: public API key for your web app. Copy it from the Firebase web config snippet.
- `authDomain`: your Firebase auth domain, usually something like `your-project.firebaseapp.com`.
- `databaseUrl`: the Realtime Database URL, usually something like `https://your-project-default-rtdb.firebaseio.com`.
- `projectId`: the Firebase project id.
- `storageBucket`: the project storage bucket shown in the web config snippet.
- `messagingSenderId`: the Firebase messaging sender id from the same snippet.
- `appId`: the Firebase web app id from the same snippet.

Where to find them:

- `Project settings -> General -> Your apps -> Web app config`
- `Build -> Realtime Database` for `databaseUrl`

### Supabase

Status: supported after you create the expected table schema.

How to start a Supabase project:

1. Create a project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Wait for the database and API to finish provisioning.
3. Open `Project Settings -> API`.
4. Copy the values below into Poker0matic.

What each field means:

- `url`: the project API URL, usually `https://<project-ref>.supabase.co`.
- `anonKey`: the public anonymous API key used by browser clients.
- `projectRef`: the short project reference used in your Supabase URLs and dashboard.

Where to find them:

- `Project Settings -> API -> Project URL`
- `Project Settings -> API -> anon public key`
- `Project Settings -> General` or the project URL itself for `projectRef`

Required table:

```sql
create table if not exists public.poker_rooms (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at bigint not null default 0
);
```

If Row Level Security is enabled, your `anonKey` must be allowed to `select`, `insert`, and `update` rows in `public.poker_rooms`.

### PocketBase

Status: supported after you create the expected collection schema.

How to start a PocketBase project:

1. Start a PocketBase server on your machine or host.
2. Open the PocketBase admin UI.
3. Create an admin account if this is a fresh instance.
4. Copy the server URL and the admin credentials into Poker0matic.

What each field means:

- `url`: the base URL of your PocketBase server, for example `http://127.0.0.1:8090` or your hosted domain.
- `email`: the PocketBase admin email.
- `password`: the PocketBase admin password.

Where to find them:

- `url`: wherever your PocketBase instance is exposed
- `email` and `password`: the admin account you created for that instance

Required collection:

- collection name: `poker_rooms`
- fields:
- `roomId` as text
- `payload` as json
- `updatedAt` as number

Poker0matic authenticates with the PocketBase superuser credentials you provide, then stores one room payload record per room.

### Appwrite

Status: supported after you create the expected collection schema.

How to start an Appwrite project:

1. Create a project in the [Appwrite Console](https://cloud.appwrite.io/).
2. Add a web platform if needed.
3. Create a database and a collection intended to hold room data.
4. Generate an API key with the permissions your future backend integration will need.
5. Copy the values below into Poker0matic.

What each field means:

- `endpoint`: the Appwrite API endpoint, such as `https://cloud.appwrite.io/v1`.
- `projectId`: the Appwrite project id.
- `apiKey`: the Appwrite API key.
- `databaseId`: the database id containing your room data.
- `roomsCollectionId`: the collection id intended for rooms.

Where to find them:

- `endpoint`: your Appwrite instance URL plus `/v1`
- `projectId`: project settings in Appwrite
- `apiKey`: `Overview` or `Integrations/API Keys`, depending on your Appwrite setup
- `databaseId` and `roomsCollectionId`: `Databases`

Required collection:

- collection id: the value you put in `roomsCollectionId`
- attributes:
- `payload` as a large string / long text attribute
- `updatedAt` as an integer attribute

Poker0matic stores one document per room, using the room code as the document id.

## Stack

- Vue 3 (Composition API) + Vite
- Vuetify 4 (Material Design UI)
- Pinia (state management)
- Vue Router 5
- Vue I18n
- Firebase Realtime Database
- TypeScript

## Project structure

- `src/pages/index.vue` - lobby and configuration status
- `src/pages/config.vue` - backend config input and sharing
- `src/stores/config.ts` - Pinia store for backend config, user identity, and local persistence
- `src/backend/` - backend provider contract and provider implementations
- `src/router/index.ts` - routes + guard that redirects to `/config` when no config is saved
- `src/App.vue` - root layout and global config modal
- `src/plugins/` - Vue plugin registrations

## Dev

```bash
npm install
npm run dev       # dev server on port 3000
npm run build     # type-check + production build -> dist/
npm run preview   # serve dist/ locally
npm run lint      # ESLint check
npm run lint:fix  # ESLint auto-fix
```

Deployment is automatic via GitHub Actions on push to `main`, publishing to GitHub Pages at `/poker0matic/`.
