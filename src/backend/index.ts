import type { BackendClient, BackendConfig } from '@/backend/types'
import { createAppwriteBackendClient } from '@/backend/providers/appwrite'
import { createFirebaseBackendClient, resetFirebaseBackendRuntime } from '@/backend/providers/firebase'
import { createPocketBaseBackendClient } from '@/backend/providers/pocketbase'
import { createSupabaseBackendClient } from '@/backend/providers/supabase'

export function createBackendClient (config: BackendConfig): BackendClient {
  switch (config.provider) {
    case 'firebase': {
      return createFirebaseBackendClient(config)
    }
    case 'supabase': {
      return createSupabaseBackendClient(config)
    }
    case 'pocketbase': {
      return createPocketBaseBackendClient(config)
    }
    case 'appwrite': {
      return createAppwriteBackendClient(config)
    }
  }
}

export function resetBackendRuntime () {
  resetFirebaseBackendRuntime()
}
