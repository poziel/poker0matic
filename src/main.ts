/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import { applyDocumentTheme } from '@/utils/themeBootstrap'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'
import './styles/settings.scss'

applyDocumentTheme()

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
