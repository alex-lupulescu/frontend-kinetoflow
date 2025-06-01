<template>
  <div class="services-report">
    <div class="services-header">
      <h2><i class="fas fa-chart-pie"></i> Services Performance Dashboard</h2>
      <p>Service utilization metrics and appointment completion analytics</p>
    </div>

    <div v-if="props.reportData.serviceUtilization && props.reportData.serviceUtilization.length > 0" class="services-container">
      <!-- Top Services Summary -->
      <div class="summary-section">
        <h3><i class="fas fa-trophy"></i> Performance Overview</h3>
        <div class="summary-stats">
          <div class="summary-card total-services">
            <div class="summary-icon">
              <i class="fas fa-concierge-bell"></i>
            </div>
            <div class="summary-content">
              <h4>{{ props.reportData.serviceUtilization.length }}</h4>
              <p>Active Services</p>
            </div>
          </div>
          <div class="summary-card total-appointments">
            <div class="summary-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="summary-content">
              <h4>{{ getTotalAppointments() }}</h4>
              <p>Total Appointments</p>
            </div>
          </div>
          <div class="summary-card average-completion">
            <div class="summary-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="summary-content">
              <h4>{{ getAverageCompletion() }}%</h4>
              <p>Average Completion</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Grid -->
      <div class="services-grid">
        <div 
          v-for="(service, index) in props.reportData.serviceUtilization" 
          :key="service.serviceId"
          class="service-card"
          :class="getServiceCardClass(service.completionRate)"
        >
          <div class="service-header">
            <div class="service-rank">
              <span class="rank-badge" :class="getRankClass(index)">
                #{{ index + 1 }}
              </span>
              <div class="service-icons">
                <i class="fas fa-medal" v-if="index === 0"></i>
                <i class="fas fa-trophy" v-else-if="index === 1"></i>
                <i class="fas fa-award" v-else-if="index === 2"></i>
                <i class="fas fa-star" v-else></i>
              </div>
            </div>
            <h4>{{ service.serviceName }}</h4>
          </div>

          <div class="service-metrics">
            <div class="metric-grid">
              <div class="metric-item appointments">
                <div class="metric-icon">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="metric-data">
                  <span class="metric-value">{{ service.totalAppointments || 0 }}</span>
                  <span class="metric-label">Total Appointments</span>
                </div>
              </div>

              <div class="metric-item completed">
                <div class="metric-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="metric-data">
                  <span class="metric-value success">{{ service.completedAppointments || 0 }}</span>
                  <span class="metric-label">Completed</span>
                </div>
              </div>
            </div>

            <div class="completion-section">
              <div class="completion-header">
                <span class="completion-label">Completion Rate</span>
                <span class="completion-percentage" :class="getCompletionClass(service.completionRate)">
                  {{ formatPercentage(service.completionRate) }}
                </span>
              </div>
              <div class="completion-bar">
                <div 
                  class="completion-fill" 
                  :class="getCompletionClass(service.completionRate)"
                  :style="{ width: (service.completionRate || 0) + '%' }"
                ></div>
              </div>
              <div class="completion-status">
                <span class="status-badge" :class="getStatusClass(service.completionRate)">
                  {{ getStatusText(service.completionRate) }}
                </span>
              </div>
            </div>

            <div class="service-insights">
              <div class="insight-item" v-if="service.totalAppointments > 0">
                <i class="fas fa-lightbulb"></i>
                <span>{{ getServiceInsight(service) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-services">
      <div class="no-services-content">
        <i class="fas fa-inbox"></i>
        <h3>No Service Data Available</h3>
        <p>No services have been utilized during the selected period. Services will appear here once appointments are scheduled.</p>
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

const getTotalAppointments = () => {
  if (!props.reportData.serviceUtilization) return 0;
  return props.reportData.serviceUtilization.reduce((sum, service) => sum + (service.totalAppointments || 0), 0);
};

const getAverageCompletion = () => {
  if (!props.reportData.serviceUtilization || props.reportData.serviceUtilization.length === 0) return 0;
  const total = props.reportData.serviceUtilization.reduce((sum, service) => sum + (service.completionRate || 0), 0);
  return Math.round(total / props.reportData.serviceUtilization.length * 100) / 100;
};

const getServiceCardClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 90) return 'excellent-service';
  if (rate >= 75) return 'good-service';
  if (rate >= 50) return 'average-service';
  return 'poor-service';
};

const getRankClass = (index) => {
  if (index === 0) return 'rank-gold';
  if (index === 1) return 'rank-silver';
  if (index === 2) return 'rank-bronze';
  return 'rank-default';
};

const getCompletionClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 80) return 'excellent';
  if (rate >= 60) return 'good';
  if (rate >= 40) return 'average';
  return 'poor';
};

const getStatusClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 80) return 'status-excellent';
  if (rate >= 60) return 'status-good';
  if (rate >= 40) return 'status-average';
  return 'status-poor';
};

const getStatusText = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 90) return 'Outstanding';
  if (rate >= 80) return 'Excellent';
  if (rate >= 60) return 'Good';
  if (rate >= 40) return 'Average';
  return 'Needs Improvement';
};

const getServiceInsight = (service) => {
  const rate = service.completionRate || 0;
  const total = service.totalAppointments || 0;
  
  if (rate >= 90) {
    return `Top performing service with ${total} appointments`;
  } else if (rate >= 70) {
    return `Strong performance with room for optimization`;
  } else if (rate >= 50) {
    return `Moderate performance, consider improvement strategies`;
  } else {
    return `Low completion rate, needs attention`;
  }
};
</script>

<style scoped>
/* Services Utilization Report - Modern Design */
.services-report {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Header Section */
.services-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.services-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
  opacity: 0.3;
}

.services-header h2 {
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

.services-header i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.services-header p {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

/* Services Container */
.services-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Summary Section */
.summary-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.summary-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.summary-section i {
  color: #ffd700;
  font-size: 1.6rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.total-services::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.total-appointments::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.average-completion::before {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.summary-icon {
  width: 70px;
  height: 70px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.total-services .summary-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.total-appointments .summary-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.average-completion .summary-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.summary-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d3748;
}

.summary-content p {
  margin: 0;
  color: #718096;
  font-size: 1rem;
  font-weight: 500;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.service-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
}

.excellent-service::before {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.good-service::before {
  background: linear-gradient(90deg, #3182ce 0%, #4299e1 100%);
}

.average-service::before {
  background: linear-gradient(90deg, #ed8936 0%, #fbb040 100%);
}

.poor-service::before {
  background: linear-gradient(90deg, #e53e3e 0%, #f56565 100%);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.service-rank {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rank-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #744210 !important;
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 100%);
  color: #4a5568 !important;
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #d2b48c 100%);
  color: #553c12 !important;
}

.rank-default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.service-icons i {
  font-size: 1.5rem;
  color: #ffd700;
}

.service-header h4 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2d3748;
  flex: 1;
  text-align: center;
}

.service-metrics {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.metric-item {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.appointments .metric-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.completed .metric-icon {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
}

.metric-data {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.metric-value.success {
  color: #38a169;
}

.metric-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.completion-section {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.completion-label {
  font-size: 1rem;
  color: #718096;
  font-weight: 500;
}

.completion-percentage {
  font-size: 1.5rem;
  font-weight: 700;
}

.completion-percentage.excellent {
  color: #38a169;
}

.completion-percentage.good {
  color: #3182ce;
}

.completion-percentage.average {
  color: #ed8936;
}

.completion-percentage.poor {
  color: #e53e3e;
}

.completion-bar {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.completion-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease;
}

.completion-fill.excellent {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.completion-fill.good {
  background: linear-gradient(90deg, #3182ce 0%, #4299e1 100%);
}

.completion-fill.average {
  background: linear-gradient(90deg, #ed8936 0%, #fbb040 100%);
}

.completion-fill.poor {
  background: linear-gradient(90deg, #e53e3e 0%, #f56565 100%);
}

.completion-status {
  text-align: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-excellent {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.status-good {
  background: rgba(49, 130, 206, 0.1);
  color: #3182ce;
  border: 1px solid rgba(49, 130, 206, 0.3);
}

.status-average {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
  border: 1px solid rgba(237, 137, 54, 0.3);
}

.status-poor {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.service-insights {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 1rem;
  border-left: 4px solid #667eea;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4a5568;
  font-size: 0.9rem;
  font-style: italic;
}

.insight-item i {
  color: #667eea;
  font-size: 1rem;
}

/* No Services */
.no-services {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-services-content {
  text-align: center;
  max-width: 500px;
}

.no-services-content i {
  font-size: 5rem;
  color: #e2e8f0;
  margin-bottom: 2rem;
}

.no-services-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #4a5568;
}

.no-services-content p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .services-report {
    padding: 0.5rem;
    gap: 1.5rem;
  }

  .services-header h2 {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .service-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .metric-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .services-header, .summary-section, .service-card {
    padding: 1.5rem;
  }

  .services-header h2 {
    font-size: 1.5rem;
  }

  .summary-content h4 {
    font-size: 1.8rem;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .service-header h4 {
    font-size: 1.2rem;
  }
}
</style> 