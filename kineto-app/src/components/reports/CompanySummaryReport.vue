<template>
  <div class="company-summary-report">
    <!-- Header with Company Info -->
    <div class="report-header">
      <div class="header-content">
        <div class="company-badge">
          <i class="fas fa-building"></i>
          <span>{{ props.reportData.companyName }}</span>
        </div>
        <div class="period-badge">
          <i class="fas fa-calendar-alt"></i>
          <span>{{ formatDate(props.reportData.startDate) }} - {{ formatDate(props.reportData.endDate) }}</span>
        </div>
      </div>
      <div class="generated-time">
        <i class="fas fa-clock"></i>
        Generated {{ formatDateTime(props.reportData.generatedAt) }}
      </div>
    </div>

    <!-- Key Metrics Dashboard -->
    <div class="metrics-dashboard">
      <!-- Medics Metric -->
      <div class="metric-card medics-card">
        <div class="metric-header">
          <div class="metric-icon">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="metric-info">
            <h3>{{ props.reportData.medicActivity?.activeMedics || 0 }}</h3>
            <p>Active Medics</p>
          </div>
        </div>
        <div class="metric-details">
          <div class="detail-item">
            <span class="label">Total Appointments</span>
            <span class="value">{{ props.reportData.medicActivity?.totalAppointments || 0 }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: props.reportData.medicActivity.overallCompletionRate ? (props.reportData.medicActivity.overallCompletionRate + '%') : '0%' }"></div>
          </div>
          <span class="progress-label">{{ formatPercentage(props.reportData.medicActivity?.overallCompletionRate) }} completion rate</span>
        </div>
      </div>

      <!-- Patients Metric -->
      <div class="metric-card patients-card">
        <div class="metric-header">
          <div class="metric-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="metric-info">
            <h3>{{ props.reportData.patientMetrics?.totalPatients || 0 }}</h3>
            <p>Total Patients</p>
          </div>
        </div>
        <div class="metric-details">
          <div class="detail-item">
            <span class="label">Active in Period</span>
            <span class="value">{{ props.reportData.patientMetrics?.activePatientsInPeriod || 0 }}</span>
          </div>
          <div class="detail-item new-patients">
            <span class="label">
              <i class="fas fa-user-plus"></i>
              New Patients
            </span>
            <span class="value new-patient-count">{{ props.reportData.patientMetrics?.newPatientsInPeriod || 0 }}</span>
          </div>
          <div class="engagement-ring">
            <div class="ring-progress" :style="{ '--progress': (props.reportData.patientMetrics?.engagementRate || 0) + '%' }">
              <span class="ring-value">{{ formatPercentage(props.reportData.patientMetrics?.engagementRate) }}</span>
            </div>
          </div>
          <span class="progress-label">Engagement Rate</span>
        </div>
      </div>

      <!-- Financial Metric -->
      <div class="metric-card financial-card">
        <div class="metric-header">
          <div class="metric-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="metric-info">
            <h3>{{ props.reportData.financialMetrics?.activePlans || 0 }}</h3>
            <p>Active Plans</p>
          </div>
        </div>
        <div class="metric-details">
          <div class="detail-item">
            <span class="label">Sessions Consumed</span>
            <span class="value">{{ props.reportData.financialMetrics?.consumedSessions || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Completed Sessions</span>
            <span class="value success">{{ props.reportData.financialMetrics?.completedAppointments || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Services Section -->
    <div class="services-section">
      <div class="section-header">
        <h2><i class="fas fa-star"></i> Top Performing Services</h2>
        <p>Most popular services by appointment volume and completion rate</p>
      </div>
      
      <div v-if="props.reportData.topServices && props.reportData.topServices.length > 0" class="services-grid">
        <div 
          v-for="(service, index) in props.reportData.topServices.slice(0, 6)" 
          :key="service.serviceId"
          class="service-card"
          :class="`rank-${index + 1}`"
        >
          <div class="service-rank">
            <span class="rank-number">#{{ index + 1 }}</span>
            <i class="fas fa-trophy" v-if="index === 0"></i>
            <i class="fas fa-medal" v-else-if="index === 1"></i>
            <i class="fas fa-award" v-else-if="index === 2"></i>
          </div>
          <div class="service-content">
            <h4>{{ service.serviceName }}</h4>
            <div class="service-stats">
              <div class="stat-item">
                <i class="fas fa-calendar-check"></i>
                <span>{{ service.totalAppointments }} appointments</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-percentage"></i>
                <span>{{ formatPercentage(service.completionRate) }} completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-services">
        <i class="fas fa-inbox"></i>
        <h3>No Service Data Available</h3>
        <p>No services have been scheduled during this period.</p>
      </div>
    </div>

    <!-- Performance Insights -->
    <div class="insights-section">
      <div class="section-header">
        <h2><i class="fas fa-lightbulb"></i> Performance Insights</h2>
      </div>
      
      <div class="insights-grid">
        <div class="insight-card completion-insight">
          <div class="insight-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="insight-content">
            <h4>Completion Performance</h4>
            <p class="insight-value">{{ formatPercentage(props.reportData.medicActivity?.overallCompletionRate) }}</p>
            <p class="insight-description">
              <span v-if="(props.reportData.medicActivity?.overallCompletionRate || 0) >= 80" class="status excellent">Excellent performance!</span>
              <span v-else-if="(props.reportData.medicActivity?.overallCompletionRate || 0) >= 60" class="status good">Good performance</span>
              <span v-else class="status needs-improvement">Needs improvement</span>
            </p>
          </div>
        </div>

        <div class="insight-card attendance-insight">
          <div class="insight-icon">
            <i class="fas fa-user-times"></i>
          </div>
          <div class="insight-content">
            <h4>No-Show Rate</h4>
            <p class="insight-value warning">{{ formatPercentage(props.reportData.medicActivity?.overallNoShowRate) }}</p>
            <p class="insight-description">
              <span v-if="(props.reportData.medicActivity?.overallNoShowRate || 0) <= 10" class="status excellent">Excellent attendance!</span>
              <span v-else-if="(props.reportData.medicActivity?.overallNoShowRate || 0) <= 20" class="status good">Acceptable rate</span>
              <span v-else class="status needs-improvement">Consider reminder strategies</span>
            </p>
          </div>
        </div>

        <div class="insight-card engagement-insight">
          <div class="insight-icon">
            <i class="fas fa-heart"></i>
          </div>
          <div class="insight-content">
            <h4>Patient Engagement</h4>
            <p class="insight-value info">{{ formatPercentage(props.reportData.patientMetrics?.engagementRate) }}</p>
            <p class="insight-description">
              <span v-if="(props.reportData.patientMetrics?.engagementRate || 0) >= 70" class="status excellent">Highly engaged patients</span>
              <span v-else-if="(props.reportData.patientMetrics?.engagementRate || 0) >= 50" class="status good">Good engagement</span>
              <span v-else class="status needs-improvement">Focus on patient retention</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  reportData: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${Math.round(value * 100) / 100}%`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB');
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-GB');
};
</script>

<style scoped>
/* Company Summary Report - Modern Design */
.company-summary-report {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Report Header */
.report-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.report-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.company-badge, .period-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.company-badge i, .period-badge i {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

.company-badge span, .period-badge span {
  font-weight: 600;
  font-size: 0.95rem;
}

.generated-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  position: relative;
  z-index: 1;
}

/* Metrics Dashboard */
.metrics-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.metric-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.metric-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.medics-card::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.patients-card::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.financial-card::before {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.medics-card .metric-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.patients-card .metric-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.financial-card .metric-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.metric-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.metric-info p {
  margin: 0;
  color: #718096;
  font-size: 1rem;
  font-weight: 500;
}

.metric-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #e2e8f0;
}

.detail-item .label {
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-item .value {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
}

.detail-item .value.success {
  color: #38a169;
}

.detail-item.new-patients {
  border-left-color: #38a169;
  background: linear-gradient(135deg, rgba(56, 161, 105, 0.05) 0%, rgba(72, 187, 120, 0.05) 100%);
}

.detail-item.new-patients .label {
  color: #38a169;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item.new-patients .label i {
  color: #38a169;
  font-size: 1rem;
}

.detail-item.new-patients .value.new-patient-count {
  color: #38a169;
  font-weight: 700;
  font-size: 1.2rem;
}

.progress-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 6px;
  transition: width 1s ease;
}

.progress-label {
  text-align: center;
  color: #718096;
  font-size: 0.85rem;
  font-weight: 500;
}

.engagement-ring {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.ring-progress {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #43e97b 0%, #43e97b var(--progress, 0%), #e2e8f0 var(--progress, 0%), #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.ring-progress::before {
  content: '';
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
  position: absolute;
}

.ring-value {
  font-weight: 700;
  font-size: 1rem;
  color: #2d3748;
  position: relative;
  z-index: 1;
}

/* Services Section */
.services-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.section-header i {
  color: #ffd700;
  font-size: 1.8rem;
}

.section-header p {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.service-card.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #744210;
  border-color: #ffd700;
}

.service-card.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 100%);
  color: #4a5568;
  border-color: #c0c0c0;
}

.service-card.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #d2b48c 100%);
  color: #553c12;
  border-color: #cd7f32;
}

.service-rank {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.rank-number {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
}

.service-rank i {
  font-size: 1.5rem;
  color: #ffd700;
}

.service-content h4 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: inherit;
}

.service-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: inherit;
  opacity: 0.8;
}

.stat-item i {
  width: 16px;
  text-align: center;
}

.no-services {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.no-services i {
  font-size: 4rem;
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.no-services h3 {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
}

/* Insights Section */
.insights-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.insight-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.insight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.completion-insight {
  border-left: 6px solid #38a169;
}

.attendance-insight {
  border-left: 6px solid #e53e3e;
}

.engagement-insight {
  border-left: 6px solid #667eea;
}

.insight-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 15px;
  margin-bottom: 1.5rem;
}

.completion-insight .insight-icon {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
  color: white;
}

.attendance-insight .insight-icon {
  background: linear-gradient(135deg, #e53e3e 0%, #f56565 100%);
  color: white;
}

.engagement-insight .insight-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.insight-icon i {
  font-size: 1.5rem;
}

.insight-content h4 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
}

.insight-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2d3748;
}

.insight-value.warning {
  color: #e53e3e;
}

.insight-value.info {
  color: #667eea;
}

.insight-description {
  color: #718096;
  font-size: 0.95rem;
  line-height: 1.5;
}

.status {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.status.excellent {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
}

.status.good {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
}

.status.needs-improvement {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

/* Responsive Design */
@media (max-width: 768px) {
  .company-summary-report {
    padding: 0.5rem;
    gap: 1.5rem;
  }

  .metrics-dashboard {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .metric-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .metric-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .metric-info h3 {
    font-size: 2rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .report-header {
    padding: 1.5rem;
  }

  .metric-card, .services-section, .insights-section {
    padding: 1.5rem;
  }

  .metric-info h3 {
    font-size: 1.8rem;
  }
}
</style> 