<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { state, actions, computeds, saldo, formatCurrency } from './geral'
import { Icon } from '@iconify/vue'

onMounted(async () => {
  console.log('Componente montado, carregando dados...')
  await actions.getDespesa()
  await actions.getReceita()
  await actions.getMovimentacao()

  await nextTick()
  await actions.atualizarGraficos()
})

watch(
  () => state.abaSelecionada,
  async (newVal) => {
    if (newVal === 'dashboard') {
      await nextTick()
      await actions.atualizarGraficos()
    }
  },
)
</script>

<template>
  <v-app :theme="state.temaEscuro ? 'dark' : 'light'" class="app">
    <v-app-bar class="app-bar-custom" elevation="0" fixed>
      <v-container class="d-flex align-center py-0">
        <v-toolbar-title class="text-gradient font-weight-bold d-flex align-center">
          <v-icon size="28">mdi- mdi-chart-areaspline</v-icon>
          Controle Financeiro Pessoal
        </v-toolbar-title>

        <v-spacer />
      </v-container>
    </v-app-bar>
    <v-app-bar flat height="70" class="app-bar-custom px-4">
      <v-row justify="center" align="center" class="w-100">
        <v-tabs
          v-model="state.abaSelecionada"
          color="primary"
          align-tabs="center"
          hide-slider
          class="custom-tabs-container"
        >
          <v-tab value="dashboard" class="custom-tab">
            <v-icon start size="22">mdi-finance</v-icon>
            Dashboard
          </v-tab>

          <v-tab value="adicionar" class="custom-tab">
            <v-icon start size="22">mdi-plus-circle</v-icon>
            Adicionar
          </v-tab>

          <v-tab value="transacoes" class="custom-tab">
            <v-icon start size="22">mdi-swap-vertical</v-icon>
            Transações
          </v-tab>

          <v-tab value="compras" class="custom-tab">
            <v-icon start size="22">mdi-cart</v-icon>
            Gestão de Compras
          </v-tab>
        </v-tabs>
      </v-row>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-window v-model="state.abaSelecionada" class="mt-4 justify-center">
          <v-window-item value="dashboard">
            <v-row>
              <v-col cols="12" md="4">
                <v-card class="dashboard-card">
                  <div class="barra green"></div>
                  <v-card-title> <v-icon class="mr-2">mdi-cash</v-icon> Receitas </v-card-title>
                  <v-card-text class="text-h5">R$ {{ formatCurrency(state.receita) }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="dashboard-card">
                  <div class="barra red"></div>
                  <v-card-title> <v-icon class="mr-2">mdi-cart</v-icon> Despesas </v-card-title>
                  <v-card-text class="text-h5">R$ {{ formatCurrency(state.despesa) }}</v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="dashboard-card">
                  <div class="barra" :class="saldo >= 0 ? 'blue' : 'orange'"></div>
                  <v-card-title> <v-icon class="mr-2">mdi-wallet</v-icon> Saldo </v-card-title>
                  <v-card-text class="text-h5"> R$ {{ formatCurrency(saldo) }} </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-6">
              <v-col cols="12" md="6">
                <v-card class="pa-4 graficos">
                  <h3 class="mb-4">Receitas x Despesas</h3>
                  <div class="chart-container">
                    <canvas id="grafico"></canvas>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card class="pa-4 graficos">
                  <h3 class="mb-4">Despesas por Categoria</h3>
                  <div class="chart-container">
                    <canvas id="graficoCategoria"></canvas>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="adicionar">
            <v-card class="pa-4 adicionarTransacao">
              <h3>Nova Transação</h3>
              <v-form @submit.prevent="actions.salvarTransacao">
                <v-select
                  v-model="state.novaTransacao.tipo"
                  :items="state.escolherTipo"
                  label="Tipo"
                  required
                />
                <v-text-field
                  v-model.number="state.novaTransacao.valor"
                  label="Valor (R$)"
                  type="number"
                  required
                />
                <v-select
                  v-model="state.novaTransacao.categoria"
                  :items="computeds.categoriaFiltro.value"
                  label="Categoria"
                  required
                />

                <v-textarea v-model="state.novaTransacao.descricao" label="Descrição" auto-grow />
                <v-btn type="submit" color="primary" block class="mt-3">
                  <v-icon start>mdi-check</v-icon> Salvar
                </v-btn>
              </v-form>
            </v-card>
          </v-window-item>

          <v-window-item value="transacoes">
            <v-row v-if="state.transacoes.length === 0">
              <v-col cols="12">
                <v-alert type="info">Nenhuma transação registrada</v-alert>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col v-for="(t, i) in state.transacoes" :key="i" cols="12" md="4">
                <v-card flat class="transaction-card pa-4" max-width="450">
                  <div class="d-flex align-center mb-6">
                    <v-avatar
                      :class="t.tipo === 'Receita' ? 'avatar-receita' : 'avatar-despesa'"
                      size="56"
                      rounded="lg"
                      class="mr-4"
                    >
                      <Icon
                        :icon="
                          state.iconesCategoria[t.categoria] || 'fluent-emoji:money-with-wings'
                        "
                        width="32"
                      />
                    </v-avatar>

                    <div>
                      <div class="text-h6 font-weight-bold mb-n1 text-white">
                        {{ t.tipo }} - {{ t.categoria }}
                      </div>
                      <div class="text-body-2 text-subtitle">
                        {{ t.tipo }}
                      </div>
                    </div>
                  </div>

                  <div
                    class="text-h4 font-weight-bold mb-4"
                    :class="t.tipo === 'Receita' ? 'valor-receita' : 'valor-despesa'"
                  >
                    R$ {{ formatCurrency(t.valor) }}
                  </div>

                  <v-divider class="mb-4 divider-opaco"></v-divider>

                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center text-body-2 text-subtitle">
                      <v-icon size="18" class="mr-2">mdi-calendar-range</v-icon>
                      {{ t.data }}
                    </div>

                    <v-sheet class="description-tag px-4 py-2" max-width="200">
                      <span class="text-truncate d-inline-block w-100">
                        {{ t.descricao || 'Sem descrição' }}
                      </span>
                    </v-sheet>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="compras">
            <v-card class="pa-4 adicionarTransacao">
              <h3>Gestão de Compras</h3>
              <v-form @submit.prevent="actions.adicionarCompra">
                <v-text-field v-model="state.novaCompra.nome" label="Nome do Item" required />
                <v-text-field
                  v-model.number="state.novaCompra.quantidade"
                  label="Quantidade"
                  type="number"
                  required
                />
                <v-btn type="submit" color="primary" block class="mt-3">
                  <v-icon start>mdi-cart-plus</v-icon> Adicionar Item
                </v-btn>
              </v-form>

              <v-row class="mt-4">
                <v-col v-for="(c, i) in state.compras" :key="i" cols="12" md="6">
                  <v-card outlined>
                    <v-card-title>
                      {{ c.nome }}
                      <v-spacer />
                      <span :class="c.quantidade <= 1 ? 'text-red' : 'text-green'">
                        {{ c.quantidade }} unidade(s)
                      </span>
                    </v-card-title>
                    <v-card-text>
                      <v-btn
                        small
                        color="primary"
                        @click="actions.usarItem(i)"
                        :disabled="c.quantidade === 0"
                      >
                        Usar 1 unidade
                      </v-btn>
                      <span v-if="c.quantidade <= 1" class="text-red ml-2">⚠️ Estoque baixo!</span>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.adicionarTransacao {
  background-color: #1a1d33;
  border-radius: 10px;
}
.graficos {
  background-color: #1a1d33;
  min-height: 25rem;
}
.barra {
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
  z-index: 1;
}

.barra.green {
  background-color: #00e676;
}

.barra.red {
  background-color: #ff1744;
}

.barra.blue {
  background-color: rgb(var(--v-theme-primary));
}

.barra.orange {
  background-color: rgb(var(--v-theme-warning));
}

.v-card.dashboard-card {
  position: relative;
  padding-left: 12px;
  overflow: hidden;
  border-radius: 10px;
  background-color: #1a1d33;
}
.app {
  background-color: #0a0e27;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(0, 212, 255, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(0, 200, 83, 0.03) 0%, transparent 50%);
  background-attachment: fixed;
  min-height: 100vh;
}
.v-card.transaction-card {
  background-color: #1a1d33;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  transition: transform 0.2s ease;
}

.v-card.transaction-card:hover {
  transform: translateY(-4px);
  background-color: #20243d;
}

.valor-receita {
  color: #0bf36c;
}

.valor-despesa {
  color: #fd0000;
}

.avatar-despesa {
  background-color: #3e2a3b;
}

.avatar-receita {
  background-color: #1e3a34;
}

.text-subtitle {
  color: #9499b3;
}

.divider-opaco {
  border-color: rgba(255, 255, 255, 0.08);
}

.description-tag {
  background-color: rgba(36, 40, 68, 0.8);
  color: #9499b3;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

:deep(.v-toolbar.app-bar-custom) {
  background: rgba(10, 14, 39, 0.7);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.text-gradient {
  color: #00ff88;
  font-weight: 800;
  letter-spacing: -0.5px;
}
</style>
