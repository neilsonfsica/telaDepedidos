<script setup lang="ts">
defineProps<{
  usuarioNome: string
  usuarioFoto: string
}>()

defineEmits<{
  (e: 'logout'): void
  (e: 'abrirPerfil'): void
}>()
</script>

<template>
  <v-app-bar class="topbar" elevation="0" height="60">
    <div class="topbar-inner">

      <div class="brand" @click="$emit('abrirPerfil')">
        <div class="brand-logo">
          <v-icon size="16" color="#00ff88">mdi-chart-line</v-icon>
        </div>
        <span class="brand-text">Controle <em>Financeiro</em></span>
      </div>


      <div class="user-area">
        <div class="user-pill" @click="$emit('abrirPerfil')">
          <div class="avatar-ring">
            <div class="avatar-inner">
              <v-img v-if="usuarioFoto" :src="usuarioFoto" cover />
              <span v-else>{{ usuarioNome?.[0]?.toUpperCase() }}</span>
            </div>
          </div>
          <span class="user-name">{{ usuarioNome }}</span>
        </div>

        <div class="sep" />

        <button class="logout-btn" @click="$emit('logout')">
          <v-icon size="15" color="inherit">mdi-logout-variant</v-icon>
        </button>
      </div>
    </div>
  </v-app-bar>
</template>

<style scoped>
.topbar {
  background: rgba(8, 12, 32, 0.98) !important;
  border-bottom: none !important;
  position: relative;
}

.topbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 255, 136, 0.15) 30%,
    rgba(0, 255, 136, 0.3) 50%,
    rgba(0, 255, 136, 0.15) 70%,
    transparent 100%
  );
}

.topbar-inner {
  width: 100%;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 255, 136, 0.06);
  border: 1px solid rgba(0, 255, 136, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.brand-logo:hover {
  background: rgba(0, 255, 136, 0.12);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
}

.brand-text {
  font-size: 14px;
  font-weight: 700;
  color: #c8d4e8;
  letter-spacing: 0.2px;
  font-style: normal;
}

.brand-text em {
  color: #00ff88;
  font-style: normal;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 24px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
}

.user-pill:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.06);
}

.avatar-ring {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.4), rgba(0, 180, 255, 0.4));
  padding: 1.5px;
  flex-shrink: 0;
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #1a1f3a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #00ff88;
  overflow: hidden;
}

.user-name {
  font-size: 12.5px;
  font-weight: 500;
  color: #8896aa;
  letter-spacing: 0.1px;
}

.sep {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0 4px;
}

.logout-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255, 70, 100, 0.08);
  color: #ff4d6d;
}
</style>
