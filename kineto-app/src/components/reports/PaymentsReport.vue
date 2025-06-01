<template>
  <div class="payments-report">
    <div class="payments-header">
      <h2><i class="fas fa-credit-card"></i> Payment Analytics Dashboard</h2>
      <p>Comprehensive payment processing metrics and financial insights</p>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-indicator">
        <i class="fas fa-spinner fa-spin"></i> Loading payment data...
      </div>
    </div>
    
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>
    
    <div v-else-if="reportData" class="payments-container">
      <!-- Revenue Overview Summary -->
      <div class="overview-section" v-if="reportData.summary">
        <h3><i class="fas fa-chart-line"></i> Revenue Overview</h3>
        <div class="overview-stats">
          <div class="overview-card revenue-card">
            <div class="overview-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="overview-content">
              <h4>{{ formatCurrency(reportData.summary.totalRevenue || 0) }}</h4>
              <p>Total Revenue</p>
              <div class="growth-indicator">
                <i class="fas fa-chart-line"></i>
                <span>Financial Performance</span>
              </div>
            </div>
          </div>

          <div class="overview-card payments-card">
            <div class="overview-icon">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="overview-content">
              <h4>{{ reportData.summary.totalPayments || 0 }}</h4>
              <p>Total Payments</p>
              <div class="growth-indicator">
                <i class="fas fa-calendar-check"></i>
                <span>Transaction Volume</span>
              </div>
            </div>
          </div>

          <div class="overview-card average-card">
            <div class="overview-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="overview-content">
              <h4>{{ formatCurrency(reportData.summary.averagePaymentAmount || 0) }}</h4>
              <p>Average Payment</p>
              <div class="growth-indicator">
                <i class="fas fa-calculator"></i>
                <span>Payment Average</span>
              </div>
            </div>
          </div>

          <div class="overview-card discounts-card">
            <div class="overview-icon">
              <i class="fas fa-tags"></i>
            </div>
            <div class="overview-content">
              <h4>{{ formatCurrency(reportData.summary.totalDiscounts || 0) }}</h4>
              <p>Total Discounts</p>
              <div class="growth-indicator">
                <i class="fas fa-percentage"></i>
                <span>Savings Provided</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods & Status Analysis -->
      <div class="analysis-section" v-if="reportData.summary">
        <div class="methods-section" v-if="reportData.summary.paymentMethods && reportData.summary.paymentMethods.length > 0">
          <h3><i class="fas fa-credit-card"></i> Payment Methods Analysis</h3>
          <div class="methods-grid">
            <div v-for="method in reportData.summary.paymentMethods" :key="method.paymentMethod" class="method-card">
              <div class="method-header">
                <div class="method-icon">
                  <i :class="getMethodIcon(method.paymentMethod)"></i>
                </div>
                <div class="method-info">
                  <h4>{{ method.paymentMethod || 'Unknown' }}</h4>
                  <p>{{ method.count }} transactions</p>
                </div>
                <div class="method-percentage">
                  {{ getMethodPercentage(method.totalAmount) }}%
                </div>
              </div>
              
              <div class="method-metrics">
                <div class="metric-item">
                  <span class="metric-label">Total Amount</span>
                  <span class="metric-value">{{ formatCurrency(method.totalAmount) }}</span>
                </div>
                <div class="metric-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: getMethodPercentage(method.totalAmount) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="status-section" v-if="reportData.summary.revenueByStatus && reportData.summary.revenueByStatus.length > 0">
          <h3><i class="fas fa-chart-pie"></i> Payment Status Distribution</h3>
          <div class="status-grid">
            <div v-for="status in reportData.summary.revenueByStatus" :key="status.status" class="status-card" :class="getStatusCardClass(status.status)">
              <div class="status-header">
                <div class="status-icon">
                  <i :class="getStatusIcon(status.status)"></i>
                </div>
                <div class="status-info">
                  <h4>{{ formatStatus(status.status) }}</h4>
                  <p>{{ status.count }} payments</p>
                </div>
              </div>
              
              <div class="status-metrics">
                <div class="metric-amount">{{ formatCurrency(status.totalAmount) }}</div>
                <div class="metric-percentage">{{ getStatusPercentage(status.totalAmount) }}% of total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Table Section -->
      <div class="payments-section">
        <div class="payments-table-header">
          <h3><i class="fas fa-list"></i> Payment Records</h3>
          <div class="table-controls">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input 
                v-model="searchTerm" 
                type="text" 
                placeholder="Search payments..."
              >
            </div>
          </div>
        </div>

        <div v-if="filteredPayments.length === 0" class="no-payments">
          <div class="no-payments-content">
            <i class="fas fa-inbox"></i>
            <h4>{{ searchTerm ? 'No matching payments' : 'No payments found' }}</h4>
            <p>{{ searchTerm ? 'Try adjusting your search criteria.' : 'No payments recorded for this period.' }}</p>
          </div>
        </div>

        <div v-else class="payments-table-container">
          <div class="payments-table">
            <div class="table-header">
              <div class="col-date">Date</div>
              <div class="col-patient">Patient</div>
              <div class="col-amount">Amount</div>
              <div class="col-method">Method</div>
              <div class="col-status">Status</div>
              <div class="col-recorded">Recorded By</div>
              <div class="col-notes">Notes</div>
            </div>
            
            <div class="table-body">
              <div v-for="payment in paginatedPayments" :key="payment.id" class="table-row">
                <div class="col-date">
                  <div class="payment-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span>{{ formatDate(payment.paymentDate) }}</span>
                  </div>
                </div>
                
                <div class="col-patient">
                  <div class="patient-info">
                    <div class="patient-avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div class="patient-details">
                      <div class="patient-name">{{ payment.patientName || 'Unknown' }}</div>
                      <div class="patient-email">{{ payment.patientEmail || 'No email' }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="col-amount">
                  <div class="payment-amount">
                    <div class="amount">{{ formatCurrency(payment.amount) }}</div>
                    <div v-if="payment.discountAmount && payment.discountAmount > 0" class="discount">
                      <i class="fas fa-tag"></i> -{{ formatCurrency(payment.discountAmount) }}
                    </div>
                  </div>
                </div>
                
                <div class="col-method">
                  <div class="payment-method" :class="getMethodClass(payment.paymentMethod)">
                    <i :class="getMethodIcon(payment.paymentMethod)"></i>
                    <span>{{ payment.paymentMethod || 'Unknown' }}</span>
                  </div>
                </div>
                
                <div class="col-status">
                  <div class="status-badge" :class="getStatusClass(payment.status)">
                    <i :class="getStatusIcon(payment.status)"></i>
                    <span>{{ formatStatus(payment.status) }}</span>
                  </div>
                </div>
                
                <div class="col-recorded">
                  <div class="recorded-by">{{ payment.recordedByName || 'Unknown' }}</div>
                </div>
                
                <div class="col-notes">
                  <div class="payment-notes">
                    <span v-if="payment.notes" :title="payment.notes">
                      {{ truncateText(payment.notes, 30) }}
                    </span>
                    <span v-else class="no-notes">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modern Pagination -->
          <div v-if="totalPages > 1" class="pagination-container">
            <div class="pagination-info">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredPayments.length) }} of {{ filteredPayments.length }} payments
            </div>
            <div class="pagination-controls">
              <button 
                class="pagination-btn" 
                :class="{ disabled: currentPage === 1 }"
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <div class="pagination-pages">
                <button 
                  v-for="page in visiblePages" 
                  :key="page" 
                  class="pagination-page" 
                  :class="{ active: page === currentPage, ellipsis: page === '...' }"
                  @click="changePage(page)"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>
              </div>
              
              <button 
                class="pagination-btn" 
                :class="{ disabled: currentPage === totalPages }"
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <div class="no-data-content">
        <i class="fas fa-chart-line"></i>
        <h3>No Payment Data Available</h3>
        <p>Payment analytics will appear here once transactions are processed.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentsReport',
  props: {
    reportData: {
      type: Object,
      default: () => ({})
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      searchTerm: '',
      currentPage: 1,
      pageSize: 20
    };
  },
  computed: {
    filteredPayments() {
      if (!this.reportData.payments) return [];
      
      if (!this.searchTerm) return this.reportData.payments;
      
      const term = this.searchTerm.toLowerCase();
      return this.reportData.payments.filter(payment => 
        (payment.patientName && payment.patientName.toLowerCase().includes(term)) ||
        (payment.patientEmail && payment.patientEmail.toLowerCase().includes(term)) ||
        (payment.paymentMethod && payment.paymentMethod.toLowerCase().includes(term)) ||
        (payment.status && payment.status.toLowerCase().includes(term)) ||
        (payment.notes && payment.notes.toLowerCase().includes(term))
      );
    },
    
    totalPages() {
      return Math.ceil(this.filteredPayments.length / this.pageSize);
    },
    
    paginatedPayments() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredPayments.slice(start, end);
    },
    
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1;
    }
  },
  methods: {
    formatCurrency(amount) {
      if (amount === null || amount === undefined) return 'RON 0.00';
      return new Intl.NumberFormat('ro-RO', { 
        style: 'currency', 
        currency: 'RON',
        minimumFractionDigits: 2
      }).format(amount);
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ro-RO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    formatStatus(status) {
      const statusMap = {
        'COMPLETED': 'Completed',
        'PENDING': 'Pending',
        'FAILED': 'Failed',
        'REFUNDED': 'Refunded',
        'PARTIAL_REFUND': 'Partially Refunded'
      };
      return statusMap[status] || status;
    },
    
    getStatusClass(status) {
      const classMap = {
        'COMPLETED': 'status-completed',
        'PENDING': 'status-pending',
        'FAILED': 'status-failed',
        'REFUNDED': 'status-refunded',
        'PARTIAL_REFUND': 'status-partial'
      };
      return classMap[status] || 'status-unknown';
    },

    getStatusCardClass(status) {
      const classMap = {
        'COMPLETED': 'status-card-completed',
        'PENDING': 'status-card-pending',
        'FAILED': 'status-card-failed',
        'REFUNDED': 'status-card-refunded',
        'PARTIAL_REFUND': 'status-card-partial'
      };
      return classMap[status] || 'status-card-unknown';
    },

    getStatusIcon(status) {
      const iconMap = {
        'COMPLETED': 'fas fa-check-circle',
        'PENDING': 'fas fa-clock',
        'FAILED': 'fas fa-times-circle',
        'REFUNDED': 'fas fa-undo',
        'PARTIAL_REFUND': 'fas fa-undo-alt'
      };
      return iconMap[status] || 'fas fa-question-circle';
    },

    getMethodIcon(method) {
      const iconMap = {
        'CARD': 'fas fa-credit-card',
        'CASH': 'fas fa-money-bill-wave',
        'BANK_TRANSFER': 'fas fa-university',
        'VOUCHER': 'fas fa-ticket-alt',
        'ONLINE': 'fas fa-laptop'
      };
      return iconMap[method] || 'fas fa-credit-card';
    },

    getMethodClass(method) {
      const classMap = {
        'CARD': 'method-card',
        'CASH': 'method-cash',
        'BANK_TRANSFER': 'method-bank',
        'VOUCHER': 'method-voucher',
        'ONLINE': 'method-online'
      };
      return classMap[method] || 'method-unknown';
    },

    getMethodPercentage(amount) {
      if (!this.reportData.summary || !this.reportData.summary.totalRevenue) return 0;
      return Math.round((amount / this.reportData.summary.totalRevenue) * 100);
    },

    getStatusPercentage(amount) {
      if (!this.reportData.summary || !this.reportData.summary.totalRevenue) return 0;
      return Math.round((amount / this.reportData.summary.totalRevenue) * 100);
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
};
</script>

<style scoped>
/* Payments Report - Modern Design */
.payments-report {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Header Section */
.payments-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.payments-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
  opacity: 0.3;
}

.payments-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.payments-header i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.payments-header p {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

/* Loading States */
.loading-overlay {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-indicator {
  text-align: center;
  color: #667eea;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.loading-indicator i {
  font-size: 2rem;
  animation: fa-spin 1s linear infinite;
}

.error-message {
  background: linear-gradient(135deg, #e53e3e 0%, #fd5e53 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 15px 35px rgba(229, 62, 62, 0.3);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

/* Payments Container */
.payments-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Overview Section */
.overview-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.overview-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.overview-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.overview-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.revenue-card::before {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.payments-card::before {
  background: linear-gradient(90deg, #3182ce 0%, #4299e1 100%);
}

.average-card::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.discounts-card::before {
  background: linear-gradient(90deg, #ed8936 0%, #fbb040 100%);
}

.overview-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.overview-icon i {
  font-size: 3rem;
  padding: 1rem;
  border-radius: 50%;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.revenue-card .overview-icon i {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
}

.payments-card .overview-icon i {
  background: linear-gradient(135deg, #3182ce 0%, #4299e1 100%);
}

.average-card .overview-icon i {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.discounts-card .overview-icon i {
  background: linear-gradient(135deg, #ed8936 0%, #fbb040 100%);
}

.overview-content {
  text-align: center;
}

.overview-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.overview-content p {
  margin: 0 0 1rem 0;
  color: #718096;
  font-size: 1rem;
  font-weight: 500;
}

.growth-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #718096;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
}

/* Analysis Section */
.analysis-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
}

.methods-section, .status-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.methods-section h3, .status-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.methods-section i, .status-section i {
  color: #667eea;
  font-size: 1.3rem;
}

.methods-grid, .status-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.method-card, .status-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.method-card:hover, .status-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.method-header, .status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.method-icon, .status-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.method-info h4, .status-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.method-info p, .status-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
}

.method-percentage {
  margin-left: auto;
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
}

.method-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.85rem;
  color: #718096;
}

.metric-value {
  font-weight: 600;
  color: #2d3748;
}

.metric-progress {
  margin-top: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 1s ease;
}

.status-metrics {
  text-align: center;
}

.metric-amount {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.metric-percentage {
  font-size: 0.85rem;
  color: #718096;
}

/* Status Card Colors */
.status-card-completed {
  border-left: 6px solid #38a169;
}

.status-card-pending {
  border-left: 6px solid #ed8936;
}

.status-card-failed {
  border-left: 6px solid #e53e3e;
}

.status-card-refunded {
  border-left: 6px solid #3182ce;
}

.status-card-partial {
  border-left: 6px solid #805ad5;
}

/* Payments Section */
.payments-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.payments-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.payments-table-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payments-table-header i {
  color: #667eea;
  font-size: 1.6rem;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #718096;
  font-size: 0.9rem;
  z-index: 1;
}

.search-box input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  width: 300px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* No Payments */
.no-payments {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

.no-payments-content {
  text-align: center;
  max-width: 500px;
}

.no-payments-content i {
  font-size: 5rem;
  color: #e2e8f0;
  margin-bottom: 2rem;
}

.no-payments-content h4 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a5568;
}

.no-payments-content p {
  margin: 0;
  color: #718096;
  font-size: 1rem;
  line-height: 1.6;
}

/* Payments Table */
.payments-table-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.payments-table {
  background: #f7fafc;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-header {
  display: grid;
  grid-template-columns: 150px 200px 120px 130px 130px 150px 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 150px 200px 120px 130px 130px 150px 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  align-items: center;
}

.table-row:hover {
  background: rgba(102, 126, 234, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.payment-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4a5568;
}

.payment-date i {
  color: #667eea;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.patient-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
}

.patient-details {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.patient-email {
  color: #718096;
  font-size: 0.8rem;
}

.payment-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.amount {
  font-weight: 700;
  color: #38a169;
  font-size: 0.95rem;
}

.discount {
  color: #ed8936;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
}

.method-card {
  background: rgba(49, 130, 206, 0.1);
  color: #3182ce;
}

.method-cash {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
}

.method-bank {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.method-voucher {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.method-online {
  background: rgba(128, 90, 213, 0.1);
  color: #805ad5;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.25px;
}

.status-completed {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.status-pending {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
  border: 1px solid rgba(237, 137, 54, 0.3);
}

.status-failed {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.status-refunded {
  background: rgba(49, 130, 206, 0.1);
  color: #3182ce;
  border: 1px solid rgba(49, 130, 206, 0.3);
}

.status-partial {
  background: rgba(128, 90, 213, 0.1);
  color: #805ad5;
  border: 1px solid rgba(128, 90, 213, 0.3);
}

.recorded-by {
  font-size: 0.85rem;
  color: #4a5568;
  font-weight: 500;
}

.payment-notes {
  font-size: 0.85rem;
  color: #718096;
}

.no-notes {
  color: #cbd5e0;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  color: #718096;
  font-size: 0.85rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn, .pagination-page {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.pagination-btn:hover:not(.disabled), .pagination-page:hover:not(.active):not(.ellipsis) {
  background: #f7fafc;
  border-color: #667eea;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f7fafc;
}

.pagination-page.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-page.ellipsis {
  cursor: default;
  border: none;
  background: none;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

/* No Data */
.no-data {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-data-content {
  text-align: center;
  max-width: 500px;
}

.no-data-content i {
  font-size: 5rem;
  color: #e2e8f0;
  margin-bottom: 2rem;
}

.no-data-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #4a5568;
}

.no-data-content p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .analysis-section {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    grid-template-columns: 120px 180px 100px 110px 110px 130px 1fr;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .payments-report {
    padding: 0.5rem;
    gap: 1.5rem;
  }

  .payments-header h2 {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .payments-table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box input {
    width: 100%;
  }

  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: left;
  }

  .table-header {
    display: none;
  }

  .table-row {
    display: block;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 1rem;
    background: white;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .overview-content h4 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .overview-stats {
    grid-template-columns: 1fr;
  }

  .overview-section, .methods-section, .status-section, .payments-section {
    padding: 1.5rem;
  }

  .overview-content h4 {
    font-size: 1.5rem;
  }
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 