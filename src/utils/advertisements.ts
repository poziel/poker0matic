export type AdvertisementPlacement = 'app-banner' | 'room-support'

type AdsByGoogleQueue = Array<Record<string, never>>

export interface AdSensePlacementConfig {
  publisherId: string
  slotId: string
}

declare global {
  interface Window {
    adsbygoogle?: AdsByGoogleQueue
  }
}

const ADSENSE_SCRIPT_ID = 'p0-google-adsense'
let adsenseScriptPromise: Promise<void> | null = null

export function getAdvertisementLabel (placement: AdvertisementPlacement): string {
  return placement === 'room-support' ? 'Room advertisement' : 'Application advertisement'
}

export function getAdSensePlacementConfig (placement: AdvertisementPlacement): AdSensePlacementConfig {
  return {
    publisherId: import.meta.env.VITE_ADSENSE_PUBLISHER_ID?.trim() ?? '',
    slotId: placement === 'room-support'
      ? import.meta.env.VITE_ADSENSE_ROOM_SLOT_ID?.trim() ?? ''
      : import.meta.env.VITE_ADSENSE_APP_SLOT_ID?.trim() ?? '',
  }
}

export function isAdSensePublisherId (value: string): boolean {
  return /^ca-pub-\d+$/.test(value.trim())
}

export function isAdSenseSlotId (value: string): boolean {
  return /^\d+$/.test(value.trim())
}

export function loadGoogleAdSense (publisherId: string): Promise<void> {
  if (!isAdSensePublisherId(publisherId)) {
    return Promise.reject(new Error('Invalid AdSense publisher ID.'))
  }

  if (adsenseScriptPromise) {
    return adsenseScriptPromise
  }

  const existing = document.querySelector<HTMLScriptElement>(`#${ADSENSE_SCRIPT_ID}`)
  if (existing) {
    return Promise.resolve()
  }

  adsenseScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = ADSENSE_SCRIPT_ID
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId.trim())}`
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => {
      adsenseScriptPromise = null
      reject(new Error('Google AdSense script failed to load.'))
    }, { once: true })
    document.head.append(script)
  })

  return adsenseScriptPromise
}

export function requestGoogleAdSenseFill () {
  window.adsbygoogle = window.adsbygoogle ?? []
  window.adsbygoogle.push({})
}
