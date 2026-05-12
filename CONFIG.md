# Backend Setup Guide

Poker0matic supports multiple backend providers, but the non-Firebase ones require you to create their storage schema first:

- `Firebase`: ready after standard Firebase setup
- `Supabase`: requires the `poker_rooms` table
- `PocketBase`: requires the `poker_rooms` collection
- `Appwrite`: requires a room collection with the expected attributes

---

## Firebase

### Step 1 - Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in.
2. Click **Add project**.
3. Enter a project name such as `my-team-poker`.
4. Disable Google Analytics if you do not need it.
5. Finish creating the project.

### Step 2 - Enable Realtime Database

1. Open **Build -> Realtime Database**.
2. Click **Create Database**.
3. Choose a region close to your team.
4. Select **Start in test mode** for initial setup.
5. Finish the database creation flow.

You will see a database URL like:

```text
https://my-team-poker-default-rtdb.firebaseio.com
```

### Step 3 - Register a web app

1. Open **Project settings**.
2. In **Your apps**, click the web icon `</>`.
3. Register a web app, for example `poker0matic`.
4. Copy the generated config snippet.

It looks like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "my-team-poker.firebaseapp.com",
  databaseURL: "https://my-team-poker-default-rtdb.firebaseio.com",
  projectId: "my-team-poker",
  storageBucket: "my-team-poker.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### Step 4 - Paste the values into Poker0matic

Open Poker0matic configuration and choose `Firebase`.

Field mapping:

| Poker0matic field | Firebase value | Meaning |
|---|---|---|
| `apiKey` | `apiKey` | Public browser API key for the Firebase web app |
| `authDomain` | `authDomain` | Firebase auth hostname for the project |
| `databaseUrl` | `databaseURL` | Realtime Database base URL |
| `projectId` | `projectId` | Firebase project id |
| `storageBucket` | `storageBucket` | Project storage bucket |
| `messagingSenderId` | `messagingSenderId` | Firebase Cloud Messaging sender id |
| `appId` | `appId` | Unique id of the Firebase web app |

### Step 5 - Share the config with your team

1. Save the config.
2. Click **Share config**.
3. Send the copied URL to teammates.

### Firebase security rules

The default test-mode rules expire after 30 days. Replace them with:

```json
{
  "rules": {
    "rooms": {
      ".read": false,
      ".write": false,

      "$room_id": {
        ".read": "true",
        ".write": "true",

        "users": {
          "$user_id": {
            ".validate": "newData.hasChildren(['name', 'joinedAt'])",
            "name": { ".validate": "newData.isString() && newData.val().length <= 20" }
          }
        },
        "settings": {
          "showVotes": { ".validate": "newData.isBoolean()" },
          "v": { ".validate": "newData.isNumber()" }
        },
        "lastActivity": { ".validate": "newData.isNumber()" }
      }
    }
  }
}
```

---

## Supabase

Status: supported once the table exists.

How to prepare Supabase:

1. Create a project in [Supabase](https://supabase.com/dashboard).
2. Open **Project Settings -> API**.
3. Choose `Supabase` in Poker0matic config.
4. Fill the fields below.

Field meaning:

| Poker0matic field | Where it comes from | Meaning |
|---|---|---|
| `url` | Project URL | Base URL of your Supabase project |
| `anonKey` | anon public key | Public browser key used to call Supabase |
| `projectRef` | project URL or project settings | The short project identifier |

Example:

```text
url: https://abcd1234.supabase.co
projectRef: abcd1234
```

Create this table before using Poker0matic:

```sql
create table if not exists public.poker_rooms (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at bigint not null default 0
);
```

If you use Row Level Security, the role behind your `anonKey` must be allowed to:

- `select`
- `insert`
- `update`

on `public.poker_rooms`.

---

## PocketBase

Status: supported once the collection exists.

To prepare a PocketBase instance:

1. Start or host PocketBase.
2. Open the PocketBase admin UI.
3. Create an admin account.
4. Choose `PocketBase` in Poker0matic config.
5. Fill the fields below.

Field meaning:

| Poker0matic field | Where it comes from | Meaning |
|---|---|---|
| `url` | Your PocketBase server address | Base URL of the running PocketBase instance |
| `email` | Admin login | PocketBase admin email |
| `password` | Admin login | PocketBase admin password |

Example:

```text
url: http://127.0.0.1:8090
```

Create this collection before using Poker0matic:

- collection name: `poker_rooms`
- fields:
- `roomId` as text
- `payload` as json
- `updatedAt` as number

Poker0matic logs in with the superuser credentials you provide and then reads/writes records in that collection.

---

## Appwrite

Status: supported once the collection exists.

To prepare an Appwrite project:

1. Create a project in [Appwrite](https://cloud.appwrite.io/).
2. Create a database.
3. Create a collection intended for room data.
4. Generate an API key.
5. Choose `Appwrite` in Poker0matic config.
6. Fill the fields below.

Field meaning:

| Poker0matic field | Where it comes from | Meaning |
|---|---|---|
| `endpoint` | Your Appwrite instance URL + `/v1` | Base Appwrite API endpoint |
| `projectId` | Project settings | Appwrite project id |
| `apiKey` | API keys section | API key for the integration |
| `databaseId` | Databases | Database id where room data will live |
| `roomsCollectionId` | Databases -> collection | Collection id intended for rooms |

Example:

```text
endpoint: https://cloud.appwrite.io/v1
```

Create this collection before using Poker0matic:

- collection id: whatever you put in `roomsCollectionId`
- attributes:
- `payload` as long text / large string
- `updatedAt` as integer

Poker0matic stores one document per room and uses the room code as the document id.
