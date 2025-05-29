<template>
  <!-- Modal Overlay -->
  <div class="modal-overlay" @click="$emit('close')">
    <!-- Modal Container -->
    <div class="modal-container large-modal" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          <i class="fas fa-history"></i>
          Istoric Utilizări Voucher
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
        <!-- Voucher Info Header -->
        <div class="voucher-info-header">
          <div class="voucher-summary">
            <h3 class="voucher-name">{{ voucher.name }}</h3>
            <div class="voucher-code">
              <code>{{ voucher.code }}</code>
            </div>
          </div>
          <div class="usage-summary">
            <div class="summary-item">
              <span class="summary-label">Total utilizări</span>
              <span class="summary-value">{{ voucher.currentUses }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Discount total acordat</span>
              <span class="summary-value">{{ totalDiscountGiven }} RON</span>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="filters-section">
          <div class="filters-row">
            <div class="filter-group">
              <label class="filter-label">Căutare pacient</label>
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  placeholder="Caută după nume pacient..."
                  v-model="searchTerm"
                  @input="debouncedSearch"
                />
              </div>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Perioada</label>
              <select class="form-control" v-model="filterPeriod" @change="loadUsageHistory">
                <option value="">Toate</option>
                <option value="today">Astăzi</option>
                <option value="week">Ultima săptămână</option>
                <option value="month">Ultima lună</option>
                <option value="quarter">Ultimele 3 luni</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">&nbsp;</label>
              <button class="btn btn-secondary btn-reset" @click="clearFilters">
                <i class="fas fa-undo"></i>
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Usage History Content -->
        <div class="history-content">
          <!-- Loading State -->
          <div v-if="loading" class="state-container loading-state">
            <div class="state-content">
              <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <p class="state-message">Se încarcă istoricul utilizărilor...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="usageHistory.length === 0" class="state-container empty-state">
            <div class="state-content">
              <div class="empty-icon">
                <i class="fas fa-history"></i>
              </div>
              <h4 class="state-title">Nu există utilizări</h4>
              <p class="state-message">
                {{ searchTerm || filterPeriod ? 'Nu s-au găsit utilizări pentru criteriile selectate.' : 'Acest voucher nu a fost încă utilizat.' }}
              </p>
            </div>
          </div>

          <!-- Usage History List -->
          <div v-else class="usage-list">
            <div v-for="usage in usageHistory" :key="usage.id" class="usage-item">
              <div class="usage-main">
                <div class="usage-header">
                  <div class="patient-info">
                    <div class="patient-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="patient-details">
                      <h4 class="patient-name">{{ usage.patientName }}</h4>
                      <p class="patient-email">{{ usage.patientEmail }}</p>
                    </div>
                  </div>
                  <div class="usage-date">
                    <span class="date-label">Utilizat la</span>
                    <span class="date-value">{{ formatDateTime(usage.usedAt) }}</span>
                  </div>
                </div>
                
                <div class="usage-details">
                  <div class="detail-row">
                    <div class="detail-item">
                      <i class="fas fa-shopping-cart detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Valoare comandă</span>
                        <span class="detail-value">{{ usage.orderAmount }} RON</span>
                      </div>
                    </div>
                    
                    <div class="detail-item">
                      <i class="fas fa-percentage detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Discount aplicat</span>
                        <span class="detail-value discount-value">{{ usage.discountAmount }} RON</span>
                      </div>
                    </div>
                    
                    <div class="detail-item">
                      <i class="fas fa-receipt detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Total plătit</span>
                        <span class="detail-value final-amount">{{ usage.finalAmount }} RON</span>
                      </div>
                    </div>
                    
                    <div class="detail-item" v-if="usage.medicName">
                      <i class="fas fa-user-md detail-icon"></i>
                      <div class="detail-content">
                        <span class="detail-label">Medic</span>
                        <span class="detail-value">{{ usage.medicName }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="usage.notes" class="usage-notes">
                    <i class="fas fa-sticky-note"></i>
                    <span>{{ usage.notes }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-section">
            <div class="pagination-info">
              Afișează {{ (currentPage * pageSize) + 1 }}-{{ Math.min((currentPage + 1) * pageSize, totalElements) }} din {{ totalElements }} utilizări
            </div>
            <div class="pagination-controls">
              <button 
                class="btn btn-pagination"
                :disabled="currentPage === 0"
                @click="goToPage(currentPage - 1)"
              >
                <i class="fas fa-chevron-left"></i>
                Anterior
              </button>
              
              <div class="page-numbers">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="btn btn-page"
                  :class="{ 'active': page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page + 1 }}
                </button>
              </div>
              
              <button 
                class="btn btn-pagination"
                :disabled="currentPage >= totalPages - 1"
                @click="goToPage(currentPage + 1)"
              >
                Următorul
                <i class="fas fa-chevron-right"></i>
              </button>
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
          @click="exportHistory"
          :disabled="usageHistory.length === 0"
        >
          <i class="fas fa-download"></i>
          Exportă CSV
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import VoucherService from '../services/VoucherService.js';

// Props
const props = defineProps({
  voucher: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['close']);

// Reactive data
const loading = ref(false);
const usageHistory = ref([]);
const searchTerm = ref('');
const filterPeriod = ref('');
const currentPage = ref(0);
const pageSize = ref(10);
const totalElements = ref(0);
const totalPages = ref(0);

// Computed properties
const totalDiscountGiven = computed(() => {
  return usageHistory.value.reduce((total, usage) => total + (usage.discountAmount || 0), 0).toFixed(2);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(0, currentPage.value - 2);
  const end = Math.min(totalPages.value - 1, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Methods
const loadUsageHistory = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    };
    
    if (searchTerm.value) {
      params.search = searchTerm.value;
    }
    
    if (filterPeriod.value) {
      params.period = filterPeriod.value;
    }
    
    const response = await VoucherService.getVoucherUsageHistoryById(props.voucher.id, currentPage.value, pageSize.value);
    
    usageHistory.value = response.content || [];
    totalElements.value = response.totalElements || 0;
    totalPages.value = response.totalPages || 0;
  } catch (error) {
    console.error('Error loading usage history:', error);
    usageHistory.value = [];
  } finally {
    loading.value = false;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  loadUsageHistory();
};

const clearFilters = () => {
  searchTerm.value = '';
  filterPeriod.value = '';
  currentPage.value = 0;
  loadUsageHistory();
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ro-RO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const exportHistory = () => {
  // Create CSV content
  const headers = ['Data utilizare', 'Pacient', 'Email pacient', 'Valoare comandă', 'Discount aplicat', 'Total plătit', 'Medic'];
  const csvContent = [
    headers.join(','),
    ...usageHistory.value.map(usage => [
      formatDateTime(usage.usedAt),
      `"${usage.patientName}"`,
      usage.patientEmail,
      usage.orderAmount,
      usage.discountAmount,
      usage.finalAmount,
      `"${usage.medicName || ''}"`
    ].join(','))
  ].join('\n');
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `istoric-voucher-${props.voucher.code}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Debounced search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 0;
    loadUsageHistory();
  }, 500);
};

// Lifecycle
onMounted(() => {
  loadUsageHistory();
});

// Watchers
watch(() => props.voucher.id, () => {
  if (props.voucher.id) {
    currentPage.value = 0;
    loadUsageHistory();
  }
});
</script>

<style scoped>
/* Modal Base Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
}

.modal-container {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.large-modal {
  max-width: 1200px;
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0;
}

.modal-title i {
  color: var(--primary-500);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: var(--text-lg);
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.modal-close-btn:hover {
  background: var(--neutral-100);
  color: var(--text-primary);
}

/* Modal Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

/* Voucher Info Header */
.voucher-info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-5);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}

.voucher-summary h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.voucher-code {
  margin-bottom: var(--space-3);
}

.voucher-code code {
  background: var(--primary-50);
  color: var(--primary-700);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-family: 'Courier New', monospace;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.usage-summary {
  display: flex;
  gap: var(--space-6);
}

.summary-item {
  text-align: right;
}

.summary-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-1);
}

.summary-value {
  display: block;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--primary-600);
}

/* Filters Section */
.filters-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}

.filters-row {
  display: flex;
  gap: var(--space-4);
  align-items: end;
}

.filter-group {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.search-input {
  padding-left: var(--space-10);
}

.form-control {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(8, 145, 242, 0.1);
}

.btn-reset {
  white-space: nowrap;
}

/* History Content */
.history-content {
  min-height: 400px;
}

/* State Containers */
.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.state-content {
  text-align: center;
  max-width: 400px;
}

.loading-spinner i {
  font-size: 2rem;
  color: var(--primary-500);
  margin-bottom: var(--space-4);
}

.empty-icon i {
  font-size: 3rem;
  color: var(--text-light);
  margin-bottom: var(--space-4);
}

.state-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.state-message {
  color: var(--text-muted);
  margin: 0;
}

/* Usage List */
.usage-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.usage-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition-fast);
}

.usage-item:hover {
  border-color: var(--primary-200);
  box-shadow: var(--shadow-md);
}

.usage-main {
  padding: var(--space-5);
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.patient-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.patient-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-600);
}

.patient-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
}

.patient-email {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

.usage-date {
  text-align: right;
}

.date-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: var(--space-1);
}

.date-value {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

/* Usage Details */
.usage-details {
  border-top: 1px solid var(--border-light);
  padding-top: var(--space-4);
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.detail-icon {
  color: var(--text-muted);
  font-size: var(--text-sm);
  width: 16px;
}

.detail-content {
  flex: 1;
}

.detail-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: var(--space-1);
}

.detail-value {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.discount-value {
  color: var(--secondary-600);
  font-weight: var(--font-semibold);
}

.final-amount {
  color: var(--primary-600);
  font-weight: var(--font-semibold);
}

.usage-notes {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--neutral-50);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.usage-notes i {
  color: var(--text-muted);
  margin-top: 2px;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-light);
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-pagination {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

.page-numbers {
  display: flex;
  gap: var(--space-1);
}

.btn-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
}

.btn-page.active {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-600);
  border-color: var(--primary-600);
}

.btn-secondary {
  background: var(--neutral-100);
  color: var(--text-secondary);
  border-color: var(--border-medium);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--neutral-200);
  border-color: var(--border-dark);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }
  
  .voucher-info-header {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .usage-summary {
    width: 100%;
    justify-content: space-between;
  }
  
  .filters-row {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .pagination-section {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .modal-footer {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-body {
    padding: var(--space-4);
  }
  
  .voucher-info-header,
  .filters-section {
    padding: var(--space-4);
  }
  
  .usage-main {
    padding: var(--space-4);
  }
  
  .usage-header {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .patient-info {
    width: 100%;
  }
  
  .usage-date {
    text-align: left;
  }
}
</style> 