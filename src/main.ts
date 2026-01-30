import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const myCustomDarkTheme = {
  dark: true,
  colors: {
    background: '#0a0e27',
    surface: '#1a1d33',
    'surface-variant': '#20243d',
    // Cores de Destaque
    primary: '#00d4ff', // Ciano/Verde água para títulos
    secondary: '#242844', // Fundo das tags (descrição)

    // Status Financeiros (Cores extraídas da imagem)
    success: '#00c853', // Verde vibrante (Receitas)
    error: '#f51717ff', // Vermelho suave (Despesas)
    info: '#9499b3', // Cinza para textos secundários e datas
    warning: '#fb8c00', // Laranja para alertas

    'avatar-receita': '#1e3a34', // Fundo escuro do ícone de receita
    'avatar-despesa': '#3e2a3b', // Fundo escuro do ícone de despesa
    'app-bar': '#0a0e27', // Cor sólida da barra superior
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
app.mount('#app')
