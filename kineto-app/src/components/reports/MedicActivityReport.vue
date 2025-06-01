<template>
  <div class="medic-activity-report">
    <!-- Company Overview Dashboard -->
    <div class="overview-section" v-if="reportData.companyStats">
      <div class="section-header">
        <h2><i class="fas fa-chart-pulse"></i> Company Performance Overview</h2>
        <p>Overall medical team performance metrics and statistics</p>
      </div>
      
      <div class="overview-grid">
        <div class="overview-card active-medics">
          <div class="card-icon">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="card-content">
            <h3>{{ reportData.companyStats.activeMedics || 0 }}</h3>
            <p>Active Medics</p>
            <div class="growth-indicator positive">
              <i class="fas fa-arrow-up"></i>
              <span>Medical Team</span>
            </div>
          </div>
        </div>

        <div class="overview-card total-appointments">
          <div class="card-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="card-content">
            <h3>{{ reportData.companyStats.totalAppointments || 0 }}</h3>
            <p>Total Appointments</p>
            <div class="growth-indicator neutral">
              <i class="fas fa-calendar"></i>
              <span>Scheduled Sessions</span>
            </div>
          </div>
        </div>

        <div class="overview-card completion-rate">
          <div class="card-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-content">
            <h3>{{ formatPercentage(reportData.companyStats.overallCompletionRate) }}</h3>
            <p>Completion Rate</p>
            <div class="performance-bar">
              <div class="bar-fill success" :style="{ width: (reportData.companyStats.overallCompletionRate || 0) + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="overview-card no-show-rate">
          <div class="card-icon">
            <i class="fas fa-user-times"></i>
          </div>
          <div class="card-content">
            <h3>{{ formatPercentage(reportData.companyStats.overallNoShowRate) }}</h3>
            <p>No-Show Rate</p>
            <div class="performance-bar">
              <div class="bar-fill warning" :style="{ width: (reportData.companyStats.overallNoShowRate || 0) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Individual Medic Performance -->
    <div class="medics-section">
      <div class="section-header">
        <h2><i class="fas fa-users-medical"></i> Individual Medic Performance</h2>
        <p>Detailed performance breakdown for each medical professional</p>
      </div>

      <div v-if="reportData.medicStats && reportData.medicStats.length > 0" class="medics-container">
        <div class="medics-grid">
          <div 
            v-for="medic in reportData.medicStats" 
            :key="medic.medicId"
            class="medic-card"
          >
            <div class="medic-header">
              <div class="medic-avatar">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="medic-info">
                <h4>{{ medic.medicName }}</h4>
                <p>{{ medic.medicEmail }}</p>
              </div>
              <div class="performance-badge" :class="getPerformanceBadgeClass(medic.completionRate)">
                {{ getPerformanceLabel(medic.completionRate) }}
              </div>
            </div>

            <div class="medic-stats">
              <div class="stat-row">
                <div class="stat-item">
                  <span class="stat-label">Total Appointments</span>
                  <span class="stat-value">{{ medic.totalAppointments || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completed</span>
                  <span class="stat-value success">{{ medic.completedAppointments || 0 }}</span>
                </div>
              </div>

              <div class="stat-row">
                <div class="stat-item">
                  <span class="stat-label">No-Shows</span>
                  <span class="stat-value warning">{{ medic.noShowAppointments || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">No-Show Rate</span>
                  <span class="stat-value warning">{{ formatPercentage(medic.noShowRate) }}</span>
                </div>
              </div>

              <div class="completion-progress">
                <div class="progress-header">
                  <span>Completion Rate</span>
                  <span class="progress-value">{{ formatPercentage(medic.completionRate) }}</span>
                </div>
                <div class="progress-track">
                  <div 
                    class="progress-fill" 
                    :class="getProgressClass(medic.completionRate)"
                    :style="{ width: (medic.completionRate || 0) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-medics">
        <i class="fas fa-user-slash"></i>
        <h3>No Medical Staff Data Available</h3>
        <p>No medics have recorded activities during the selected period.</p>
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

const getPerformanceBadgeClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 90) return 'excellent';
  if (rate >= 80) return 'good';
  if (rate >= 70) return 'average';
  return 'poor';
};

const getPerformanceLabel = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 90) return 'Excellent';
  if (rate >= 80) return 'Good';
  if (rate >= 70) return 'Average';
  return 'Needs Improvement';
};

const getProgressClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 80) return 'success';
  if (rate >= 60) return 'warning';
  return 'danger';
};
</script>

<style scoped>
/* Medic Activity Report - Modern Design */
.medic-activity-report {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Overview Section */
.overview-section {
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
  color: #667eea;
  font-size: 1.8rem;
}

.section-header p {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.overview-grid {
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

.active-medics::before {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.total-appointments::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.completion-rate::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.no-show-rate::before {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.card-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.card-icon i {
  font-size: 3rem;
  padding: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.active-medics .card-icon i {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.total-appointments .card-icon i {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.completion-rate .card-icon i {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.no-show-rate .card-icon i {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card-content {
  text-align: center;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.card-content p {
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

.growth-indicator.positive {
  background: rgba(67, 233, 123, 0.1);
  color: #38a169;
}

.growth-indicator.neutral {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.performance-bar {
  background: #e2e8f0;
  border-radius: 6px;
  height: 8px;
  overflow: hidden;
  margin-top: 1rem;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease;
}

.bar-fill.success {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.bar-fill.warning {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

/* Medics Section */
.medics-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.medics-container {
  padding: 0;
}

.medics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.medic-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.medic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.medic-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.medic-avatar {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.medic-info {
  flex: 1;
}

.medic-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.medic-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
}

.performance-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.performance-badge.excellent {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.performance-badge.good {
  background: rgba(49, 130, 206, 0.1);
  color: #3182ce;
  border: 1px solid rgba(49, 130, 206, 0.3);
}

.performance-badge.average {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
  border: 1px solid rgba(237, 137, 54, 0.3);
}

.performance-badge.poor {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.medic-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-value.success {
  color: #38a169;
}

.stat-value.warning {
  color: #e53e3e;
}

.completion-progress {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header span:first-child {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.progress-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
}

.progress-track {
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease;
  position: relative;
}

.progress-fill.success {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.progress-fill.warning {
  background: linear-gradient(90deg, #ed8936 0%, #fbb040 100%);
}

.progress-fill.danger {
  background: linear-gradient(90deg, #e53e3e 0%, #f56565 100%);
}

.no-medics {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.no-medics i {
  font-size: 4rem;
  color: #e2e8f0;
  margin-bottom: 2rem;
}

.no-medics h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a5568;
}

.no-medics p {
  margin: 0;
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .medic-activity-report {
    padding: 0.5rem;
    gap: 1.5rem;
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .medics-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .medic-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .stat-row {
    grid-template-columns: 1fr;
  }

  .card-icon i {
    font-size: 2rem;
    padding: 0.75rem;
  }

  .card-content h3 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .overview-section, .medics-section {
    padding: 1.5rem;
  }

  .medic-card {
    padding: 1.5rem;
  }

  .card-content h3 {
    font-size: 1.8rem;
  }
}
</style> 