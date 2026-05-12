import type { BackendClient, FirebaseBackendConfig } from '@/backend/types'
import type { RoomHistoryEntry, RoomRecord, RoomUser, RoundEditLock } from '@/types/room'
import { deleteApp, type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  type Database,
  ref as dbRef,
  get,
  getDatabase,
  onDisconnect,
  onValue,
  runTransaction,
  set,
  update,
} from 'firebase/database'

let activeFirebaseKey: string | null = null
let activeFirebaseApp: FirebaseApp | null = null
let activeDatabase: Database | null = null

function getFirebaseDatabase (config: FirebaseBackendConfig): Database {
  const serialized = JSON.stringify(config)
  if (activeDatabase && activeFirebaseKey === serialized) {
    return activeDatabase
  }

  const staleApps = [...getApps()]
  const app = getApps().length > 0
    ? getApp()
    : initializeApp({
        apiKey: config.settings.apiKey,
        authDomain: config.settings.authDomain,
        databaseURL: config.settings.databaseUrl,
        projectId: config.settings.projectId,
        storageBucket: config.settings.storageBucket,
        messagingSenderId: config.settings.messagingSenderId,
        appId: config.settings.appId,
      })
  const db = getDatabase(app)

  activeFirebaseKey = serialized
  activeFirebaseApp = app
  activeDatabase = db

  if (staleApps.length > 0 && staleApps.every(staleApp => staleApp.name === app.name)) {
    return db
  }

  for (const staleApp of staleApps) {
    if (staleApp.name !== app.name) {
      deleteApp(staleApp).catch(() => {})
    }
  }

  return db
}

async function validateFirebaseConfig (config: FirebaseBackendConfig) {
  const baseUrl = String(config.settings.databaseUrl).replace(/\/$/, '')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(`${baseUrl}/.json?shallow=true&print=silent`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    return (response.ok || response.status === 401 || response.status === 403) ? 'valid' : 'unreachable'
  } catch {
    clearTimeout(timer)
    return 'unreachable'
  }
}

function normalizeHistory (value: unknown): RoomHistoryEntry[] {
  if (!value || typeof value !== 'object') {
    return []
  }
  return Object.values(value as Record<string, RoomHistoryEntry>).toSorted((a, b) => a.round - b.round)
}

export function resetFirebaseBackendRuntime () {
  activeFirebaseKey = null
  activeDatabase = null
  if (!activeFirebaseApp) {
    return
  }
  deleteApp(activeFirebaseApp).catch(() => {})
  activeFirebaseApp = null
}

export function createFirebaseBackendClient (config: FirebaseBackendConfig): BackendClient {
  const db = getFirebaseDatabase(config)

  return {
    provider: 'firebase',
    validateConfig: () => validateFirebaseConfig(config),
    async roomExists (roomId) {
      const snapshot = await get(dbRef(db, `rooms/${roomId}/createdAt`))
      return snapshot.exists()
    },
    async createRoom (roomId, room, initialUser, userId) {
      await set(dbRef(db, `rooms/${roomId}`), room)
      await set(dbRef(db, `rooms/${roomId}/users/${userId}`), initialUser)
      onDisconnect(dbRef(db, `rooms/${roomId}/users/${userId}`)).remove()
    },
    subscribeRoom (roomId, callback) {
      return onValue(dbRef(db, `rooms/${roomId}`), snapshot => {
        callback((snapshot.val() as RoomRecord | null) ?? null)
      })
    },
    subscribeUsers (roomId, callback) {
      return onValue(dbRef(db, `rooms/${roomId}/users`), snapshot => {
        callback((snapshot.val() as Record<string, RoomUser> | null) ?? {})
      })
    },
    subscribeHistory (roomId, callback) {
      return onValue(dbRef(db, `rooms/${roomId}/history`), snapshot => {
        callback(normalizeHistory(snapshot.val()))
      })
    },
    async upsertUser (roomId, userId, updatesValue) {
      const userRef = dbRef(db, `rooms/${roomId}/users/${userId}`)
      await update(userRef, updatesValue)
      onDisconnect(userRef).remove()
    },
    async updateRoom (roomId, updatesValue) {
      await update(dbRef(db, `rooms/${roomId}`), updatesValue)
    },
    async acquireRoundEditLock (roomId, lock) {
      const lockRef = dbRef(db, `rooms/${roomId}/roundEditLock`)
      const result = await runTransaction(lockRef, current => {
        const currentValue = current as RoundEditLock | null
        if (currentValue && currentValue.userId !== lock.userId) {
          return
        }
        return lock
      })

      if (!result.committed) {
        return false
      }

      const lockValue = result.snapshot.val() as RoundEditLock | null
      if (lockValue?.userId !== lock.userId) {
        return false
      }

      onDisconnect(lockRef).remove()
      return true
    },
    async releaseRoundEditLock (roomId, userId) {
      const roomRef = dbRef(db, `rooms/${roomId}`)
      const lockSnapshot = await get(dbRef(db, `rooms/${roomId}/roundEditLock`))
      const currentLock = lockSnapshot.val() as RoundEditLock | null
      if (!currentLock || currentLock.userId !== userId) {
        return
      }
      await update(roomRef, {
        roundEditLock: null,
        lastActivity: Date.now(),
      })
    },
  }
}
