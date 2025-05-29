<template>
  <div class="vouchers-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="page-icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <div class="header-text">
            <h1 class="page-title">Gestionare Vouchere</h1>
            <p class="page-description">Creează și administrează voucherele pentru pacienți</p>
          </div>
        </div>
        <div class="header-actions">
          <button 
            class="btn btn-primary btn-create-voucher"
            @click="showCreateModal = true"
          >
            <i class="fas fa-plus"></i>
            <span>Voucher Nou</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.activeVouchers }}</div>
            <div class="stat-label">Vouchere Active</div>
          </div>
        </div>
        
        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalUsages }}</div>
            <div class="stat-label">Total Utilizări</div>
          </div>
        </div>
        
        <div class="stat-card stat-info">
          <div class="stat-icon">
            <i class="fas fa-coins"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ formattedTotalDiscount }}</div>
            <div class="stat-label">Discount Total (RON)</div>
          </div>
        </div>
        
        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.expiringSoon }}</div>
            <div class="stat-label">Expiră Curând</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-card">
        <div class="filters-header">
          <h3 class="filters-title">
            <i class="fas fa-filter"></i>
            Filtrare și Căutare
          </h3>
        </div>
        <div class="filters-content">
          <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">Căutare</label>
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  placeholder="Caută după cod sau nume..."
                  v-model="searchTerm"
                  @input="debouncedSearch"
                />
              </div>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Status</label>
              <select class="form-control" v-model="filterStatus" @change="loadVouchers">
                <option value="">Toate</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="EXPIRED">Expirate</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">Tip Discount</label>
              <select class="form-control" v-model="filterDiscountType" @change="loadVouchers">
                <option value="">Toate</option>
                <option value="PERCENTAGE">Procent</option>
                <option value="FIXED_AMOUNT">Sumă fixă</option>
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
      </div>
    </div>

    <!-- Vouchers Content -->
    <div class="content-section">
      <div class="content-card">
        <div class="content-header">
          <h3 class="content-title">
            <i class="fas fa-list"></i>
            Lista Vouchere
            <span class="voucher-count">{{ totalVouchers }}</span>
          </h3>
        </div>
        
        <div class="content-body">
          <!-- Loading State -->
          <div v-if="loading" class="state-container loading-state">
            <div class="state-content">
              <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <p class="state-message">Se încarcă voucherele...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="vouchers.length === 0" class="state-container empty-state">
            <div class="state-content">
              <div class="empty-icon">
                <i class="fas fa-ticket-alt"></i>
              </div>
              <h4 class="state-title">Nu există vouchere</h4>
              <p class="state-message">Creează primul voucher pentru a începe să oferi reduceri pacienților.</p>
              <button 
                class="btn btn-primary btn-create-first"
                @click="showCreateModal = true"
              >
                <i class="fas fa-plus"></i>
                Creează primul voucher
              </button>
            </div>
          </div>

          <!-- Vouchers List -->
          <div v-else class="vouchers-list">
            <div v-for="voucher in vouchers" :key="voucher.id" class="voucher-item">
              <div class="voucher-main">
                <div class="voucher-header">
                  <div class="voucher-code">
                    <code>{{ voucher.code }}</code>
                  </div>
                  <div class="voucher-status">
                    <span class="status-badge" :class="'status-' + voucher.status.toLowerCase()">
                      {{ getVoucherStatusText(voucher.status) }}
                    </span>
                  </div>
                </div>
                
                <div class="voucher-info">
                  <h4 class="voucher-name">{{ voucher.name }}</h4>
                  <p v-if="voucher.description" class="voucher-description">{{ voucher.description }}</p>
                  
                  <div class="voucher-details">
                    <div class="detail-row">
                      <div class="detail-item">
                        <i class="fas fa-percentage detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Discount</span>
                          <span class="detail-value discount-value" :class="getDiscountClass(voucher.discountType)">
                            {{ voucher.formattedDiscountValue }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="detail-item" v-if="voucher.minimumOrderValue">
                        <i class="fas fa-shopping-cart detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Comandă minimă</span>
                          <span class="detail-value">{{ voucher.minimumOrderValue }} RON</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-item">
                        <i class="fas fa-calendar detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Valabilitate</span>
                          <span class="detail-value">
                            {{ formatDate(voucher.startDate) }} - {{ formatDate(voucher.endDate) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="detail-row">
                      <div class="detail-item usage-item">
                        <i class="fas fa-chart-bar detail-icon"></i>
                        <div class="detail-content">
                          <span class="detail-label">Utilizări</span>
                          <div class="usage-info">
                            <span class="usage-text">
                              {{ voucher.currentUses }}
                              <span v-if="voucher.maxTotalUses">/ {{ voucher.maxTotalUses }}</span>
                              <span v-else>/ ∞</span>
                            </span>
                            <div class="usage-progress">
                              <div class="progress-bar" :class="getUsageProgressClass(voucher)" :style="{ width: getUsagePercentage(voucher) + '%' }"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="getExpiryStatus(voucher).status !== 'active'" 
                       class="expiring-alert" 
                       :class="`expiring-alert--${getExpiryStatus(voucher).status}`">
                    <i class="fas" :class="{
                      'fa-exclamation-triangle': getExpiryStatus(voucher).status === 'expires-soon',
                      'fa-clock': getExpiryStatus(voucher).status === 'expires-today',
                      'fa-times-circle': getExpiryStatus(voucher).status === 'expired'
                    }"></i>
                    <span>{{ getExpiryStatus(voucher).message }}</span>
                  </div>
                </div>
              </div>
              
              <div class="voucher-actions">
                <button 
                  class="action-btn btn-view"
                  @click="viewVoucherDetails(voucher)"
                  title="Vezi detalii"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  class="action-btn btn-toggle"
                  @click="toggleVoucherStatus(voucher)"
                  :title="voucher.status === 'ACTIVE' ? 'Dezactivează' : 'Activează'"
                >
                  <i class="fas" :class="voucher.status === 'ACTIVE' ? 'fa-pause' : 'fa-play'"></i>
                </button>
                <button 
                  class="action-btn btn-history"
                  @click="viewUsageHistory(voucher)"
                  title="Istoric utilizări"
                >
                  <i class="fas fa-history"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-section">
            <nav class="pagination-nav">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 0 }">
                  <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 0">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page" 
                  class="page-item" 
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="changePage(page)">{{ page + 1 }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
                  <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages - 1">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateVoucherModal 
      :isVisible="showCreateModal"
      @close="showCreateModal = false"
      @voucher-created="onVoucherCreated" 
    />
    <VoucherDetailsModal 
      v-if="selectedVoucher"
      :voucher="selectedVoucher"
      @voucher-updated="onVoucherUpdated"
      @close="selectedVoucher = null"
    />
    <VoucherUsageHistoryModal
      v-if="selectedVoucherForHistory"
      :voucher="selectedVoucherForHistory"
      @close="selectedVoucherForHistory = null"
    />
  </div>
</template>

<script>
import VoucherService from '../../services/VoucherService.js';
import CreateVoucherModal from '../../components/CreateVoucherModal.vue';
import VoucherDetailsModal from '../../components/VoucherDetailsModal.vue';
import VoucherUsageHistoryModal from '../../components/VoucherUsageHistoryModal.vue';

export default {
  name: 'CompanyAdminVouchers',
  components: {
    CreateVoucherModal,
    VoucherDetailsModal,
    VoucherUsageHistoryModal
  },
  data() {
    return {
      loading: false,
      vouchers: [],
      selectedVoucher: null,
      selectedVoucherForHistory: null,
      searchTerm: '',
      filterStatus: '',
      filterDiscountType: '',
      currentPage: 0,
      pageSize: 20,
      totalVouchers: 0,
      totalPages: 0,
      stats: {
        activeVouchers: 0,
        totalUsages: 0,
        totalDiscount: 0,
        expiringSoon: 0
      },
      searchTimeout: null,
      showCreateModal: false,
      warningDaysBeforeExpiry: 7
    };
  },
  computed: {
    visiblePages() {
      const pages = [];
      const start = Math.max(0, this.currentPage - 2);
      const end = Math.min(this.totalPages - 1, this.currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    formattedTotalDiscount() {
      return this.formatDiscountAmount(this.stats.totalDiscount);
    }
  },
  methods: {
    async loadVouchers() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        };

        if (this.searchTerm) params.search = this.searchTerm;
        if (this.filterStatus) params.status = this.filterStatus;
        if (this.filterDiscountType) params.discountType = this.filterDiscountType;

        const response = await VoucherService.getVouchers(params.page, params.size);
        
        // Process vouchers to add formatted discount value
        this.vouchers = (response.content || []).map(voucher => ({
          ...voucher,
          formattedDiscountValue: this.formatDiscountValue(voucher)
        }));
        
        this.totalVouchers = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        
        await this.loadStats();
        
      } catch (error) {
        console.error('Error loading vouchers:', error);
        this.showErrorMessage('Eroare la încărcarea voucherelor');
      } finally {
        this.loading = false;
      }
    },

    formatDiscountValue(voucher) {
      if (!voucher || !voucher.discountValue) return '';
      
      if (voucher.discountType === 'PERCENTAGE') {
        return `${voucher.discountValue}%`;
      } else {
        return `${voucher.discountValue} RON`;
      }
    },

    formatDiscountAmount(amount) {
      if (typeof amount !== 'number' || isNaN(amount)) return '0';
      return amount.toFixed(2);
    },

    async loadStats() {
      try {
        // Calculate stats from current vouchers
        this.stats.activeVouchers = this.vouchers.filter(v => v.status === 'ACTIVE').length;
        this.stats.totalUsages = this.vouchers.reduce((sum, v) => sum + (v.currentUses || 0), 0);
        
        // Count vouchers that expire soon or today, but only active ones
        this.stats.expiringSoon = this.vouchers.filter(v => {
          const expiryStatus = this.getExpiryStatus(v);
          return v.status === 'ACTIVE' && 
                 (expiryStatus.status === 'expires-soon' || expiryStatus.status === 'expires-today');
        }).length;
        
        // Get total discount from backend (calculated from voucher_usages)
        await this.loadTotalDiscount();
        
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    },

    async loadTotalDiscount() {
      try {
        const response = await VoucherService.getTotalDiscountFromUsages();
        this.stats.totalDiscount = response.totalDiscount || 0;
      } catch (error) {
        console.error('Error loading total discount:', error);
        this.stats.totalDiscount = 0;
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 0;
        this.loadVouchers();
      }, 500);
    },

    clearFilters() {
      this.searchTerm = '';
      this.filterStatus = '';
      this.filterDiscountType = '';
      this.currentPage = 0;
      this.loadVouchers();
    },

    changePage(page) {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
        this.loadVouchers();
      }
    },

    async toggleVoucherStatus(voucher) {
      try {
        const newStatus = voucher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await VoucherService.updateVoucherStatus(voucher.id, newStatus);
        
        // Update local voucher
        voucher.status = newStatus;
        
        this.showSuccessMessage(`Voucher ${newStatus === 'ACTIVE' ? 'activat' : 'dezactivat'} cu succes`);
        
      } catch (error) {
        console.error('Error updating voucher status:', error);
        this.showErrorMessage('Eroare la actualizarea statusului');
      }
    },

    viewVoucherDetails(voucher) {
      this.selectedVoucher = voucher;
    },

    async viewUsageHistory(voucher) {
      this.selectedVoucherForHistory = voucher;
    },

    onVoucherCreated(voucher) {
      this.showCreateModal = false;
      this.vouchers.unshift(voucher);
      this.totalVouchers++;
      this.showSuccessMessage('Voucher creat cu succes!');
    },

    onVoucherUpdated(voucher) {
      const index = this.vouchers.findIndex(v => v.id === voucher.id);
      if (index !== -1) {
        this.vouchers.splice(index, 1, voucher);
      }
      this.showSuccessMessage('Voucher actualizat cu succes!');
    },

    // Utility methods
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ro-RO');
    },

    // Configuration method for warning period
    setWarningDaysBeforeExpiry(days) {
      this.warningDaysBeforeExpiry = Math.max(1, Math.min(30, days)); // Between 1 and 30 days
      this.loadStats(); // Recalculate stats with new warning period
    },

    getWarningDaysBeforeExpiry() {
      return this.warningDaysBeforeExpiry;
    },

    // Helper method for testing date calculations
    testDateCalculation(endDateString) {
      const endDate = new Date(endDateString);
      endDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const timeDiff = endDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`Test date calculation for ${endDateString}:`);
      console.log(`End date: ${endDate.toISOString()}`);
      console.log(`Today: ${today.toISOString()}`);
      console.log(`Time difference: ${timeDiff}ms`);
      console.log(`Days until expiry: ${daysUntilExpiry}`);
      
      return daysUntilExpiry;
    },

    isExpiringSoon(voucher) {
      // Only check active vouchers
      if (!voucher.endDate || voucher.status !== 'ACTIVE') return false;
      
      // Use same date comparison logic as getExpiryStatus
      const endDate = new Date(voucher.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const timeDiff = endDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      
      // Configurable warning period (default 7 days)
      const warningDays = this.warningDaysBeforeExpiry || 7;
      
      return daysUntilExpiry <= warningDays && daysUntilExpiry > 0;
    },

    getExpiryStatus(voucher) {
      if (!voucher.endDate) return { status: 'no-expiry', message: '', daysLeft: null };
      
      // Parse dates and set to start of day for accurate comparison
      const endDate = new Date(voucher.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate difference in days using date comparison, not time
      const timeDiff = endDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        return { 
          status: 'expired', 
          message: `Expirat acum ${Math.abs(daysUntilExpiry)} zile`, 
          daysLeft: daysUntilExpiry 
        };
      } else if (daysUntilExpiry === 0) {
        return { 
          status: 'expires-today', 
          message: 'Expiră astăzi', 
          daysLeft: 0 
        };
      } else if (daysUntilExpiry <= (this.warningDaysBeforeExpiry || 7)) {
        return { 
          status: 'expires-soon', 
          message: `Expiră în ${daysUntilExpiry} zile`, 
          daysLeft: daysUntilExpiry 
        };
      } else {
        return { 
          status: 'active', 
          message: `Expiră în ${daysUntilExpiry} zile`, 
          daysLeft: daysUntilExpiry 
        };
      }
    },

    getDiscountBadgeClass(discountType) {
      return discountType === 'PERCENTAGE' ? 'bg-info' : 'bg-success';
    },

    getDiscountClass(discountType) {
      return discountType === 'PERCENTAGE' ? 'percentage' : 'fixed';
    },

    getVoucherStatusColor(status) {
      return VoucherService.getVoucherStatusColor(status);
    },

    getVoucherStatusText(status) {
      return VoucherService.getVoucherStatusText(status);
    },

    getUsagePercentage(voucher) {
      if (!voucher.maxTotalUses) return 0;
      return Math.min(100, (voucher.currentUses / voucher.maxTotalUses) * 100);
    },

    getUsageProgressClass(voucher) {
      const percentage = this.getUsagePercentage(voucher);
      if (percentage >= 90) return 'bg-danger';
      if (percentage >= 70) return 'bg-warning';
      return 'bg-success';
    },

    showSuccessMessage(message) {
      // Implement toast notification
      alert(message);
    },

    showErrorMessage(message) {
      // Implement toast notification
      alert(message);
    },
  },

  async mounted() {
    await this.loadVouchers();
  }
};
</script>

<style scoped>
/* Page Layout */
.vouchers-page {
  background-color: var(--bg-secondary);
  min-height: 100vh;
  padding: var(--space-6);
}

/* Page Header */
.page-header {
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.page-icon {
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-2xl);
  box-shadow: var(--shadow-primary);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--leading-tight);
}

.page-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0 0;
}

.btn-create-voucher {
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6);
  font-weight: var(--font-semibold);
  color: white;
  box-shadow: var(--shadow-primary);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
}

.btn-create-voucher:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  filter: brightness(1.05);
}

/* Statistics Section */
.stats-section {
  margin-bottom: var(--space-6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.stat-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  transition: var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xl);
  color: white;
}

.stat-primary .stat-icon {
  background: var(--gradient-primary);
}

.stat-success .stat-icon {
  background: var(--gradient-secondary);
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, var(--info), var(--primary-400));
}

.stat-warning .stat-icon {
  background: var(--gradient-accent);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: var(--leading-none);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  margin-top: var(--space-1);
}

/* Filters Section */
.filters-section {
  margin-bottom: var(--space-6);
}

.filters-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.filters-header {
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.filters-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filters-content {
  padding: var(--space-6);
}

.filter-row {
  display: flex;
  gap: var(--space-4);
}

.filter-group {
  flex: 1;
}

.filter-label {
  display: block;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 2;
}

.form-control {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  border: 2px solid var(--border-light);
  font-size: var(--text-base);
  transition: var(--transition-normal);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.search-input {
  padding-left: calc(var(--space-4) + var(--space-6));
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.btn-reset {
  background-color: var(--neutral-100);
  color: var(--text-secondary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-medium);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
}

.btn-reset:hover {
  background-color: var(--neutral-200);
  border-color: var(--border-medium);
}

/* Content Section */
.content-section {
  margin-bottom: var(--space-6);
}

.content-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.content-header {
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-light);
}

.content-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.voucher-count {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.content-body {
  padding: var(--space-6);
}

/* State Containers */
.state-container {
  text-align: center;
  padding: var(--space-16) var(--space-6);
}

.state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.loading-spinner i {
  font-size: var(--text-4xl);
  color: var(--primary-500);
  animation: fa-spin 1s linear infinite;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--neutral-100), var(--neutral-200));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-5xl);
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.state-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.state-message {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0;
  max-width: 400px;
}

.btn-create-first {
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6);
  font-weight: var(--font-semibold);
  color: white;
  box-shadow: var(--shadow-primary);
  transition: var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.btn-create-first:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Vouchers List */
.vouchers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.voucher-item {
  background-color: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: var(--transition-normal);
  overflow: hidden;
  display: flex;
}

.voucher-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-200);
}

.voucher-main {
  flex: 1;
  padding: var(--space-6);
}

.voucher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.voucher-code code {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
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
  background-color: var(--secondary-100);
  color: var(--secondary-700);
}

.status-inactive {
  background-color: var(--neutral-100);
  color: var(--neutral-600);
}

.status-expired {
  background-color: var(--accent-100);
  color: var(--accent-700);
}

.voucher-info {
  flex: 1;
}

.voucher-name {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.voucher-description {
  color: var(--text-secondary);
  margin: 0 0 var(--space-4) 0;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.voucher-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-row {
  display: flex;
  gap: var(--space-6);
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
}

.detail-icon {
  width: 32px;
  height: 32px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-500);
  font-size: var(--text-sm);
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: var(--font-semibold);
  letter-spacing: 0.05em;
}

.detail-value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--text-base);
}

.discount-value.percentage {
  color: var(--primary-500);
}

.discount-value.fixed {
  color: var(--secondary-500);
}

.usage-item {
  flex-direction: column;
  align-items: stretch;
}

.usage-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.usage-text {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.usage-progress {
  width: 100%;
  height: 8px;
  background-color: var(--neutral-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: var(--transition-normal);
}

.progress-bar.bg-success {
  background: var(--gradient-secondary);
}

.progress-bar.bg-warning {
  background: var(--gradient-accent);
}

.progress-bar.bg-danger {
  background: linear-gradient(90deg, var(--error), #dc2626);
}

.expiring-alert {
  background-color: var(--accent-50);
  color: var(--accent-700);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  margin-top: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border: 1px solid var(--accent-200);
}

/* Specific styles for different expiry statuses */
.expiring-alert--expires-soon {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fbbf24;
}

.expiring-alert--expires-today {
  background-color: #fed7d7;
  color: #9b2c2c;
  border-color: #fc8181;
  animation: pulse 2s infinite;
}

.expiring-alert--expired {
  background-color: #f3f4f6;
  color: #6b7280;
  border-color: #d1d5db;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Voucher Actions */
.voucher-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background-color: var(--bg-tertiary);
  border-left: 1px solid var(--border-light);
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-xl);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-normal);
  font-size: var(--text-base);
  cursor: pointer;
}

.btn-view {
  background-color: var(--info);
  color: white;
}

.btn-view:hover {
  background-color: var(--primary-600);
  transform: scale(1.05);
}

.btn-toggle {
  background-color: var(--warning);
  color: white;
}

.btn-toggle:hover {
  background-color: var(--accent-600);
  transform: scale(1.05);
}

.btn-history {
  background-color: var(--secondary-500);
  color: white;
}

.btn-history:hover {
  background-color: var(--secondary-600);
  transform: scale(1.05);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: var(--space-8);
}

.pagination {
  display: flex;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.page-item .page-link {
  border: none;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-medium);
  transition: var(--transition-normal);
  text-decoration: none;
  border: 1px solid var(--border-light);
}

.page-item.active .page-link {
  background: var(--gradient-primary);
  color: white;
  border-color: var(--primary-500);
}

.page-item:not(.disabled) .page-link:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-medium);
  transform: translateY(-1px);
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .vouchers-page {
    padding: var(--space-4);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
  }
  
  .page-title {
    font-size: var(--text-3xl);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .detail-row {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .voucher-item {
    flex-direction: column;
  }
  
  .voucher-actions {
    flex-direction: row;
    justify-content: center;
    border-left: none;
    border-top: 1px solid var(--border-light);
  }
}

@media (max-width: 576px) {
  .page-header {
    padding: var(--space-6);
  }
  
  .content-body,
  .filters-content {
    padding: var(--space-4);
  }
  
  .voucher-main {
    padding: var(--space-4);
  }
  
  .voucher-header {
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }
}

.header-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}
</style> 