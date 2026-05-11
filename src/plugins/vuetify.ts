import { createVuetify } from 'vuetify'
import { DEFAULT_THEME_ID, THEME_DEFINITIONS } from '@/utils/themes'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetify = createVuetify({
  theme: {
    defaultTheme: DEFAULT_THEME_ID,
    themes: Object.fromEntries(
      THEME_DEFINITIONS.map(theme => [theme.id, {
        dark: theme.dark,
        colors: theme.colors,
      }]),
    ),
  },
})

export default vuetify
