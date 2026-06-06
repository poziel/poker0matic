import { isValidCustomAvatarUrl } from '@/utils/avatarStyles'

type NsfwPrediction = {
  className: 'Drawing' | 'Hentai' | 'Neutral' | 'Porn' | 'Sexy'
  probability: number
}

type NsfwModel = {
  classify: (image: HTMLImageElement, topK?: number) => Promise<NsfwPrediction[]>
}

type NsfwModule = {
  load: (
    modelName: 'MobileNetV2Mid',
    options: {
      modelDefinitions: unknown[]
    },
  ) => Promise<NsfwModel>
}

type NsfwModelDefinitionsModule = {
  MobileNetV2MidModel: unknown
}

export type AvatarModerationStatus = 'idle' | 'checking' | 'approved' | 'blocked' | 'unavailable'

export interface AvatarModerationResult {
  status: Exclude<AvatarModerationStatus, 'idle' | 'checking'>
  predictions?: NsfwPrediction[]
  score?: number
  reason?: string
}

const BLOCK_THRESHOLD = 0.72
const REVIEW_THRESHOLD = 0.86
const NSFW_CLASSES = new Set<NsfwPrediction['className']>(['Hentai', 'Porn', 'Sexy'])

let modelPromise: Promise<NsfwModel> | null = null

export async function moderateCustomAvatarUrl (url: string): Promise<AvatarModerationResult> {
  if (!isValidCustomAvatarUrl(url)) {
    return {
      status: 'unavailable',
      reason: 'Enter a valid http or https image URL before checking it.',
    }
  }

  if (import.meta.env.VITE_POKER0MATIC_E2E === '1') {
    return { status: 'approved', predictions: [], score: 0 }
  }

  try {
    const [model, image] = await Promise.all([loadModel(), loadImageForModeration(url)])
    const predictions = await model.classify(image, 5)
    const score = scorePredictions(predictions)

    if (score >= BLOCK_THRESHOLD) {
      return {
        status: 'blocked',
        predictions,
        score,
        reason: 'This image looks too sexualized for a player avatar.',
      }
    }

    return { status: 'approved', predictions, score }
  } catch {
    return {
      status: 'unavailable',
      reason: 'This image could not be checked in the browser. Some external hosts block client-side inspection.',
    }
  }
}

function scorePredictions (predictions: NsfwPrediction[]): number {
  return predictions.reduce((score, prediction) => {
    if (!NSFW_CLASSES.has(prediction.className)) {
      return score
    }
    const weightedProbability = prediction.className === 'Sexy'
      ? prediction.probability * 0.75
      : prediction.probability
    return score + weightedProbability
  }, 0)
}

async function loadModel (): Promise<NsfwModel> {
  if (!modelPromise) {
    modelPromise = Promise.all([
      import('@tensorflow/tfjs'),
      import('nsfwjs/core') as Promise<NsfwModule>,
      import('nsfwjs/models/mobilenet_v2_mid') as Promise<NsfwModelDefinitionsModule>,
    ]).then(([, nsfwjs, { MobileNetV2MidModel }]) =>
      nsfwjs.load('MobileNetV2Mid', { modelDefinitions: [MobileNetV2MidModel] }),
    )
  }
  return modelPromise
}

function loadImageForModeration (url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.referrerPolicy = 'no-referrer'
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Avatar image could not be loaded for moderation.')))
    image.src = url
  })
}

export function isModerationResultBlocking (result: AvatarModerationResult | null): boolean {
  return !!result && result.status === 'blocked'
}

export function formatModerationScore (result: AvatarModerationResult | null): string {
  if (!result?.score) {
    return ''
  }
  return `${Math.round(Math.min(result.score, REVIEW_THRESHOLD) * 100)}%`
}
