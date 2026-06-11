import type { FirebaseConfig } from '@/stores/config'
import { describe, expect, it } from 'vitest'
import {
  encodeFirebaseConfig,
  EXTERNAL_DOCK_SESSION_TTL_MS,
  isExternalDockSessionExpired,
} from '@/utils/externalDockSession'

const firebaseConfig: FirebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo.firebaseapp.com',
  databaseUrl: 'https://demo.firebaseio.com',
  projectId: 'demo-project',
  storageBucket: 'demo.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
}

describe('Feature: external dock session helpers', () => {
  it('Scenario: Firebase config is encoded in a URL-safe form', () => {
    const encoded = encodeFirebaseConfig(firebaseConfig)

    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
    expect(encoded).not.toContain('=')
    expect(JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))).toEqual(firebaseConfig)
  })

  it('Scenario: active sessions remain usable until their expiry time', () => {
    const now = 10_000

    expect(isExternalDockSessionExpired({
      token: 'token',
      userId: 'user-1',
      userName: 'Ada',
      createdAt: now,
      expiresAt: now + EXTERNAL_DOCK_SESSION_TTL_MS,
      status: 'waiting',
    }, now)).toBe(false)
  })

  it('Scenario: expired and closed sessions are rejected', () => {
    const now = 10_000
    const session = {
      token: 'token',
      userId: 'user-1',
      userName: 'Ada',
      createdAt: now - EXTERNAL_DOCK_SESSION_TTL_MS,
      expiresAt: now - 1,
    }

    expect(isExternalDockSessionExpired(session, now)).toBe(true)
    expect(isExternalDockSessionExpired({ ...session, expiresAt: now + 1, status: 'expired' }, now)).toBe(true)
    expect(isExternalDockSessionExpired({ ...session, expiresAt: now + 1, status: 'closed' }, now)).toBe(true)
  })
})
