<script setup lang="ts">
import { computed, ref } from 'vue'
import { Compra } from '../services/interface'

const props = defineProps<{
  compras: Compra[]
  novaCompra: Compra
}>()

const emit = defineEmits<{
  (e: 'update:novaCompra', value: Compra): void
  (e: 'adicionar'): void
  (e: 'usarItem', index: number): void
  (e: 'aumentarItem', index: number): void
  (e: 'deletarItem', index: number): void
}>()

const update = (field: keyof Compra, value: any) =>
  emit('update:novaCompra', { ...props.novaCompra, [field]: value })

const imagemPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const dialogOpen = ref(false)
const filtro = ref<'todos' | 'baixo' | 'ok'>('todos')

const onImagemSelecionada = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    imagemPreview.value = result
    update('imagem', result)
  }
  reader.readAsDataURL(file)
}

const limparImagem = () => {
  imagemPreview.value = null
  update('imagem', null)
  if (fileInput.value) fileInput.value.value = ''
}

const handleAdicionar = () => {
  emit('adicionar')
  dialogOpen.value = false
  imagemPreview.value = null
}

type IconInfo = { icon: string; bg: string }

const iconMap: Record<string, IconInfo> = {
  arroz: { icon: 'mdi-grain', bg: '#f59e0b' },
  feijão: { icon: 'mdi-seed', bg: '#84cc16' },
  óleo: { icon: 'mdi-bottle-tonic', bg: '#eab308' },
  macarrão: { icon: 'mdi-food-pasta', bg: '#f97316' },
  sal: { icon: 'mdi-shaker-outline', bg: '#94a3b8' },
  açúcar: { icon: 'mdi-cube-outline', bg: '#a78bfa' },
  café: { icon: 'mdi-coffee', bg: '#7c3f1e' },
  leite: { icon: 'mdi-cup', bg: '#38bdf8' },
  pão: { icon: 'mdi-bread-slice', bg: '#d97706' },
  frango: { icon: 'mdi-food-drumstick', bg: '#fb923c' },
  carne: { icon: 'mdi-food-steak', bg: '#ef4444' },
  ovos: { icon: 'mdi-egg-outline', bg: '#fbbf24' },
  manteiga: { icon: 'mdi-cube', bg: '#fde68a' },
  farinha: { icon: 'mdi-grain', bg: '#d1d5db' },
}

const categoriaMap: Record<string, string> = {
  arroz: 'Grãos',
  feijão: 'Grãos',
  macarrão: 'Massas',
  café: 'Bebidas',
  leite: 'Bebidas',
  frango: 'Carnes',
  carne: 'Carnes',
  ovos: 'Laticínios',
  manteiga: 'Laticínios',
  pão: 'Padaria',
  farinha: 'Grãos',
  sal: 'Temperos',
  açúcar: 'Temperos',
  óleo: 'Óleos',
}

const findKey = (name: string, map: Record<string, any>) =>
  Object.keys(map).find((k) => name?.toLowerCase().includes(k))

const getIconInfo = (name: string): IconInfo =>
  iconMap[findKey(name, iconMap) ?? ''] ?? { icon: 'mdi-package-variant-closed', bg: '#3b82f6' }

const getCategoria = (name: string): string =>
  categoriaMap[findKey(name, categoriaMap) ?? ''] ?? 'Geral'

const isLow = (qty: number) => qty <= 5

const comprasFiltradas = computed(() => {
  if (filtro.value === 'baixo') return props.compras.filter((c) => c.quantidade <= 5)
  if (filtro.value === 'ok') return props.compras.filter((c) => c.quantidade > 5)
  return props.compras
})

const totalUnidades = computed(() => props.compras.reduce((s, c) => s + (c.quantidade || 0), 0))
const itensEmBaixa = computed(() => props.compras.filter((c) => c.quantidade <= 5).length)
const itensOk = computed(() => props.compras.filter((c) => c.quantidade > 5).length)

const barWidth = (qty: number) => `${Math.min((qty / 50) * 100, 100)}%`
const barColor = (qty: number) => (qty <= 1 ? '#ef4444' : qty <= 3 ? '#f59e0b' : '#22c55e')
</script>

<template>
  <div class="page">
    <div class="hero mb-5">
      <div class="hero-text">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot" />
          Sistema de Estoque
        </div>
        <h1 class="hero-title">Gestão de Estoque</h1>
        <p class="hero-sub">
          {{ compras.length }} produto{{ compras.length !== 1 ? 's' : '' }} cadastrado{{
            compras.length !== 1 ? 's' : ''
          }}
          · {{ totalUnidades }} unidades no total
        </p>
      </div>
      <v-btn
        color="primary"
        rounded="pill"
        elevation="0"
        size="large"
        class="hero-btn"
        prepend-icon="mdi-plus"
        @click="dialogOpen = true"
      >
        Nova Entrada
      </v-btn>
    </div>

    <div class="header-bar mb-7">
      <div class="hbar-stats">
        <div class="hstat">
          <span class="hstat-val">{{ compras.length }}</span>
          <span class="hstat-sep">/</span>
          <span class="hstat-lbl">itens</span>
        </div>
        <div class="hbar-divider" />
        <div class="hstat hstat--green">
          <v-icon size="13" class="mr-1">mdi-check-circle-outline</v-icon>
          <span class="hstat-val">{{ itensOk }}</span>
          <span class="hstat-lbl">OK</span>
        </div>
        <div class="hbar-divider" />
        <div class="hstat hstat--red">
          <v-icon size="13" class="mr-1">mdi-alert-circle-outline</v-icon>
          <span class="hstat-val">{{ itensEmBaixa }}</span>
          <span class="hstat-lbl">em baixa</span>
        </div>
        <div class="hbar-divider" />
        <div class="hstat hstat--purple">
          <v-icon size="13" class="mr-1">mdi-counter</v-icon>
          <span class="hstat-val">{{ totalUnidades }}</span>
          <span class="hstat-lbl">unid. totais</span>
        </div>
      </div>

      <div class="filter-tabs">
        <button :class="['ftab', filtro === 'todos' ? 'ftab--on' : '']" @click="filtro = 'todos'">
          Todos
        </button>
        <button
          :class="['ftab', filtro === 'ok' ? 'ftab--on ftab--green' : '']"
          @click="filtro = 'ok'"
        >
          OK
        </button>
        <button
          :class="['ftab', filtro === 'baixo' ? 'ftab--on ftab--red' : '']"
          @click="filtro = 'baixo'"
        >
          Em Baixa
        </button>
      </div>
    </div>

    <v-row dense class="mb-8">
      <v-col v-if="comprasFiltradas.length === 0" cols="12">
        <div class="empty-wrap">
          <div class="empty-icon-wrap">
            <v-icon size="40" color="grey">mdi-package-variant-closed-remove</v-icon>
          </div>
          <p class="empty-title">Nenhum item aqui</p>
          <p class="empty-sub">Clique em "Nova Entrada" para adicionar produtos ao estoque</p>
        </div>
      </v-col>

      <v-col v-for="(c, i) in comprasFiltradas" :key="c.id ?? i" cols="12" sm="6" lg="4">
        <div class="item-card" :class="isLow(c.quantidade) ? 'item-card--low' : 'item-card--ok'">
          <div class="item-img-area">
            <img v-if="c.imagem" :src="c.imagem" :alt="c.nome" class="item-img" />
            <div
              v-else
              class="item-img-placeholder"
              :style="{ background: getIconInfo(c.nome).bg + '22' }"
            >
              <v-icon :color="getIconInfo(c.nome).bg" size="40">{{
                getIconInfo(c.nome).icon
              }}</v-icon>
            </div>

            <div
              class="status-badge"
              :class="isLow(c.quantidade) ? 'status-badge--red' : 'status-badge--green'"
            >
              <v-icon size="11">{{ isLow(c.quantidade) ? 'mdi-alert' : 'mdi-check' }}</v-icon>
              {{ isLow(c.quantidade) ? 'Baixo' : 'OK' }}
            </div>
          </div>

          <div class="item-body">
            <div class="d-flex align-start justify-space-between mb-1">
              <div>
                <div class="item-name text-capitalize">{{ c.nome }}</div>
                <div class="item-cat">{{ getCategoria(c.nome) }}</div>
              </div>
              <v-btn
                icon
                variant="text"
                size="x-small"
                color="error"
                class="delete-btn"
                @click="emit('deletarItem', i)"
              >
                <v-icon size="16">mdi-trash-can-outline</v-icon>
              </v-btn>
            </div>

            <div class="qty-row">
              <span class="qty-num" :style="{ color: barColor(c.quantidade) }">{{
                c.quantidade
              }}</span>
              <span class="qty-unit">unid.</span>
            </div>

            <div class="qty-bar-track">
              <div
                class="qty-bar-fill"
                :style="{ width: barWidth(c.quantidade), background: barColor(c.quantidade) }"
              />
            </div>

            <div class="d-flex gap-2 mt-3">
              <v-btn
                variant="tonal"
                rounded="lg"
                size="small"
                class="usar-btn flex-1"
                :color="isLow(c.quantidade) ? 'error' : 'primary'"
                :disabled="c.quantidade === 0"
                prepend-icon="mdi-minus-circle-outline"
                @click="emit('usarItem', i)"
              >
                Usar 1
              </v-btn>
              <v-btn
                variant="tonal"
                color="success"
                rounded="lg"
                size="small"
                class="usar-btn flex-1"
                prepend-icon="mdi-plus-circle-outline"
                @click="emit('aumentarItem', i)"
              >
                + 1
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogOpen" max-width="520">
      <v-card class="dialog-card" rounded="xl" elevation="0">
        <div class="dialog-header">
          <div>
            <div class="dialog-eyebrow">Estoque</div>
            <div class="dialog-title">Nova Entrada</div>
          </div>
          <v-btn icon variant="text" color="white" size="small" @click="dialogOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-6 pt-4">
          <v-form @submit.prevent="handleAdicionar">
            <div class="upload-area mb-5" @click="fileInput?.click()">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onImagemSelecionada"
              />
              <template v-if="imagemPreview">
                <img :src="imagemPreview" class="upload-preview" />
                <button class="upload-clear" type="button" @click.stop="limparImagem">
                  <v-icon size="16">mdi-close-circle</v-icon>
                </button>
              </template>
              <template v-else>
                <v-icon size="32" color="grey" class="mb-2">mdi-image-plus</v-icon>
                <p class="upload-hint">Clique para adicionar uma foto do produto</p>
                <p class="upload-hint-sub">PNG, JPG até 5MB</p>
              </template>
            </div>

            <v-text-field
              :model-value="novaCompra.nome"
              label="Nome do Item"
              placeholder="Ex: Arroz, Feijão, Café..."
              variant="outlined"
              density="comfortable"
              class="mb-3"
              hide-details
              required
              @update:model-value="update('nome', $event)"
            />
            <v-text-field
              :model-value="novaCompra.quantidade"
              label="Quantidade inicial"
              type="number"
              variant="outlined"
              density="comfortable"
              class="mb-5"
              hide-details
              min="1"
              required
              @update:model-value="update('quantidade', Number($event))"
            />

            <div class="d-flex gap-3">
              <v-btn
                variant="outlined"
                color="grey"
                rounded="lg"
                class="flex-1"
                @click="dialogOpen = false"
              >
                Cancelar
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                rounded="lg"
                elevation="0"
                class="flex-1"
                prepend-icon="mdi-cart-plus"
              >
                Adicionar
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.page {
  padding: 36px 28px;
  background: transparent;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1a6fff;
  margin-bottom: 8px;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1a6fff;
  box-shadow: 0 0 8px #1a6fff;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hero-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 6px;
}

.hero-btn {
  font-weight: 700;
  letter-spacing: 0.04em;
  font-size: 13px;
  height: 44px;
  padding: 0 24px;
  box-shadow: 0 4px 20px rgba(26, 111, 255, 0.35) !important;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 11px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
}

.hbar-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hstat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

.hstat-val {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.hstat-sep {
  color: rgba(255, 255, 255, 0.2);
  font-size: 11px;
}

.hstat-lbl {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.hbar-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.hstat--green .hstat-val,
.hstat--green .v-icon {
  color: #4ade80 !important;
}

.hstat--red .hstat-val,
.hstat--red .v-icon {
  color: #f87171 !important;
}

.hstat--purple .hstat-val,
.hstat--purple .v-icon {
  color: #c4b5fd !important;
}

.filter-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.ftab {
  padding: 6px 16px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.15s;
}

.ftab:hover {
  color: #fff;
}
.ftab--on {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.ftab--on.ftab--green {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}
.ftab--on.ftab--red {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.item-card {
  background: #0b0f1a;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-top: 3px solid transparent;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
}

.item-card--ok {
  border-top-color: #22c55e;
}
.item-card--low {
  border-top-color: #ef4444;
}

.item-img-area {
  position: relative;
  height: 160px;
  background: #0d1117;
  overflow: hidden;
  flex-shrink: 0;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.status-badge--green {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge--red {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.item-body {
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.item-cat {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 3px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.delete-btn {
  opacity: 0.4;
  transition: opacity 0.15s;
}

.delete-btn:hover {
  opacity: 1;
}

.qty-row {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 12px 0 6px;
}

.qty-num {
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}

.qty-unit {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
}

.qty-bar-track {
  height: 5px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  overflow: hidden;
}

.qty-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition:
    width 0.6s ease,
    background 0.3s;
}

.usar-btn {
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
}

.dialog-card {
  background: #111827 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.dialog-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1a6fff;
  margin-bottom: 4px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
}

.upload-area {
  position: relative;
  border: 2px dashed rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

.upload-area:hover {
  border-color: #1a6fff;
  background: rgba(26, 111, 255, 0.05);
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

.upload-clear {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  z-index: 1;
}

.upload-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}
.upload-hint-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.22);
  margin: 4px 0 0;
}

.empty-wrap {
  text-align: center;
  padding: 80px 24px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}

.empty-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.2);
}
</style>
