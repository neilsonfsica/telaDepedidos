<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const items = ref([
  {
    cliente: 'Martinho da Villa',
    vendedor: 'Sr. Omar',
    status: 'Concluído',
    minutos: 90,
  },
  {
    cliente: 'Ana Clara',
    vendedor: 'Camila',
    status: 'Concluído',
    minutos: 45,
  },
  {
    cliente: 'Guilherme Mendonça',
    vendedor: 'Malvo',
    status: 'Em separação',
    minutos: 50,
  },
  {
    cliente: 'Martinho da Villa',
    vendedor: 'Sr. Omar',
    status: 'Concluído',
    minutos: 90,
  },
  {
    cliente: 'Ana Clara',
    vendedor: 'Camila',
    status: 'Concluído',
    minutos: 45,
  },
  {
    cliente: 'Guilherme Mendonça',
    vendedor: 'Malvo',
    status: 'Em separação',
    minutos: 50,
  },
  {
    cliente: 'Martinho da Villa',
    vendedor: 'Sr. Omar',
    status: 'Concluído',
    minutos: 90,
  },
  {
    cliente: 'Ana Clara',
    vendedor: 'Camila',
    status: 'Concluído',
    minutos: 45,
  },
  {
    cliente: 'Guilherme Mendonça',
    vendedor: 'Malvo',
    status: 'Em separação',
    minutos: 50,
  },
  {
    cliente: 'Martinho da Villa',
    vendedor: 'Sr. Omar',
    status: 'Concluído',
    minutos: 90,
  },
  {
    cliente: 'Ana Clara',
    vendedor: 'Camila',
    status: 'Concluído',
    minutos: 45,
  },
  {
    cliente: 'Guilherme Mendonça',
    vendedor: 'Malvo',
    status: 'Em separação',
    minutos: 50,
  },
])

const headers = [
  { title: 'Cliente', value: 'cliente' },
  { title: 'Vendedor', value: 'vendedor' },

  { title: 'Tempo', value: 'minutos' },
]

const statusColor = (status: string) => {
  switch (status) {
    case 'Concluído':
      return 'green'
    case 'Em separação':
      return 'orange'
    default:
      return 'grey'
  }
}

const formatMinutes = (min: number) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}`
}

const currentTime = ref('')
const currentTemp = ref<string>(' ')

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('pt-BR')
}

const currentCondition = ref('')
const currentHumidity = ref('')

const fetchWeather = async () => {
  try {
    const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: {
        key: '5b88dd3f527140e39b722316252808',
        q: 'Brasília',
        lang: 'pt',
      },
    })

    const data = response.data
    currentTemp.value = `${data.current.temp_c}°C`
    currentCondition.value = data.current.condition.text
    currentHumidity.value = `${data.current.humidity}%`
  } catch (error) {
    console.error('Erro ao buscar clima:', error)
    currentTemp.value = 'N/A'
    currentCondition.value = 'Indisponível'
    currentHumidity.value = 'N/A'
  }
}

const ads = [
  '/Cartaz retrato culto de jovens religioso azul (1).png',
  '/Cartaz retrato culto de jovens religioso azul.png',
  '/Cartaz retrato culto de jovens religioso azul (2).png',
]

onMounted(() => {
  fetchWeather()
  updateTime()
})

setInterval(updateTime, 1000)
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-row align="center" class="w-100">
        <v-toolbar-title class="font-weight-bold text-center" style="width: 100%; font-size: 30px">
          <v-icon>mdi-file-document-edit-outline</v-icon>
          Orçamentos em separação
        </v-toolbar-title>

        <v-row align="center" justify="end" class="mr-4" style="gap: 24px; flex-wrap: nowrap">
          <div class="d-flex align-center">
            <v-icon class="mr-1">mdi-thermometer</v-icon>
            <span>{{ currentTemp }}</span>
          </div>

          <div class="d-flex align-center">
            <v-icon class="mr-1">mdi-water-percent</v-icon>
            <span>{{ currentHumidity }}</span>
          </div>

          <div class="d-flex align-center">
            <v-icon class="mr-1">mdi-clock-outline</v-icon>
            <span>{{ currentTime }}</span>
          </div>
        </v-row>
      </v-row>
    </v-app-bar>

    <v-main class="bg-blue-grey-lighten-5">
      <v-container fluid>
        <v-row no-gutters>
          <v-col cols="8">
            <div class="py-2 ml-2">
              <v-card style="width: 980px; margin-left: 0">
                <v-data-table
                  class="elevation-1 striped-table"
                  :headers="headers"
                  :items="items"
                  hide-default-footer
                >
                  <template #header.cliente>
                    <v-icon small class="mr-1" size="small">mdi-account-outline</v-icon>
                    Cliente
                  </template>

                  <template #header.vendedor>
                    <v-icon small class="mr-1" size="small">mdi-account-tie-outline</v-icon>
                    Vendedor
                  </template>

                  <template #header.status>
                    <v-icon small class="mr-1" size="small">mdi-information-outline</v-icon>
                    Status
                  </template>

                  <template #header.minutos>
                    <v-icon small class="mr-1" size="small">mdi-timer-outline</v-icon>
                    Tempo
                  </template>
                  <template #item.status="{ item }">
                    <v-chip :color="statusColor(item.status)">
                      {{ item.status }}
                    </v-chip>
                  </template>

                  <template #item.minutos="{ item }">
                    <v-chip variant="tonal" class="bg-blue-lighten-4">
                      ⏱ {{ formatMinutes(item.minutos) }}
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card>
            </div>
          </v-col>

          <v-col cols="4" class="py-2 pr-2 justify-content-end">
            <v-card
              class="pa-1 ml-1"
              elevation="6"
              rounded
              max-width="450"
              style="overflow: hidden"
            >
              <v-carousel
                cycle
                height="568"
                hide-delimiter-background
                show-arrows="hover"
                hide-delimiters
                interval="4000"
                continuous
                class="rounded"
              >
                <v-carousel-item v-for="(img, i) in ads" :key="i">
                  <v-img
                    :src="img"
                    cover
                    class="rounded"
                    gradient="to bottom, rgba(0,0,0,.3), rgba(0,0,0,.7)"
                    lazy-src="/path/to/placeholder.png"
                  >
                    <v-row class="fill-height" align="end" justify="center" pa-4>
                      <v-sheet class="bg-black bg-opacity-50 rounded px-3 py-1"> </v-sheet>
                    </v-row>
                  </v-img>
                </v-carousel-item>
              </v-carousel>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.v-toolbar-title {
  flex: 1;
  text-align: center;
}

.v-data-table tbody tr td {
  font-size: 18px !important;
}

.v-data-table thead tr th {
  font-size: 25px !important;
  font-weight: bold;
  background-color: #ffecb3 !important;
  color: #ff8f00 !important;
}

.large-chip {
  font-size: 16px !important;
  height: 32px !important;
  line-height: 32px !important;
}
.striped-table .v-data-table__tbody > .v-data-table__tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.striped-table .v-data-table__tbody > .v-data-table__tr:nth-child(even) {
  background-color: #e02828;
}
.temperature-display {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}
</style>
