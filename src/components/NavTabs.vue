<script setup lang="ts">
const props = defineProps<{
  abaSelecionada: string
}>()

const emit = defineEmits<{
  (e: 'update:abaSelecionada', value: string): void
}>()

const tabs = [
  { value: 'dashboard', icon: 'mdi-view-dashboard-outline', label: 'Dashboard' },
  { value: 'adicionar', icon: 'mdi-plus-circle-outline', label: 'Adicionar' },
  { value: 'transacoes', icon: 'mdi-swap-vertical', label: 'Transações' },
  { value: 'compras', icon: 'mdi-store-outline', label: 'Estoque' },
  { value: 'vencimentos', icon: 'mdi-calendar-clock-outline', label: 'Vencimentos' },
]
</script>

<template>
  <v-app-bar flat height="46" class="navbar">
    <div class="navbar-inner">
      <nav class="nav-track">
        <template v-for="(tab, index) in tabs" :key="tab.value">
          <button
            class="nav-btn"
            :class="{ active: abaSelecionada === tab.value }"
            @click="emit('update:abaSelecionada', tab.value)"
          >
            <v-icon size="13" color="inherit">{{ tab.icon }}</v-icon>
            {{ tab.label }}
          </button>
          <div v-if="index < tabs.length - 1" class="nav-dot" />
        </template>
      </nav>
    </div>
  </v-app-bar>
</template>

<style scoped>
.navbar {
  background: rgba(6, 9, 26, 0.98) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
}

.navbar-inner {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.nav-track {
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  color: #3a4d66;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.4px;
  transition: color 0.2s ease;
  position: relative;
  white-space: nowrap;
  font-family: inherit;
}

.nav-btn::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 50%;
  right: 50%;
  height: 2px;
  background: #00ff88;
  border-radius: 2px 2px 0 0;
  transition:
    left 0.25s ease,
    right 0.25s ease;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}

.nav-btn:hover {
  color: #6a829e;
}

.nav-btn.active {
  color: #00ff88;
}

.nav-btn.active::after {
  left: 20%;
  right: 20%;
}

.nav-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
</style>
