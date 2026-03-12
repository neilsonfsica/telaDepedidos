<script setup lang="ts">
import {
  formatarData,
  formatarValor,
  getIconeCategoria,
  getCorCategoria,
  diasParaVencimento,
  getCorStatus,
  getTextoStatus,
  getClasseCard,
  opcoesLembretes,
} from '../geral'
import { Vencimento } from '../services/interface'

const props = defineProps<{
  vencimentos: Vencimento[]
  vencimentoAtual: Vencimento
  dialogCadastro: boolean
  modoEdicao: boolean
  filtroMes: number
  filtroAno: number
  filtroStatus: 'todos' | 'abertos' | 'pagos'
  meses: { value: number; title: string }[]
  anos: number[]
  categorias: string[]
  snackbar: boolean
  snackbarText: string
  snackbarColor: string
  totalAberto: number
  totalPago: number
  totalGeral: number
}>()

const emit = defineEmits<{
  (e: 'update:dialogCadastro', value: boolean): void
  (e: 'update:filtroMes', value: number): void
  (e: 'update:filtroAno', value: number): void
  (e: 'update:filtroStatus', value: 'todos' | 'abertos' | 'pagos'): void
  (e: 'update:vencimentoAtual', value: Vencimento): void
  (e: 'update:snackbar', value: boolean): void
  (e: 'editar', vencimento: Vencimento): void
  (e: 'excluir', vencimento: Vencimento): void
  (e: 'togglePagamento', vencimento: Vencimento): void
  (e: 'salvar'): void
  (e: 'fechar'): void
}>()

const updateVencimentoAtual = (field: keyof Vencimento, value: any) => {
  emit('update:vencimentoAtual', { ...props.vencimentoAtual, [field]: value })
}
</script>

<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-6" align="center">
      <v-col>
        <h2 class="text-h4 font-weight-bold text-white">Controle de Vencimentos</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          size="large"
          @click="emit('update:dialogCadastro', true)"
          elevation="0"
        >
          <v-icon left>mdi-plus</v-icon> NOVA CONTA
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-select
          :model-value="filtroMes"
          @update:model-value="emit('update:filtroMes', $event as number)"
          :items="meses"
          label="Mês"
          variant="solo"
          density="comfortable"
          bg-color="rgba(255,255,255,0.05)"
          dark
          hide-details
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          :model-value="filtroAno"
          @update:model-value="emit('update:filtroAno', $event as number)"
          :items="anos"
          label="Ano"
          variant="solo"
          density="comfortable"
          bg-color="rgba(255,255,255,0.05)"
          dark
          hide-details
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-btn-toggle
          :model-value="filtroStatus"
          @update:model-value="emit('update:filtroStatus', $event as any)"
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

    <v-row v-if="vencimentos.length === 0">
      <v-col cols="12">
        <div class="text-center py-16">
          <v-icon size="80" color="grey-darken-2">mdi-calendar-blank</v-icon>
          <p class="text-h6 mt-4 text-grey">Nenhum vencimento encontrado</p>
        </div>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="vencimento in vencimentos"
        :key="vencimento.id ?? vencimento.dataVencimento"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          :class="['vencimento-card', getClasseCard(vencimento)]"
          elevation="0"
          @click="emit('editar', vencimento)"
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
                  <v-icon color="white" size="28">{{
                    getIconeCategoria(vencimento.categoria)
                  }}</v-icon>
                </v-avatar>
              </v-col>
              <v-col>
                <h3 class="text-h6 font-weight-bold text-white mb-1">{{ vencimento.descricao }}</h3>
                <p class="text-caption text-grey mb-0">{{ vencimento.categoria }}</p>
              </v-col>
              <v-col cols="auto">
                <v-checkbox
                  :model-value="vencimento.pago"
                  @click.stop
                  @change="emit('togglePagamento', vencimento)"
                  hide-details
                  color="success"
                  density="compact"
                />
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
                    >{{ getTextoStatus(vencimento) }}</v-chip
                  >
                </p>
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
                    <v-icon start size="14">mdi-bell</v-icon> {{ lembrete }}d
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="px-6 pb-4 pt-0">
            <v-spacer></v-spacer>
            <v-btn icon size="small" variant="text" @click.stop="emit('excluir', vencimento)">
              <v-icon color="error">mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12" md="4">
        <v-card class="resumo-card resumo-aberto" elevation="0">
          <v-card-text class="pa-6">
            <p class="text-caption text-grey mb-2">Em Aberto</p>
            <p class="text-h4 font-weight-bold text-error mb-0">{{ formatarValor(totalAberto) }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="resumo-card resumo-pago" elevation="0">
          <v-card-text class="pa-6">
            <p class="text-caption text-grey mb-2">Pagos</p>
            <p class="text-h4 font-weight-bold text-success mb-0">{{ formatarValor(totalPago) }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="resumo-card resumo-total" elevation="0">
          <v-card-text class="pa-6">
            <p class="text-caption text-grey mb-2">Total</p>
            <p class="text-h4 font-weight-bold text-info mb-0">{{ formatarValor(totalGeral) }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog
    :model-value="dialogCadastro"
    @update:model-value="emit('update:dialogCadastro', $event)"
    max-width="700px"
    persistent
  >
    <v-card class="dialog-card">
      <v-card-title class="pa-6 pb-4">
        <span class="text-h5 font-weight-bold">{{ modoEdicao ? 'Editar' : 'Nova' }} Conta</span>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              :model-value="vencimentoAtual.descricao"
              @update:model-value="updateVencimentoAtual('descricao', $event)"
              label="Descrição *"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              :model-value="vencimentoAtual.valor"
              @update:model-value="updateVencimentoAtual('valor', $event)"
              label="Valor *"
              type="number"
              prefix="R$"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              :model-value="vencimentoAtual.categoria"
              @update:model-value="updateVencimentoAtual('categoria', $event)"
              :items="categorias"
              label="Categoria *"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            >
              <template v-slot:item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template v-slot:prepend>
                    <v-avatar :color="getCorCategoria(item.value)" size="32">
                      <v-icon color="white" size="18">{{ getIconeCategoria(item.value) }}</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              :model-value="vencimentoAtual.dataVencimento"
              @update:model-value="updateVencimentoAtual('dataVencimento', $event)"
              label="Data de Vencimento *"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              :model-value="vencimentoAtual.observacoes"
              @update:model-value="updateVencimentoAtual('observacoes', $event)"
              label="Observações"
              variant="outlined"
              density="comfortable"
              rows="3"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12">
            <p class="text-subtitle-2 mb-3">Lembretes</p>
            <v-chip-group
              :model-value="vencimentoAtual.lembretes"
              @update:model-value="updateVencimentoAtual('lembretes', $event)"
              column
              multiple
            >
              <v-chip
                v-for="opcao in opcoesLembretes"
                :key="opcao.value"
                :value="opcao.value"
                filter
                variant="outlined"
                color="primary"
              >
                <v-icon start>mdi-bell</v-icon> {{ opcao.title }} dias antes
              </v-chip>
            </v-chip-group>
          </v-col>
          <v-col cols="12">
            <v-checkbox
              :model-value="vencimentoAtual.enviarEmail"
              @update:model-value="updateVencimentoAtual('enviarEmail', $event)"
              label="Enviar notificações por email"
              hide-details
              color="primary"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-if="vencimentoAtual.enviarEmail"
              :model-value="vencimentoAtual.emailNotificacao"
              @update:model-value="updateVencimentoAtual('emailNotificacao', $event)"
              label="Email para notificações"
              type="email"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              placeholder="seu@email.com"
            />
          </v-col>
          <v-col cols="12">
            <v-checkbox
              :model-value="vencimentoAtual.adicionarCalendario"
              @update:model-value="updateVencimentoAtual('adicionarCalendario', $event)"
              label="Adicionar ao Google Calendar"
              hide-details
              color="primary"
            />
          </v-col>
          <v-col cols="12">
            <v-checkbox
              :model-value="vencimentoAtual.recorrente"
              @update:model-value="updateVencimentoAtual('recorrente', $event)"
              label="Conta recorrente (repetir mensalmente)"
              hide-details
              color="primary"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-6 pt-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="emit('fechar')" size="large">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" @click="emit('salvar')" size="large">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    :model-value="snackbar"
    @update:model-value="emit('update:snackbar', $event)"
    :color="snackbarColor"
    :timeout="3000"
    location="top right"
  >
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn variant="text" @click="emit('update:snackbar', false)"
        ><v-icon>mdi-close</v-icon></v-btn
      >
    </template>
  </v-snackbar>
</template>

<style scoped>
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
