import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// ✅ IMPORT TOAST
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const myCustomDarkTheme = {
  dark: true,
  colors: {
    background: '#0a0e27',
    surface: '#1a1d33',
    'surface-variant': '#20243d',

    primary: '#00d4ff',
    secondary: '#242844',

    success: '#00c853',
    error: '#f51717ff',
    info: '#9499b3',
    warning: '#fb8c00',

    'avatar-receita': '#1e3a34',
    'avatar-despesa': '#3e2a3b',
    'app-bar': '#0a0e27',
  },
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'myCustomDarkTheme',
    themes: {
      myCustomDarkTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },

  defaults: {
    VSheet: {
      rounded: 'lg',
    },
  },
})

const app = createApp(App)

app.use(vuetify)

app.use(Toast)

app.mount('#app')
