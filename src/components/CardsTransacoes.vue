<!-- Substitua seu v-window-item de transações por este código -->

<v-window-item value="transacoes">
  <!-- Alert quando não há transações -->
  <v-row v-if="state.transacoes.length === 0">
    <v-col cols="12">
      <v-alert type="info" class="modern-alert">
        Nenhuma transação registrada
      </v-alert>
    </v-col>
  </v-row>

  <!-- Grid de transações com novo design -->
  <v-row v-else class="transactions-grid">
    <v-col
      v-for="(t, i) in state.transacoes"
      :key="i"
      cols="12"
      sm="6"
      lg="4"
      class="transaction-col"
      :style="{ '--card-delay': `${i * 0.1}s` }"
    >
      <div
        class="transaction-card"
        :class="t.tipo === 'Receita' ? 'receita' : 'despesa'"
      >
        <!-- Cabeçalho do card -->
        <div class="card-header">
          <div class="icon-wrapper">
            <v-icon size="28">
              {{ state.iconesCategoria[t.categoria] || 'mdi-cash' }}
            </v-icon>
          </div>
          <div class="card-title-section">
            <div class="card-title">{{ t.tipo }} - {{ t.categoria }}</div>
            <div class="card-category">{{ t.tipo }}</div>
          </div>
        </div>

        <!-- Valor -->
        <div class="amount">
          R$ {{ formatCurrency(t.valor) }}
        </div>

        <!-- Rodapé do card -->
        <div class="card-footer">
          <div class="date">{{ t.data }}</div>
          <div class="description" :title="t.descricao">
            {{ t.descricao || 'Sem descrição' }}
          </div>
        </div>
      </div>
    </v-col>
  </v-row>
</v-window-item>

<script>
// Adicione este método aos seus methods se ainda não existir
export default {
  // ... seu código existente
  methods: {
    // ... seus métodos existentes

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    },
  },
}
</script>

<style scoped>
.transactions-grid {
  margin-top: 24px;
}

.transaction-col {
  animation: cardFadeIn 0.5s ease backwards;
  animation-delay: var(--card-delay);
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.transaction-card {
  background: rgba(25, 35, 70, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  height: 100%;
  cursor: pointer;
}

/* Borda superior colorida ao hover */
.transaction-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.transaction-card:hover::before {
  opacity: 1;
}

/* Efeitos de hover */
.transaction-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Cores específicas por tipo */
.transaction-card.receita {
  --accent-color: #00ff88;
}

.transaction-card.despesa {
  --accent-color: #ff4757;
}

/* Cabeçalho do card */
.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

/* Wrapper do ícone */
.icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.transaction-card:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.icon-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent-color);
  opacity: 0.15;
}

/* Estilos específicos para receita */
.transaction-card.receita .icon-wrapper {
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.transaction-card.receita .icon-wrapper .v-icon {
  color: #2ecc71 !important;
}

/* Estilos específicos para despesa */
.transaction-card.despesa .icon-wrapper {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
}

.transaction-card.despesa .icon-wrapper .v-icon {
  color: #ff4757 !important;
}

/* Seção de título */
.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-category {
  font-size: 13px;
  color: #a0aec0;
  font-weight: 500;
}

/* Valor da transação */
.amount {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -1px;
  transition: transform 0.3s ease;
}

.transaction-card:hover .amount {
  transform: scale(1.05);
}

.transaction-card.receita .amount {
  color: #2ecc71;
}

.transaction-card.despesa .amount {
  color: #ff4757;
}

/* Rodapé do card */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 12px;
}

/* Data */
.date {
  font-size: 13px;
  color: #a0aec0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.date::before {
  content: '📅';
  font-size: 14px;
}

/* Descrição */
.description {
  font-size: 13px;
  color: #a0aec0;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

/* Alert moderno */
.modern-alert {
  border-radius: 16px !important;
  backdrop-filter: blur(20px) !important;
  background: rgba(25, 35, 70, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 960px) {
  .transaction-card {
    padding: 20px;
  }

  .amount {
    font-size: 28px;
  }
}

@media (max-width: 600px) {
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .description {
    max-width: 100%;
  }

  .amount {
    font-size: 24px;
  }
}
</style>
