<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import {
  state,
  actions,
  computeds,
  saldo,
  formatCurrency,
  opcoesLembretes,
  getIconeCategoria,
  getCorCategoria,
  formatarData,
  formatarValor,
  diasParaVencimento,
  getCorStatus,
  getTextoStatus,
  getClasseCard,
} from './geral'
import { Icon } from '@iconify/vue'
import Loguin from './loguin.vue'

onMounted(async () => {
  await actions.checkLogin()
  await actions.getDespesa()
  await actions.getReceita()
  await actions.getMovimentacao()
  await nextTick()
  await actions.atualizarGraficos()
  actions.carregarDados()
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
  <Loguin v-if="!state.usuarioLogado" />
  <v-app v-else :theme="state.temaEscuro ? 'dark' : 'light'" class="app">
    <v-app-bar class="app-bar-custom" elevation="0" fixed>
      <v-container class="d-flex align-center py-0">
        <v-toolbar-title class="text-gradient font-weight-bold d-flex align-center">
          <v-avatar size="55" class="logo-avatar">
            <v-icon size="30" color="#00ff88">mdi-chart-areaspline</v-icon>
          </v-avatar>
          Controle Financeiro Pessoal
        </v-toolbar-title>

        <v-spacer />
        <v-btn icon @click="actions.logout" color="error" variant="text">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
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
            Estoque
          </v-tab>
          <v-tab value="vencimentos" class="custom-tab">
            <v-icon start size="22"> mdi-receipt-text</v-icon>
            Vencimentos
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

          <v-window-item value="vencimentos">
            <v-container fluid class="pa-6">
              <!-- Cabeçalho -->
              <v-row class="mb-6" align="center">
                <v-col>
                  <h2 class="text-h4 font-weight-bold text-white">Controle de Vencimentos</h2>
                </v-col>
                <v-col cols="auto">
                  <v-btn
                    color="primary"
                    size="large"
                    @click="state.dialogCadastro = true"
                    elevation="0"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    NOVA CONTA
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Filtros -->
              <v-row class="mb-6">
                <v-col cols="12" md="3">
                  <v-select
                    v-model="state.filtroMes"
                    :items="state.meses"
                    label="Mês"
                    variant="solo"
                    density="comfortable"
                    bg-color="rgba(255,255,255,0.05)"
                    dark
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="state.filtroAno"
                    :items="computeds.anos.value"
                    label="Ano"
                    variant="solo"
                    density="comfortable"
                    bg-color="rgba(255,255,255,0.05)"
                    dark
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn-toggle
                    v-model="state.filtroStatus"
                    color="primary"
                    mandatory
                    divided
                    density="comfortable"
                  >
                    <v-btn value="todos" class="px-8">TODOS</v-btn>
                    <v-btn value="abertos" class="px-8">EM ABERTO</v-btn>
                    <v-btn value="pagos" class="px-8">PAGOS</v-btn>
                  </v-btn-toggle>
                </v-col>
              </v-row>

              <!-- Lista de Vencimentos em Cards -->
              <v-row v-if="computeds.vencimentosFiltrados.value.length === 0">
                <v-col cols="12">
                  <div class="text-center py-16">
                    <v-icon size="80" color="grey-darken-2">mdi-calendar-blank</v-icon>
                    <p class="text-h6 mt-4 text-grey">Nenhum vencimento encontrado</p>
                  </div>
                </v-col>
              </v-row>

              <v-row v-else>
                <v-col
                  v-for="vencimento in computeds.vencimentosFiltrados.value"
                  :key="vencimento.id"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card
                    :class="['vencimento-card', getClasseCard(vencimento)]"
                    elevation="0"
                    @click="actions.editarVencimento(vencimento)"
                    style="cursor: pointer"
                  >
                    <v-card-text class="pa-6">
                      <v-row no-gutters align="center" class="mb-4">
                        <v-col cols="auto" class="mr-4">
                          <v-avatar
                            :color="getCorCategoria(vencimento.categoria)"
                            size="56"
                            class="icon-avatar"
                          >
                            <v-icon color="white" size="28">
                              {{ getIconeCategoria(vencimento.categoria) }}
                            </v-icon>
                          </v-avatar>
                        </v-col>
                        <v-col>
                          <h3 class="text-h6 font-weight-bold text-white mb-1">
                            {{ vencimento.descricao }}
                          </h3>
                          <p class="text-caption text-grey mb-0">
                            {{ vencimento.categoria }}
                          </p>
                        </v-col>
                        <v-col cols="auto">
                          <v-checkbox
                            v-model="vencimento.pago"
                            @click.stop
                            @change="actions.togglePagamento(vencimento)"
                            hide-details
                            color="success"
                            density="compact"
                          ></v-checkbox>
                        </v-col>
                      </v-row>

                      <v-divider class="mb-4" style="opacity: 0.1"></v-divider>

                      <v-row no-gutters class="mb-3">
                        <v-col>
                          <p class="text-caption text-grey mb-1">Valor</p>
                          <p
                            :class="[
                              'text-h5 font-weight-bold mb-0',
                              vencimento.pago ? 'text-success' : 'text-error',
                            ]"
                          >
                            {{ formatarValor(vencimento.valor) }}
                          </p>
                        </v-col>
                      </v-row>

                      <v-row no-gutters align="center" class="mb-3">
                        <v-col cols="auto" class="mr-2">
                          <v-icon size="18" :color="getCorStatus(vencimento)">mdi-calendar</v-icon>
                        </v-col>
                        <v-col>
                          <p class="text-body-2 text-grey mb-0">
                            {{ formatarData(vencimento.dataVencimento) }}
                            <v-chip
                              v-if="!vencimento.pago && diasParaVencimento(vencimento) <= 7"
                              :color="getCorStatus(vencimento)"
                              size="x-small"
                              class="ml-2"
                            >
                              {{ getTextoStatus(vencimento) }}
                            </v-chip>
                          </p>
                        </v-col>
                      </v-row>

                      <v-row v-if="vencimento.observacoes" no-gutters class="mb-3">
                        <v-col>
                          <p class="text-caption text-grey mb-1">{{ vencimento.observacoes }}</p>
                        </v-col>
                      </v-row>

                      <v-row v-if="vencimento.lembretes.length > 0" no-gutters>
                        <v-col>
                          <div class="d-flex flex-wrap gap-1">
                            <v-chip
                              v-for="lembrete in vencimento.lembretes"
                              :key="lembrete"
                              size="x-small"
                              variant="outlined"
                              color="info"
                            >
                              <v-icon start size="14">mdi-bell</v-icon>
                              {{ lembrete }}d
                            </v-chip>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>

                    <v-card-actions class="px-6 pb-4 pt-0">
                      <v-spacer></v-spacer>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        @click.stop="actions.excluirVencimento(vencimento)"
                      >
                        <v-icon color="error">mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Resumo Financeiro -->
              <v-row class="mt-6">
                <v-col cols="12" md="4">
                  <v-card class="resumo-card resumo-aberto" elevation="0">
                    <v-card-text class="pa-6">
                      <p class="text-caption text-grey mb-2">Em Aberto</p>
                      <p class="text-h4 font-weight-bold text-error mb-0">
                        {{ formatarValor(computeds.totalAberto.value) }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card class="resumo-card resumo-pago" elevation="0">
                    <v-card-text class="pa-6">
                      <p class="text-caption text-grey mb-2">Pagos</p>
                      <p class="text-h4 font-weight-bold text-success mb-0">
                        {{ formatarValor(computeds.totalPago.value) }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card class="resumo-card resumo-total" elevation="0">
                    <v-card-text class="pa-6">
                      <p class="text-caption text-grey mb-2">Total</p>
                      <p class="text-h4 font-weight-bold text-info mb-0">
                        {{ formatarValor(computeds.totalGeral.value) }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>

            <!-- Dialog de Cadastro/Edição -->
            <v-dialog v-model="state.dialogCadastro" max-width="700px" persistent>
              <v-card class="dialog-card">
                <v-card-title class="pa-6 pb-4">
                  <span class="text-h5 font-weight-bold">
                    {{ state.modoEdicao ? 'Editar' : 'Nova' }} Conta
                  </span>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text class="pa-6">
                  <v-form ref="formVencimento">
                    <v-row>
                      <v-col cols="12" md="8">
                        <v-text-field
                          v-model="state.vencimentoAtual.descricao"
                          label="Descrição *"
                          :rules="[(v) => !!v || 'Campo obrigatório']"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model="state.vencimentoAtual.valor"
                          label="Valor *"
                          :rules="[(v) => !!v || 'Campo obrigatório']"
                          type="number"
                          prefix="R$"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-select
                          v-model="state.vencimentoAtual.categoria"
                          :items="state.categorias"
                          label="Categoria *"
                          :rules="[(v) => !!v || 'Campo obrigatório']"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        >
                          <template v-slot:item="{ item, props }">
                            <v-list-item v-bind="props">
                              <template v-slot:prepend>
                                <v-avatar :color="getCorCategoria(item.value)" size="32">
                                  <v-icon color="white" size="18">
                                    {{ getIconeCategoria(item.value) }}
                                  </v-icon>
                                </v-avatar>
                              </template>
                            </v-list-item>
                          </template>
                        </v-select>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="state.vencimentoAtual.dataVencimento"
                          label="Data de Vencimento *"
                          :rules="[(v) => !!v || 'Campo obrigatório']"
                          type="date"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-textarea
                          v-model="state.vencimentoAtual.observacoes"
                          label="Observações"
                          variant="outlined"
                          density="comfortable"
                          rows="3"
                          hide-details="auto"
                        ></v-textarea>
                      </v-col>

                      <v-col cols="12">
                        <p class="text-subtitle-2 mb-3">Lembretes (notificações por email)</p>
                        <v-chip-group v-model="state.vencimentoAtual.lembretes" column multiple>
                          <v-chip
                            v-for="opcao in opcoesLembretes"
                            :key="opcao.value"
                            :value="opcao.value"
                            filter
                            variant="outlined"
                            color="primary"
                          >
                            <v-icon start>mdi-bell</v-icon>
                            {{ opcao.title }} dias antes
                          </v-chip>
                        </v-chip-group>
                      </v-col>

                      <v-col cols="12">
                        <v-checkbox
                          v-model="state.vencimentoAtual.enviarEmail"
                          label="Enviar notificações por email"
                          hide-details
                          color="primary"
                        ></v-checkbox>
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          v-if="state.vencimentoAtual.enviarEmail"
                          v-model="state.vencimentoAtual.emailNotificacao"
                          label="Email para notificações"
                          type="email"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          placeholder="seu@email.com"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-checkbox
                          v-model="state.vencimentoAtual.adicionarCalendario"
                          label="Adicionar ao Google Calendar"
                          hide-details
                          color="primary"
                        ></v-checkbox>
                      </v-col>

                      <v-col cols="12">
                        <v-checkbox
                          v-model="state.vencimentoAtual.recorrente"
                          label="Conta recorrente (repetir mensalmente)"
                          hide-details
                          color="primary"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="pa-6 pt-4">
                  <v-spacer></v-spacer>
                  <v-btn color="grey" variant="text" @click="actions.fecharDialog" size="large">
                    Cancelar
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="flat"
                    @click="actions.salvarVencimento"
                    size="large"
                  >
                    Salvar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Snackbar de notificação -->
            <v-snackbar
              v-model="state.snackbar"
              :color="state.snackbarColor"
              :timeout="3000"
              location="top right"
            >
              {{ state.snackbarText }}
              <template v-slot:actions>
                <v-btn variant="text" @click="state.snackbar = false">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-snackbar>
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
.logo-avatar {
  background: rgba(0, 255, 136, 0.1) !important;
  border: 1px solid rgba(0, 255, 136, 0.2);
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
.vencimento-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.vencimento-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
}

.vencimento-pago {
  border-left: 4px solid #4caf50;
}

.vencimento-vencido {
  border-left: 4px solid #f44336;
}

.vencimento-proximo {
  border-left: 4px solid #ff9800;
}

.vencimento-normal {
  border-left: 4px solid #2196f3;
}

.icon-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.resumo-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.resumo-aberto {
  border-left: 4px solid #f44336;
}

.resumo-pago {
  border-left: 4px solid #4caf50;
}

.resumo-total {
  border-left: 4px solid #2196f3;
}

.dialog-card {
  background: #1a1a2e;
}

.gap-1 {
  gap: 4px;
}
</style>
