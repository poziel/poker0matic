import type { ViewMode } from '@/stores/config'
import type { AvatarModerationStatus } from '@/utils/avatarModeration'
import type { AvatarCrop, AvatarSource } from '@/utils/avatarStyles'
import type { ThemeId } from '@/utils/themes'

export interface SettingsDraft {
  theme: ThemeId
  avatarSource: AvatarSource
  avatarStyle: string
  avatarSeed: string
  avatarBg: string
  gravatarEmail: string
  customAvatarUrl: string
  customAvatarCrop: AvatarCrop | null
  customAvatarModerationStatus: AvatarModerationStatus
  userName: string
  viewMode: ViewMode
  enableAds: boolean
}
