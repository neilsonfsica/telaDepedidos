<script setup lang="ts">
import { formatCurrency } from '../geral'

defineProps<{
  receita: number
  despesa: number
  saldo: number
}>()
</script>

<template>
  <!-- Cards de resumo -->
  <v-row class="mb-2">
    <!-- Receitas -->
    <v-col cols="12" md="4">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        style="
          background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-left: 3px solid #4ade80;
        "
      >
        <div class="glow glow--green" />
        <v-card-text class="pa-7">
          <v-row align="center" no-gutters>
            <v-col cols="auto" class="mr-4">
              <v-sheet
                rounded="lg"
                width="48"
                height="48"
                color="transparent"
                class="d-flex align-center justify-center"
                style="
                  border: 1px solid rgba(74, 222, 128, 0.2);
                  background: rgba(74, 222, 128, 0.08);
                "
              >
                <v-icon color="#4ade80" size="22">mdi-trending-up</v-icon>
              </v-sheet>
            </v-col>
            <v-col>
              <div
                class="text-caption font-weight-bold text-uppercase mb-1"
                style="color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em"
              >
                Receitas
              </div>
              <div class="text-h6 font-weight-black" style="color: #fff; letter-spacing: -0.02em">
                R$ {{ formatCurrency(receita) }}
              </div>
            </v-col>
            <v-col cols="auto">
              <v-chip size="small" color="#4ade80" variant="tonal" rounded="lg">+</v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Despesas -->
    <v-col cols="12" md="4">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        style="
          background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-left: 3px solid #f87171;
        "
      >
        <div class="glow glow--red" />
        <v-card-text class="pa-7">
          <v-row align="center" no-gutters>
            <v-col cols="auto" class="mr-4">
              <v-sheet
                rounded="lg"
                width="48"
                height="48"
                color="transparent"
                class="d-flex align-center justify-center"
                style="
                  border: 1px solid rgba(248, 113, 113, 0.2);
                  background: rgba(248, 113, 113, 0.08);
                "
              >
                <v-icon color="#f87171" size="22">mdi-trending-down</v-icon>
              </v-sheet>
            </v-col>
            <v-col>
              <div
                class="text-caption font-weight-bold text-uppercase mb-1"
                style="color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em"
              >
                Despesas
              </div>
              <div class="text-h6 font-weight-black" style="color: #fff; letter-spacing: -0.02em">
                R$ {{ formatCurrency(despesa) }}
              </div>
            </v-col>
            <v-col cols="auto">
              <v-chip size="small" color="#f87171" variant="tonal" rounded="lg">−</v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Saldo -->
    <v-col cols="12" md="4">
      <v-card
        rounded="xl"
        elevation="0"
        class="summary-card"
        :style="`background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%); border: 1px solid rgba(255,255,255,0.09); border-left: 3px solid ${saldo >= 0 ? '#60a5fa' : '#fb923c'};`"
      >
        <div class="glow" :class="saldo >= 0 ? 'glow--blue' : 'glow--orange'" />
        <v-card-text class="pa-7">
          <v-row align="center" no-gutters>
            <v-col cols="auto" class="mr-4">
              <v-sheet
                rounded="lg"
                width="48"
                height="48"
                color="transparent"
                class="d-flex align-center justify-center"
                :style="`border: 1px solid ${saldo >= 0 ? 'rgba(96,165,250,0.2)' : 'rgba(251,146,60,0.2)'}; background: ${saldo >= 0 ? 'rgba(96,165,250,0.08)' : 'rgba(251,146,60,0.08)'};`"
              >
                <v-icon :color="saldo >= 0 ? '#60a5fa' : '#fb923c'" size="22"
                  >mdi-wallet-outline</v-icon
                >
              </v-sheet>
            </v-col>
            <v-col>
              <div
                class="text-caption font-weight-bold text-uppercase mb-1"
                style="color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em"
              >
                Saldo
              </div>
              <div
                class="text-h6 font-weight-black"
                :style="`color: ${saldo >= 0 ? '#60a5fa' : '#fb923c'}; letter-spacing: -0.02em;`"
              >
                R$ {{ formatCurrency(saldo) }}
              </div>
            </v-col>
            <v-col cols="auto">
              <v-chip
                size="small"
                :color="saldo >= 0 ? '#60a5fa' : '#fb923c'"
                variant="tonal"
                rounded="lg"
              >
                {{ saldo >= 0 ? '=' : '!' }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Gráficos -->
  <v-row class="mt-2">
    <v-col cols="12" md="6">
      <v-card
        rounded="xl"
        elevation="0"
        height="100%"
        style="
          background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
        "
      >
        <v-card-title class="pa-5 pb-0">
          <v-row align="center" no-gutters>
            <v-col>
              <div
                class="text-caption font-weight-bold text-uppercase mb-1"
                style="color: #1a6fff; letter-spacing: 0.12em"
              >
                Visão Geral
              </div>
              <div class="text-subtitle-1 font-weight-black" style="color: #fff">
                Receitas x Despesas
              </div>
            </v-col>
            <v-col cols="auto">
              <v-avatar size="10" color="#1a6fff" style="box-shadow: 0 0 8px #1a6fff" />
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider class="mt-3 mx-5" style="border-color: rgba(255, 255, 255, 0.06)" />
        <v-card-text class="pa-5 pt-4">
          <div style="position: relative; height: 380px">
            <canvas id="grafico"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card
        rounded="xl"
        elevation="0"
        height="100%"
        style="
          background: linear-gradient(135deg, #0f1520 0%, #1a1f2e 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
        "
      >
        <v-card-title class="pa-5 pb-0">
          <v-row align="center" no-gutters>
            <v-col>
              <div
                class="text-caption font-weight-bold text-uppercase mb-1"
                style="color: #a855f7; letter-spacing: 0.12em"
              >
                Distribuição
              </div>
              <div class="text-subtitle-1 font-weight-black" style="color: #fff">
                Despesas por Categoria
              </div>
            </v-col>
            <v-col cols="auto">
              <v-avatar size="10" color="#a855f7" style="box-shadow: 0 0 8px #a855f7" />
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider class="mt-3 mx-5" style="border-color: rgba(255, 255, 255, 0.06)" />
        <v-card-text class="pa-5 pt-4">
          <div style="position: relative; height: 380px">
            <canvas id="graficoCategoria"></canvas>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.summary-card {
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5) !important;
}

.glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  filter: blur(45px);
  opacity: 0.18;
  pointer-events: none;
}
.glow--green {
  background: #4ade80;
}
.glow--red {
  background: #f87171;
}
.glow--blue {
  background: #60a5fa;
}
.glow--orange {
  background: #fb923c;
}
</style>
