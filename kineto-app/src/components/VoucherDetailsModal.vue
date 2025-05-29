<template>
  <!-- Modal Overlay -->
  <div class="modal-overlay" @click="$emit('close')">
    <!-- Modal Container -->
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-ticket-alt"></i>
          Detalii Voucher
        </h2>
        <button 
          type="button" 
          class="modal-close-btn"
          @click="$emit('close')"
          aria-label="Închide"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Voucher Header -->
        <div class="voucher-header">
          <div class="voucher-info">
            <h3 class="voucher-name">{{ voucher.name }}</h3>
            <div class="voucher-code">
              <code>{{ voucher.code }}</code>
            </div>
            <p v-if="voucher.description" class="voucher-description">{{ voucher.description }}</p>
          </div>
          <div class="voucher-status-section">
            <span class="status-badge" :class="'status-' + voucher.status.toLowerCase()">
              {{ getVoucherStatusText(voucher.status) }}
            </span>
            <button 
              class="btn btn-toggle"
              :class="voucher.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'"
              @click="toggleStatus"
              :disabled="updating"
            >
              <i class="fas fa-spinner fa-spin" v-if="updating"></i>
              <i class="fas" :class="voucher.status === 'ACTIVE' ? 'fa-pause' : 'fa-play'" v-else></i>
              {{ voucher.status === 'ACTIVE' ? 'Dezactivează' : 'Activează' }}
            </button>
          </div>
        </div>

        <!-- Information Cards Grid -->
        <div class="info-grid">
          <!-- Discount Information -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-percentage"></i>
              <h4>Informații Discount</h4>
            </div>
            <div class="card-content">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">Tip</span>
                  <span class="info-value">{{ getDiscountTypeText(voucher.discountType) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Valoare</span>
                  <span class="info-value discount-value">{{ voucher.formattedDiscountValue }}</span>
                </div>
              </div>
              <div v-if="voucher.minimumOrderValue" class="info-item">
                <span class="info-label">Comandă minimă</span>
                <span class="info-value">{{ voucher.minimumOrderValue }} RON</span>
              </div>
            </div>
          </div>

          <!-- Validity Period -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-calendar"></i>
              <h4>Perioada de Valabilitate</h4>
            </div>
            <div class="card-content">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">Început</span>
                  <span class="info-value">{{ formatDate(voucher.startDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Sfârșit</span>
                  <span class="info-value">{{ formatDate(voucher.endDate) }}</span>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">Status valabilitate</span>
                <span class="validity-badge" :class="getValidityClass()">
                  {{ getValidityText() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Usage Information -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-chart-line"></i>
              <h4>Utilizări Totale</h4>
            </div>
            <div class="card-content">
              <div class="usage-stats">
                <div class="usage-numbers">
                  <span class="current-uses">{{ voucher.currentUses }}</span>
                  <span class="usage-separator">/</span>
                  <span class="max-uses">{{ voucher.maxTotalUses || '∞' }}</span>
                </div>
                <div class="usage-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :class="getUsageProgressClass()"
                      :style="{ width: getUsagePercentage() + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-if="voucher.maxTotalUses" class="remaining-uses">
                {{ voucher.maxTotalUses - voucher.currentUses }} utilizări rămase
              </div>
            </div>
          </div>

          <!-- Per Patient Limits -->
          <div class="info-card">
            <div class="card-header">
              <i class="fas fa-user"></i>
              <h4>Limite per Pacient</h4>
            </div>
            <div class="card-content">
              <div class="info-item">
                <span class="info-label">Utilizări maxime per pacient</span>
                <span class="info-value">{{ voucher.maxUsesPerPatient || 'Nelimitat' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Creation Information -->
        <div class="creation-info">
          <div class="card-header">
            <i class="fas fa-info-circle"></i>
            <h4>Informații Creare</h4>
          </div>
          <div class="creation-grid">
            <div class="info-item">
              <span class="info-label">Creat de</span>
              <span class="info-value">{{ voucher.createdByName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Data creării</span>
              <span class="info-value">{{ formatDateTime(voucher.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ultima modificare</span>
              <span class="info-value">{{ formatDateTime(voucher.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Validation Status -->
        <div class="validation-status" :class="getValidationClass()">
          <div class="validation-header">
            <i class="fas" :class="voucher.isValid ? 'fa-check-circle' : 'fa-exclamation-triangle'"></i>
            <h4>Status Validare</h4>
          </div>
          <div v-if="voucher.isValid" class="validation-content">
            <strong>Voucher-ul este valid și poate fi utilizat.</strong>
          </div>
          <div v-else class="validation-content">
            <strong>Voucher-ul nu poate fi utilizat din următoarele motive:</strong>
            <ul class="validation-reasons">
              <li v-if="voucher.status !== 'ACTIVE'">Status: {{ getVoucherStatusText(voucher.status) }}</li>
              <li v-if="isExpired">Voucher-ul a expirat</li>
              <li v-if="voucher.hasReachedUsageLimit">A atins limita de utilizări</li>
            </ul>
          </div>
        </div>

        <!-- Voucher Preview Section -->
        <div class="voucher-preview">
          <div class="preview-header">
            <h4 class="preview-title">
              <i class="fas fa-eye"></i>
              Preview Voucher
            </h4>
            <div class="preview-badge">
              <i class="fas fa-ticket-alt"></i>
              Voucher Design
            </div>
          </div>
          
          <div class="preview-card">
            <div class="preview-voucher">
              <div class="voucher-design">
                <div class="voucher-pattern"></div>
                <div class="voucher-content">
                  <div class="voucher-header-preview">
                    <h5 class="voucher-name-preview">{{ voucher.name }}</h5>
                    <div class="voucher-code-preview">{{ voucher.code }}</div>
                  </div>
                  
                  <div class="voucher-discount-preview">
                    <div class="discount-value-large">{{ formatDiscountPreview() }}</div>
                    <div class="discount-label">DISCOUNT</div>
                  </div>
                  
                  <div class="voucher-details-preview">
                    <div class="detail-item" v-if="voucher.minimumOrderValue">
                      <i class="fas fa-shopping-cart"></i>
                      <span>Comandă min. {{ voucher.minimumOrderValue }} RON</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-calendar"></i>
                      <span>{{ formatDate(voucher.startDate) }} - {{ formatDate(voucher.endDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-chart-bar"></i>
                      <span>{{ voucher.currentUses }}{{ voucher.maxTotalUses ? `/${voucher.maxTotalUses}` : '/∞' }} utilizări</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          <i class="fas fa-times"></i>
          Închide
        </button>
        <button 
          type="button" 
          class="btn btn-primary"
          @click="viewUsageHistory"
        >
          <i class="fas fa-history"></i>
          Istoric Utilizări
        </button>
      </div>
    </div>
  </div>

  <!-- Usage History Modal -->
  <VoucherUsageHistoryModal
    v-if="showUsageHistoryModal"
    :voucher="voucher"
    @close="showUsageHistoryModal = false"
  />
</template>

<script>
import VoucherService from '../services/VoucherService.js';
import VoucherUsageHistoryModal from './VoucherUsageHistoryModal.vue';

export default {
  name: 'VoucherDetailsModal',
  components: {
    VoucherUsageHistoryModal
  },
  props: {
    voucher: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'voucher-updated'],
  data() {
    return {
      updating: false,
      showUsageHistoryModal: false
    };
  },
  computed: {
    isExpired() {
      if (!this.voucher.endDate) return false;
      return new Date(this.voucher.endDate) < new Date();
    },
    isExpiringSoon() {
      if (!this.voucher.endDate || this.isExpired) return false;
      const endDate = new Date(this.voucher.endDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }
  },
  methods: {
    async toggleStatus() {
      this.updating = true;
      try {
        const newStatus = this.voucher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const updatedVoucher = await VoucherService.updateVoucherStatus(this.voucher.id, newStatus);
        
        // Update local voucher object
        Object.assign(this.voucher, updatedVoucher);
        
        this.$emit('voucher-updated', updatedVoucher);
        this.showSuccessMessage(`Voucher ${newStatus === 'ACTIVE' ? 'activat' : 'dezactivat'} cu succes`);
        
      } catch (error) {
        console.error('Error updating voucher status:', error);
        this.showErrorMessage('Eroare la actualizarea statusului voucher-ului');
      } finally {
        this.updating = false;
      }
    },

    viewUsageHistory() {
      this.showUsageHistoryModal = true;
    },

    getVoucherStatusColor(status) {
      return VoucherService.getVoucherStatusColor(status);
    },

    getVoucherStatusText(status) {
      return VoucherService.getVoucherStatusText(status);
    },

    getDiscountTypeText(discountType) {
      return VoucherService.getDiscountTypeText(discountType);
    },

    getUsagePercentage() {
      if (!this.voucher.maxTotalUses) return 0;
      return Math.min(100, (this.voucher.currentUses / this.voucher.maxTotalUses) * 100);
    },

    getUsageProgressClass() {
      const percentage = this.getUsagePercentage();
      if (percentage >= 90) return 'bg-danger';
      if (percentage >= 70) return 'bg-warning';
      return 'bg-success';
    },

    getValidationClass() {
      return this.voucher.isValid ? 'validation-success' : 'validation-warning';
    },

    getValidityClass() {
      if (this.isExpired) return 'validity-expired';
      if (this.isExpiringSoon) return 'validity-expiring';
      return 'validity-active';
    },

    getValidityText() {
      if (this.isExpired) return 'Expirat';
      if (this.isExpiringSoon) return 'Expiră curând';
      return 'Valabil';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ro-RO');
    },

    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      return new Date(dateTimeString).toLocaleString('ro-RO');
    },

    showSuccessMessage(message) {
      // Implement toast notification
      alert(message);
    },

    showErrorMessage(message) {
      // Implement toast notification
      alert(message);
    },

    formatDiscountPreview() {
      if (!this.voucher || !this.voucher.discountValue) return '';
      
      if (this.voucher.discountType === 'PERCENTAGE') {
        return `${this.voucher.discountValue}%`;
      } else {
        return `${this.voucher.discountValue} RON`;
      }
    }
  },

  mounted() {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  },

  beforeUnmount() {
    // Restore body scroll
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
  backdrop-filter: blur(4px);
}

/* Modal Container */
.modal-container {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.modal-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.modal-title i {
  color: var(--primary-500);
}

.modal-close-btn {
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Modal Body */
.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

/* Voucher Header */
.voucher-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.voucher-info {
  flex: 1;
}

.voucher-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.voucher-code {
  display: inline-block;
  margin-bottom: var(--space-2);
}

.voucher-code code {
  background: var(--primary-100);
  color: var(--primary-700);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border: 1px solid var(--primary-200);
}

.voucher-description {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.voucher-status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-3);
}

.status-badge {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-active {
  background: var(--success-100);
  color: var(--success-700);
  border: 1px solid var(--success-200);
}

.status-inactive {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

.status-expired {
  background: var(--danger-100);
  color: var(--danger-700);
  border: 1px solid var(--danger-200);
}

.btn-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.btn-toggle:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--primary-300);
}

.btn-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Information Cards Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.info-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.card-header i {
  color: var(--primary-500);
  font-size: var(--text-lg);
}

.card-header h4 {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.discount-value {
  color: var(--primary-600);
  font-size: var(--text-base);
}

/* Validity Badge */
.validity-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.validity-expired {
  background: var(--danger-100);
  color: var(--danger-700);
  border: 1px solid var(--danger-200);
}

.validity-expiring {
  background: var(--warning-100);
  color: var(--warning-700);
  border: 1px solid var(--warning-200);
}

.validity-active {
  background: var(--success-100);
  color: var(--success-700);
  border: 1px solid var(--success-200);
}

/* Usage Stats */
.usage-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.usage-numbers {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.current-uses {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--primary-600);
}

.usage-separator {
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.max-uses {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.usage-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.bg-success {
  background: var(--success-500);
}

.bg-warning {
  background: var(--warning-500);
}

.bg-danger {
  background: var(--danger-500);
}

.remaining-uses {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

/* Creation Information */
.creation-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.creation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

/* Validation Status */
.validation-status {
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid;
}

.validation-success {
  background: var(--success-50);
  border-color: var(--success-200);
  color: var(--success-800);
}

.validation-warning {
  background: var(--warning-50);
  border-color: var(--warning-200);
  color: var(--warning-800);
}

.validation-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.validation-header h4 {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
}

.validation-content {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.validation-reasons {
  list-style: none;
  padding: 0;
  margin: var(--space-2) 0 0 0;
}

.validation-reasons li {
  padding: var(--space-1) 0;
  position: relative;
  padding-left: var(--space-4);
}

.validation-reasons li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: currentColor;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-500);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-quaternary);
  color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: var(--space-2);
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-4);
  }
  
  .voucher-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .voucher-status-section {
    align-items: flex-start;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    grid-template-columns: 1fr;
  }
  
  .creation-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Voucher Preview Section */
.voucher-preview {
  margin-top: var(--space-6);
  background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
  border: 2px solid var(--primary-200);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
  animation: previewSlideIn 0.5s ease-out;
}

@keyframes previewSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.voucher-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.preview-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--primary-700);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.preview-badge {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  box-shadow: 0 4px 12px rgba(var(--primary-500), 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.preview-card {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
}

.preview-voucher {
  width: 100%;
  max-width: 350px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
  transform: perspective(1000px) rotateX(5deg);
  transition: transform 0.3s ease;
}

.preview-voucher:hover {
  transform: perspective(1000px) rotateX(0deg) scale(1.02);
}

.voucher-design {
  position: relative;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  padding: var(--space-6);
  color: white;
}

.voucher-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 30px 30px;
}

.voucher-content {
  position: relative;
  z-index: 1;
}

.voucher-header-preview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.voucher-name-preview {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: white;
  line-height: 1.2;
}

.voucher-code-preview {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: white;
  backdrop-filter: blur(10px);
}

.voucher-discount-preview {
  text-align: center;
  margin: var(--space-6) 0;
}

.discount-value-large {
  font-size: var(--text-4xl);
  font-weight: var(--font-black);
  color: white;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.discount-label {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
  font-weight: var(--font-bold);
  letter-spacing: 0.1em;
  margin-top: var(--space-1);
}

.voucher-details-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.9);
}

.detail-item i {
  width: 16px;
  text-align: center;
}
</style> 