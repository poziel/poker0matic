/// <reference types="vite/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_ADSENSE_PUBLISHER_ID?: string
  readonly VITE_ADSENSE_APP_SLOT_ID?: string
  readonly VITE_ADSENSE_ROOM_SLOT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
