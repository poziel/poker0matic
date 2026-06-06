type PathRef = {
  path: string
}

type Listener = (snapshot: MockSnapshot) => void

const state: Record<string, unknown> = {}
const listeners = new Map<string, Set<Listener>>()
const pollingIntervals = new Map<string, number>()
const mockEndpoint = '/__firebase-mock'

export type Database = {
  __mockFirebaseDatabase: true
}

class MockSnapshot {
  constructor (private readonly value: unknown) {}

  val () {
    return clone(this.value)
  }

  exists () {
    return this.value !== null && this.value !== undefined
  }
}

export function getDatabase (): Database {
  return { __mockFirebaseDatabase: true }
}

export function ref (_db: Database, path = ''): PathRef {
  return { path: normalizePath(path) }
}

export async function get (pathRef: PathRef) {
  await syncPathFromServer(pathRef.path)
  return new MockSnapshot(getAtPath(pathRef.path))
}

export async function set (pathRef: PathRef, value: unknown) {
  setAtPath(pathRef.path, clone(value))
  notifyPath(pathRef.path)
  await writeToServer(pathRef.path, 'set', value)
}

export async function update (pathRef: PathRef, updates: Record<string, unknown>) {
  const changedPaths: string[] = []

  for (const [key, value] of Object.entries(updates)) {
    const childPath = joinPath(pathRef.path, key)
    setAtPath(childPath, clone(value))
    changedPaths.push(childPath)
  }

  notifyPaths([pathRef.path, ...changedPaths])
  await writeToServer(pathRef.path, 'update', updates)
}

export async function remove (pathRef: PathRef) {
  setAtPath(pathRef.path, null)
  notifyPath(pathRef.path)
  await writeToServer(pathRef.path, 'remove', null)
}

export function onValue (pathRef: PathRef, listener: Listener) {
  const path = pathRef.path
  if (!listeners.has(path)) {
    listeners.set(path, new Set())
  }
  listeners.get(path)?.add(listener)

  queueMicrotask(() => {
    if (listeners.get(path)?.has(listener)) {
      listener(new MockSnapshot(getAtPath(path)))
    }
  })

  startPollingPath(path)

  return () => {
    listeners.get(path)?.delete(listener)
    if ((listeners.get(path)?.size ?? 0) === 0) {
      stopPollingPath(path)
    }
  }
}

export async function runTransaction (
  pathRef: PathRef,
  updater: (currentValue: unknown) => unknown,
) {
  const currentValue = clone(getAtPath(pathRef.path))
  const nextValue = updater(currentValue)

  if (nextValue === undefined) {
    return {
      committed: false,
      snapshot: new MockSnapshot(currentValue),
    }
  }

  setAtPath(pathRef.path, clone(nextValue))
  notifyPath(pathRef.path)
  await writeToServer(pathRef.path, 'set', nextValue)

  return {
    committed: true,
    snapshot: new MockSnapshot(nextValue),
  }
}

async function syncPathFromServer (path: string) {
  try {
    const response = await fetch(`${mockEndpoint}?path=${encodeURIComponent(path)}`)
    if (!response.ok) {
      return
    }

    const body = await response.json() as { value: unknown }
    setAtPath(path, clone(body.value))
    notifyPath(path)
  } catch {
    // Keep local state if the dev-server mock endpoint is temporarily unavailable.
  }
}

async function writeToServer (path: string, operation: 'set' | 'update' | 'remove', value: unknown) {
  await fetch(`${mockEndpoint}?path=${encodeURIComponent(path)}`, {
    body: JSON.stringify({ operation, value }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

function startPollingPath (path: string) {
  if (pollingIntervals.has(path)) {
    return
  }

  const intervalId = window.setInterval(() => {
    void syncPathFromServer(path)
  }, 100)
  pollingIntervals.set(path, intervalId)
  void syncPathFromServer(path)
}

function stopPollingPath (path: string) {
  const intervalId = pollingIntervals.get(path)
  if (intervalId === undefined) {
    return
  }

  window.clearInterval(intervalId)
  pollingIntervals.delete(path)
}

export function onDisconnect (pathRef: PathRef) {
  return {
    async remove () {
      if (!pathRef) {
        return
      }
    },
    async cancel () {
      if (!pathRef) {
        return
      }
    },
  }
}

function notifyPaths (paths: string[]) {
  const uniquePaths = new Set(paths.flatMap(path => affectedListenerPaths(path)))
  for (const path of uniquePaths) {
    const value = getAtPath(path)
    for (const listener of listeners.get(path) ?? []) {
      queueMicrotask(() => listener(new MockSnapshot(value)))
    }
  }
}

function notifyPath (path: string) {
  notifyPaths([path])
}

function affectedListenerPaths (changedPath: string) {
  const changedSegments = splitPath(changedPath)
  return [...listeners.keys()].filter(listenerPath => {
    const listenerSegments = splitPath(listenerPath)
    return startsWithSegments(changedSegments, listenerSegments)
      || startsWithSegments(listenerSegments, changedSegments)
  })
}

function startsWithSegments (segments: string[], prefix: string[]) {
  return prefix.every((segment, index) => segments[index] === segment)
}

function getAtPath (path: string) {
  const segments = splitPath(path)
  let cursor: unknown = state

  for (const segment of segments) {
    if (!cursor || typeof cursor !== 'object' || !(segment in cursor)) {
      return null
    }
    cursor = (cursor as Record<string, unknown>)[segment]
  }

  return cursor ?? null
}

function setAtPath (path: string, value: unknown) {
  const segments = splitPath(path)
  if (segments.length === 0) {
    return
  }

  let cursor = state
  for (const segment of segments.slice(0, -1)) {
    if (!cursor[segment] || typeof cursor[segment] !== 'object' || Array.isArray(cursor[segment])) {
      cursor[segment] = {}
    }
    cursor = cursor[segment] as Record<string, unknown>
  }

  const finalSegment = segments.at(-1)
  if (!finalSegment) {
    return
  }

  if (value === null || value === undefined) {
    delete cursor[finalSegment]
    return
  }

  cursor[finalSegment] = value
}

function joinPath (basePath: string, childPath: string) {
  return normalizePath([basePath, childPath].filter(Boolean).join('/'))
}

function normalizePath (path: string) {
  return path.replace(/^\/+|\/+$/g, '')
}

function splitPath (path: string) {
  return normalizePath(path).split('/').filter(Boolean)
}

function clone<T> (value: T): T {
  if (value === null || value === undefined) {
    return value
  }
  return structuredClone(value)
}
