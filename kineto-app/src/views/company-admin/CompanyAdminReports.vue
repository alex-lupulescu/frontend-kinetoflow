<template>
  <div class="page-container reports-page">
    <!-- Header -->
    <div class="page-header">
      <h1><i class="fas fa-chart-bar"></i> Company Reports</h1>
      <p class="text-muted">Generate detailed reports for your company's performance and activity.</p>
    </div>

    <!-- Date Range Filter -->
    <div class="card filters-card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-alt"></i> Report Period</h3>
      </div>
      <div class="card-content">
        <div class="date-range-controls">
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input 
              type="date" 
              id="startDate" 
              v-model="dateRange.startDate" 
              class="form-control"
              @change="onDateRangeChange"
            />
          </div>
          <div class="form-group">
            <label for="endDate">End Date</label>
            <input 
              type="date" 
              id="endDate" 
              v-model="dateRange.endDate" 
              class="form-control"
              @change="onDateRangeChange"
            />
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <div class="quick-filters">
              <button @click="setQuickFilter('thisMonth')" class="btn btn-sm btn-secondary">This Month</button>
              <button @click="setQuickFilter('lastMonth')" class="btn btn-sm btn-secondary">Last Month</button>
              <button @click="setQuickFilter('thisYear')" class="btn btn-sm btn-secondary">This Year</button>
              <button @click="resetDateRange" class="btn btn-sm btn-outline-secondary">Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Types Grid -->
    <div class="reports-grid">
      <!-- Company Summary Report -->
      <div class="report-card" @click="generateReport('company-summary')" :class="{ 'loading': loadingStates.companySummary }">
        <div class="report-icon company-icon">
          <i class="fas fa-building"></i>
        </div>
        <div class="report-info">
          <h3>Company Summary</h3>
          <p>Comprehensive overview of company performance</p>
          <span class="report-status">
            <i class="fas fa-chart-pie"></i> Overview Report
          </span>
        </div>
        <div class="report-loading" v-if="loadingStates.companySummary">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>

      <!-- Medic Activity Report -->
      <div class="report-card" @click="generateReport('medic-activity')" :class="{ 'loading': loadingStates.medicActivity }">
        <div class="report-icon medic-icon">
          <i class="fas fa-user-md"></i>
        </div>
        <div class="report-info">
          <h3>Medic Activity</h3>
          <p>Performance metrics and statistics for medics</p>
          <span class="report-status">
            <i class="fas fa-stethoscope"></i> Staff Report
          </span>
        </div>
        <div class="report-loading" v-if="loadingStates.medicActivity">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>

      <!-- Services Utilization Report -->
      <div class="report-card" @click="generateReport('services-utilization')" :class="{ 'loading': loadingStates.servicesUtilization }">
        <div class="report-icon services-icon">
          <i class="fas fa-concierge-bell"></i>
        </div>
        <div class="report-info">
          <h3>Services Utilization</h3>
          <p>Service popularity and completion rates</p>
          <span class="report-status">
            <i class="fas fa-chart-bar"></i> Services Report
          </span>
        </div>
        <div class="report-loading" v-if="loadingStates.servicesUtilization">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>

      <!-- Patient Activity Report -->
      <div class="report-card" @click="generateReport('patient-activity')" :class="{ 'loading': loadingStates.patientActivity }">
        <div class="report-icon patient-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="report-info">
          <h3>Patient Activity</h3>
          <p>Patient engagement and attendance tracking</p>
          <span class="report-status">
            <i class="fas fa-user-friends"></i> Patients Report
          </span>
        </div>
        <div class="report-loading" v-if="loadingStates.patientActivity">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>

      <!-- Financial Overview Report -->
      <div class="report-card" @click="generateReport('financial-overview')" :class="{ 'loading': loadingStates.financialOverview }">
        <div class="report-icon financial-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="report-info">
          <h3>Financial Overview</h3>
          <p>Revenue, plans, and financial metrics</p>
          <span class="report-status">
            <i class="fas fa-dollar-sign"></i> Financial Report
          </span>
        </div>
        <div class="report-loading" v-if="loadingStates.financialOverview">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>

      <!-- Payments Report -->
      <div class="report-card" @click="generateReport('payments')" :class="{ 'loading': loadingStates.payments }">
        <div class="report-icon payments-icon">
          <i class="fas fa-credit-card"></i>
        </div>
        <div class="report-info">
          <h3>Payments Report</h3>
          <p>Detailed payment records and revenue analysis</p>
          <span class="report-status">
            <i class="fas fa-receipt"></i> Payments Report
          </span>
        </div>
        <div class="report-loading" v-if="loadingStates.payments">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>
    </div>

    <!-- Report Display Area -->
    <div v-if="currentReport && !Object.values(loadingStates).some(Boolean)" class="card report-display-card">
      <div class="card-header">
        <div class="report-display-header">
          <h3>
            <i class="fas fa-chart-bar"></i> 
            {{ getReportTitle(currentReport.type) }}
          </h3>
          <div class="report-meta">
            <span class="report-period" v-if="currentReport.data && currentReport.data.startDate && currentReport.data.endDate">
              {{ formatDate(currentReport.data.startDate) }} - {{ formatDate(currentReport.data.endDate) }}
            </span>
            <span class="report-generated">
              Generated: {{ formatDateTime(currentReport.data.generatedAt || currentReport.generatedAt) }}
            </span>
            <button @click="exportReport" class="btn btn-sm btn-secondary">
              <i class="fas fa-download"></i> Export
            </button>
          </div>
        </div>
      </div>
      <div class="card-content">
        <!-- Report Display -->
        <div class="report-display">
          <CompanySummaryReport 
            v-if="currentReport.type === 'company-summary'"
            :key="'company-summary-' + (currentReport.data.generatedAt || Date.now())"
            :report-data="currentReport.data"
            :is-loading="loadingStates.companySummary"
            :error="error"
          />
          <MedicActivityReport 
            v-else-if="currentReport.type === 'medic-activity'"
            :key="'medic-activity-' + (currentReport.data.generatedAt || Date.now())"
            :report-data="currentReport.data"
            :is-loading="loadingStates.medicActivity"
            :error="error"
          />
          <ServicesUtilizationReport 
            v-else-if="currentReport.type === 'services-utilization'"
            :key="'services-utilization-' + (currentReport.data.generatedAt || Date.now())"
            :report-data="currentReport.data"
            :is-loading="loadingStates.servicesUtilization"
            :error="error"
          />
          <PatientActivityReport 
            v-else-if="currentReport.type === 'patient-activity'"
            :key="'patient-activity-' + (currentReport.data.generatedAt || Date.now())"
            :report-data="currentReport.data"
            :is-loading="loadingStates.patientActivity"
            :error="error"
          />
          <FinancialOverviewReport 
            v-else-if="currentReport.type === 'financial-overview'"
            :key="'financial-overview-' + (currentReport.data.generatedAt || Date.now())"
            :report-data="currentReport.data.financialMetrics || currentReport.data"
            :is-loading="loadingStates.financialOverview"
            :error="error"
          />
          <PaymentsReport 
            v-else-if="currentReport.type === 'payments'"
            :key="'payments-' + (currentReport.data.generatedAt || Date.now())"
            :report-data="currentReport.data"
            :is-loading="loadingStates.payments"
            :error="error"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="Object.values(loadingStates).some(Boolean)" class="card loading-card">
      <div class="card-content">
        <div class="loading-state">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <h3>Generating Report...</h3>
          <p>Please wait while we compile your data.</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !Object.values(loadingStates).some(Boolean) && !currentReport" class="card error-card">
      <div class="card-content">
        <div class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Error Generating Report</h3>
          <p>{{ error }}</p>
          <button @click="error = null" class="btn btn-primary">
            <i class="fas fa-times"></i> Dismiss
          </button>
        </div>
      </div>
    </div>

    <!-- No Report Selected -->
    <div v-if="!currentReport && !Object.values(loadingStates).some(Boolean) && !error" class="no-report-message">
      <div class="no-report-content">
        <i class="fas fa-chart-line"></i>
        <h3>Select a Report Type</h3>
        <p>Choose from the available report types above to generate detailed insights about your company's performance.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import CompanyAdminService from '@/services/CompanyAdminService';
import CompanySummaryReport from '@/components/reports/CompanySummaryReport.vue';
import MedicActivityReport from '@/components/reports/MedicActivityReport.vue';
import ServicesUtilizationReport from '@/components/reports/ServicesUtilizationReport.vue';
import PatientActivityReport from '@/components/reports/PatientActivityReport.vue';
import FinancialOverviewReport from '@/components/reports/FinancialOverviewReport.vue';
import PaymentsReport from '@/components/reports/PaymentsReport.vue';

const toast = useToast();

// State
const dateRange = reactive({
  startDate: '',
  endDate: ''
});

const loadingStates = reactive({
  companySummary: false,
  medicActivity: false,
  servicesUtilization: false,
  patientActivity: false,
  financialOverview: false,
  payments: false
});

const currentReport = ref(null);
const error = ref(null);

// Methods
const onDateRangeChange = () => {
  // Clear current report when date range changes
  currentReport.value = null;
  error.value = null;
};

const setQuickFilter = (filter) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (filter) {
    case 'thisMonth':
      dateRange.startDate = formatDateForInput(new Date(year, month, 1));
      dateRange.endDate = formatDateForInput(new Date(year, month + 1, 0));
      break;
    case 'lastMonth':
      dateRange.startDate = formatDateForInput(new Date(year, month - 1, 1));
      dateRange.endDate = formatDateForInput(new Date(year, month, 0));
      break;
    case 'thisYear':
      dateRange.startDate = formatDateForInput(new Date(year, 0, 1));
      dateRange.endDate = formatDateForInput(now);
      break;
  }
  onDateRangeChange();
};

const resetDateRange = () => {
  dateRange.startDate = '';
  dateRange.endDate = '';
  onDateRangeChange();
};

const formatDateForInput = (date) => {
  return date.toISOString().split('T')[0];
};

const generateReport = async (reportType) => {
  // Prevent multiple simultaneous requests
  if (Object.values(loadingStates).some(Boolean)) {
    toast.warning('Please wait for the current report to finish loading');
    return;
  }
  
  // Clear previous error and report
  error.value = null;
  currentReport.value = null;
  
  // Map report types to loading state keys
  const loadingKeyMap = {
    'company-summary': 'companySummary',
    'medic-activity': 'medicActivity',
    'services-utilization': 'servicesUtilization',
    'patient-activity': 'patientActivity',
    'financial-overview': 'financialOverview',
    'payments': 'payments'
  };
  
  const loadingKey = loadingKeyMap[reportType];
  if (!loadingKey) {
    error.value = 'Unknown report type';
    return;
  }
  
  // Reset all loading states first
  Object.keys(loadingStates).forEach(key => {
    loadingStates[key] = false;
  });
  
  loadingStates[loadingKey] = true;

  try {
    let reportData;
    const startDate = dateRange.startDate || null;
    const endDate = dateRange.endDate || null;

    switch (reportType) {
      case 'company-summary':
        reportData = await CompanyAdminService.getCompanySummaryReport(startDate, endDate);
        break;
      case 'medic-activity':
        reportData = await CompanyAdminService.getMedicActivityReport(startDate, endDate);
        break;
      case 'services-utilization':
        reportData = await CompanyAdminService.getServicesUtilizationReport(startDate, endDate);
        break;
      case 'patient-activity':
        reportData = await CompanyAdminService.getPatientsActivityReport(startDate, endDate);
        break;
      case 'financial-overview':
        reportData = await CompanyAdminService.getFinancialOverviewReport(startDate, endDate);
        break;
      case 'payments':
        reportData = await CompanyAdminService.getPaymentsReport(startDate, endDate);
        break;
      default:
        throw new Error('Unknown report type');
    }

    // Ensure reportData is valid before setting
    if (!reportData || typeof reportData !== 'object') {
      throw new Error('Invalid report data received');
    }

    currentReport.value = {
      type: reportType,
      data: reportData,
      generatedAt: new Date()
    };

    toast.success(`${getReportTitle(reportType)} generated successfully`);
  } catch (err) {
    console.error(`Error generating ${reportType} report:`, err);
    const errorMessage = err.response?.data?.message || err.message || `Failed to generate ${getReportTitle(reportType)}`;
    error.value = errorMessage;
    toast.error(errorMessage);
    
    // Clear current report on error
    currentReport.value = null;
  } finally {
    loadingStates[loadingKey] = false;
  }
};

const getReportTitle = (reportType) => {
  const titles = {
    'company-summary': 'Company Summary Report',
    'medic-activity': 'Medic Activity Report',
    'services-utilization': 'Services Utilization Report',
    'patient-activity': 'Patient Activity Report',
    'financial-overview': 'Financial Overview Report',
    'payments': 'Payments Report'
  };
  return titles[reportType] || 'Report';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB');
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-GB');
};

const exportReport = () => {
  if (!currentReport.value) return;
  
  // Create a simple text export for now
  const reportContent = JSON.stringify(currentReport.value.data, null, 2);
  const blob = new Blob([reportContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentReport.value.type}-report-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success('Report exported successfully');
};

// Initialize with current month
onMounted(() => {
  setQuickFilter('thisMonth');
});
</script>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 0;
}

.page-header h1 {
  color: var(--dark-color);
  margin-bottom: 0.5rem;
}

.page-header i {
  margin-right: 0.8rem;
  color: var(--primary-color-start);
}

.filters-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: none;
  box-shadow: var(--shadow-light);
}

.date-range-controls {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 1.5rem;
  align-items: end;
}

.quick-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-filters .btn {
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e9ecef;
  position: relative;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.report-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.report-icon {
  background: linear-gradient(135deg, var(--primary-color-start) 0%, var(--primary-color-end) 100%);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.report-icon i {
  font-size: 1.5rem;
}

.report-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--dark-color);
  font-size: 1.25rem;
}

.report-info p {
  margin: 0;
  color: var(--text-color);
  font-size: 0.9rem;
  line-height: 1.4;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
}

.report-actions .btn {
  font-weight: 600;
}

.report-display-card {
  background: white;
  border: none;
  box-shadow: var(--shadow-medium);
}

.report-display-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.report-display-header h3 {
  margin: 0;
  color: var(--dark-color);
}

.report-display-header h3 i {
  margin-right: 0.8rem;
  color: var(--primary-color-start);
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.report-period {
  background: var(--primary-color-start);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: var(--border-radius);
  font-size: 0.85rem;
  font-weight: 600;
}

.report-generated {
  color: var(--text-color);
  font-size: 0.85rem;
}

.report-content {
  padding: 1rem 0;
}

.no-report-message {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: var(--border-radius-large);
  border: 2px dashed #dee2e6;
}

.no-report-content i {
  font-size: 4rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.no-report-content h3 {
  color: var(--dark-color);
  margin-bottom: 0.5rem;
}

.no-report-content p {
  color: var(--text-color);
  max-width: 400px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .date-range-controls {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
  }
  
  .report-display-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .report-meta {
    justify-content: flex-start;
  }
}

.financial-icon {
  background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%);
}

.payments-icon {
  background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
}

.report-card.loading {
  opacity: 0.7;
  pointer-events: none;
}

.report-loading {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: var(--primary-color-start);
  font-size: 1.2rem;
}

/* Loading and Error States */
.loading-card,
.error-card {
  background: white;
  border: none;
  box-shadow: var(--shadow-medium);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-spinner,
.error-icon {
  margin-bottom: 1.5rem;
}

.loading-spinner i {
  font-size: 3rem;
  color: var(--primary-color-start);
  animation: fa-spin 1s linear infinite;
}

.error-icon i {
  font-size: 3rem;
  color: var(--warning-color);
}

.loading-state h3,
.error-state h3 {
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.loading-state p,
.error-state p {
  color: var(--text-color);
  margin-bottom: 2rem;
  font-size: 1rem;
}

.error-state .btn {
  background: var(--primary-color-start);
  border-color: var(--primary-color-start);
  color: white;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
}

.error-state .btn:hover {
  background: var(--primary-color-end);
  border-color: var(--primary-color-end);
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 