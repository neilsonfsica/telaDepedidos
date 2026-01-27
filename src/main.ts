import { createApp, reactive } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// --- Vuetify ---
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark', // tema inicial
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
        },
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#FFCDD2',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

// --- Seu state global ---
import testeService from './services/teste.service'
import type { iSeparador } from './services/interface'

export const state = reactive({
  separador: {} as iSeparador,
})

export const actions = {
  async getPedidos() {
    state.separador = await testeService.getPedidos()
    console.log(state.separador)
    return state.separador
  },
  async init() {
    await this.getPedidos()
  },
}

// --- Criando e montando o app ---
const app = createApp(App)
app.use(vuetify)
app.mount('#app')

// Opcional: inicializa seus dados
actions.init()
