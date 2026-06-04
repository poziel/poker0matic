import type { ViewMode } from '@/stores/config'
import type { ThemeId } from '@/utils/themes'

export interface SettingsDraft {
  theme: ThemeId
  avatarStyle: string
  avatarSeed: string
  avatarBg: string
  userName: string
  viewMode: ViewMode
}
