<template>
  <v-app :dark="state.temaEscuro.value">
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Controle Financeiro Pessoal</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="actions.toggleTema">
        <v-icon>{{
          state.temaEscuro.value ? 'mdi-weather-sunny' : 'mdi-moon-waning-crescent'
        }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-tabs v-model="state.abaSelecionada.value" grow>
          <v-tab value="dashboard">Dashboard</v-tab>
          <v-tab value="adicionar">Adicionar</v-tab>
          <v-tab value="transacoes">Transações</v-tab>
          <v-tab value="compras">Gestão de Compras</v-tab>
        </v-tabs>

        <v-window v-model="state.abaSelecionada.value" class="mt-4">
          <v-window-item value="dashboard">
            <v-row>
              <v-col cols="12" md="4">
                <v-card class="dashboard-card">
                  <div class="barra lateral green"></div>
                  <v-card-title> <v-icon class="mr-2">mdi-cash</v-icon> Receitas </v-card-title>
                  <v-card-text class="text-h5"
                    >R$ {{ formatCurrency(state.receita.value) }}</v-card-text
                  >
                  <div class="descricao">Total de entradas</div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="dashboard-card">
                  <div class="barra lateral red"></div>
                  <v-card-title> <v-icon class="mr-2">mdi-cart</v-icon> Despesas </v-card-title>
                  <v-card-text class="text-h5"
                    >R$ {{ formatCurrency(state.despesa.value) }}</v-card-text
                  >
                  <div class="descricao">Total de saídas</div>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card class="dashboard-card">
                  <div
                    class="barra lateral"
                    :class="getters.saldo.value >= 0 ? 'blue' : 'orange'"
                  ></div>
                  <v-card-title> <v-icon class="mr-2">mdi-wallet</v-icon> Saldo </v-card-title>
                  <v-card-text class="text-h5"
                    >R$ {{ formatCurrency(state.receita.value - state.despesa.value) }}</v-card-text
                  >
                  <div class="descricao">Saldo atual</div>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-6">
              <v-col cols="12" md="6">
                <v-card class="pa-4">
                  <h3>Receitas x Despesas</h3>
                  <canvas id="grafico"></canvas>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card class="pa-4">
                  <h3>Despesas por Categoria</h3>
                  <canvas id="graficoCategoria"></canvas>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="adicionar">
            <v-card class="pa-4">
              <h3>Nova Transação</h3>
              <v-form @submit.prevent="actions.salvarTransacao">
                <v-select
                  v-model="state.novaTransacao.value.tipo"
                  :items="['Receita', 'Despesa']"
                  label="Tipo"
                  required
                />
                <v-text-field
                  v-model.number="state.novaTransacao.value.valor"
                  label="Valor (R$)"
                  type="number"
                  required
                />
                <v-select
                  v-model="state.novaTransacao.value.categoria"
                  :items="getters.categoriasFiltradas.value"
                  label="Categoria"
                  required
                />

                <v-textarea
                  v-model="state.novaTransacao.value.descricao"
                  label="Descrição"
                  auto-grow
                />
                <v-btn type="submit" color="primary" block class="mt-3">
                  <v-icon start>mdi-check</v-icon> Salvar
                </v-btn>
              </v-form>
            </v-card>
          </v-window-item>

          <v-window-item value="transacoes">
            <v-row v-if="state.transacoes.value.length === 0">
              <v-col cols="12">
                <v-alert type="info">Nenhuma transação registrada</v-alert>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col v-for="(t, i) in state.transacoes.value" :key="i" cols="12" md="6">
                <v-card outlined class="hoverable">
                  <v-card-title>
                    <v-icon class="mr-2">{{
                      state.iconesCategoria.value[t.categoria] || 'mdi-cash'
                    }}</v-icon>
                    {{ t.tipo }} - {{ t.categoria }}
                    <v-spacer />
                    <span :class="t.tipo === 'Receita' ? 'text-green' : 'text-red'">
                      R$ {{ formatCurrency(t.valor) }}
                    </span>
                  </v-card-title>
                  <v-card-subtitle>{{ t.data }}</v-card-subtitle>
                  <v-card-text>{{ t.descricao }}</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="compras">
            <v-card class="pa-4">
              <h3>Gestão de Compras</h3>
              <v-form @submit.prevent="actions.adicionarCompra">
                <v-text-field v-model="state.novaCompra.value.nome" label="Nome do Item" required />
                <v-text-field
                  v-model.number="state.novaCompra.value.quantidade"
                  label="Quantidade"
                  type="number"
                  required
                />
                <v-btn type="submit" color="primary" block class="mt-3">
                  <v-icon start>mdi-cart-plus</v-icon> Adicionar Item
                </v-btn>
              </v-form>

              <v-row class="mt-4">
                <v-col v-for="(c, i) in state.compras.value" :key="i" cols="12" md="6">
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

<script setup lang="ts">
import { onMounted } from 'vue'
import { state, getters, actions, formatCurrency } from './geral'

export interface Transacao {
  data: string
  tipo: 'Receita' | 'Despesa'
  categoria: string
  descricao: string
  valor: number
}

export interface Compra {
  nome: string
  quantidade: number
}

onMounted(() => {
  actions.atualizarGraficos()
  actions.getDespesa()
  actions.getReceita()
})
</script>

<style scoped>
.dashboard-card {
  position: relative;
  padding-left: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dashboard-card .barra {
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
}

.barra.green {
  background-color: #43a047;
}
.barra.red {
  background-color: #e53935;
}
.barra.blue {
  background-color: #1e88e5;
}
.barra.orange {
  background-color: #fb8c00;
}

.descricao {
  font-size: 0.9rem;
  color: gray;
  margin-top: 4px;
}
.hoverable:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}

.text-green {
  color: #43a047;
}
.text-red {
  color: #e53935;
}
</style>
