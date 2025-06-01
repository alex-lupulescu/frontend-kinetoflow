<template>
  <div class="patients-report">
    <div class="patients-header">
      <h2><i class="fas fa-users"></i> Patient Engagement Analytics</h2>
      <p>Comprehensive patient activity metrics and attendance tracking</p>
    </div>

    <div v-if="props.reportData.patientActivity && props.reportData.patientActivity.length > 0" class="patients-container">
      <!-- Patient Overview Summary -->
      <div class="overview-section">
        <h3><i class="fas fa-chart-bar"></i> Engagement Overview</h3>
        <div class="overview-stats">
          <div class="overview-card total-patients">
            <div class="overview-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="overview-content">
              <h4>{{ props.reportData.patientActivity.length }}</h4>
              <p>Active Patients</p>
              <div class="growth-indicator">
                <i class="fas fa-user-plus"></i>
                <span>Patient Base</span>
              </div>
            </div>
          </div>

          <div class="overview-card new-patients">
            <div class="overview-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="overview-content">
              <h4>{{ props.reportData.patientMetrics?.newPatientsInPeriod || 0 }}</h4>
              <p>New Patients</p>
              <div class="growth-indicator new-growth">
                <i class="fas fa-calendar-plus"></i>
                <span>Registered in Period</span>
              </div>
            </div>
          </div>

          <div class="overview-card total-appointments-patients">
            <div class="overview-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="overview-content">
              <h4>{{ getTotalAppointments() }}</h4>
              <p>Total Appointments</p>
              <div class="growth-indicator">
                <i class="fas fa-calendar"></i>
                <span>Scheduled Sessions</span>
              </div>
            </div>
          </div>

          <div class="overview-card completion-overview">
            <div class="overview-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="overview-content">
              <h4>{{ getOverallCompletionRate() }}%</h4>
              <p>Overall Completion</p>
              <div class="completion-ring">
                <div class="ring-progress" :style="{ '--progress': getOverallCompletionRate() + '%' }">
                  <span class="ring-value">{{ getOverallCompletionRate() }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="overview-card noshow-overview">
            <div class="overview-icon">
              <i class="fas fa-user-times"></i>
            </div>
            <div class="overview-content">
              <h4>{{ getOverallNoShowRate() }}%</h4>
              <p>No-Show Rate</p>
              <div class="noshow-indicator" :class="getNoShowSeverity()">
                <i class="fas fa-exclamation-triangle" v-if="getOverallNoShowRate() > 20"></i>
                <i class="fas fa-check-circle" v-else></i>
                <span>{{ getNoShowStatus() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patient Performance Categories -->
      <div class="categories-section">
        <h3><i class="fas fa-layer-group"></i> Patient Performance Categories</h3>
        <div class="categories-grid">
          <div class="category-card excellent">
            <div class="category-header">
              <i class="fas fa-star"></i>
              <h4>Excellent Patients</h4>
            </div>
            <div class="category-stats">
              <span class="count">{{ getPatientsByCategory('excellent').length }}</span>
              <span class="label">90%+ Completion</span>
            </div>
          </div>

          <div class="category-card good">
            <div class="category-header">
              <i class="fas fa-thumbs-up"></i>
              <h4>Good Patients</h4>
            </div>
            <div class="category-stats">
              <span class="count">{{ getPatientsByCategory('good').length }}</span>
              <span class="label">70-89% Completion</span>
            </div>
          </div>

          <div class="category-card average">
            <div class="category-header">
              <i class="fas fa-balance-scale"></i>
              <h4>Average Patients</h4>
            </div>
            <div class="category-stats">
              <span class="count">{{ getPatientsByCategory('average').length }}</span>
              <span class="label">50-69% Completion</span>
            </div>
          </div>

          <div class="category-card poor">
            <div class="category-header">
              <i class="fas fa-exclamation-circle"></i>
              <h4>Needs Attention</h4>
            </div>
            <div class="category-stats">
              <span class="count">{{ getPatientsByCategory('poor').length }}</span>
              <span class="label">&lt;50% Completion</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Individual Patient Cards -->
      <div class="patients-section">
        <h3><i class="fas fa-address-book"></i> Individual Patient Performance</h3>
        <div class="patients-grid">
          <div 
            v-for="patient in props.reportData.patientActivity" 
            :key="patient.patientId"
            class="patient-card"
            :class="getPatientCardClass(patient.completionRate)"
          >
            <div class="patient-header">
              <div class="patient-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="patient-info">
                <h4>{{ patient.patientName }}</h4>
                <p>{{ patient.patientEmail }}</p>
              </div>
              <div class="performance-indicator" :class="getPerformanceClass(patient.completionRate)">
                {{ getPerformanceText(patient.completionRate) }}
              </div>
            </div>

            <div class="patient-metrics">
              <div class="metrics-row">
                <div class="metric-box appointments">
                  <div class="metric-icon">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value">{{ patient.totalAppointments || 0 }}</span>
                    <span class="metric-label">Total</span>
                  </div>
                </div>

                <div class="metric-box completed">
                  <div class="metric-icon">
                    <i class="fas fa-check"></i>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value success">{{ patient.completedAppointments || 0 }}</span>
                    <span class="metric-label">Completed</span>
                  </div>
                </div>

                <div class="metric-box noshows">
                  <div class="metric-icon">
                    <i class="fas fa-times"></i>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value warning">{{ patient.noShowAppointments || 0 }}</span>
                    <span class="metric-label">No-Shows</span>
                  </div>
                </div>
              </div>

              <div class="completion-analysis">
                <div class="completion-header">
                  <span class="completion-title">Completion Rate</span>
                  <span class="completion-value" :class="getCompletionClass(patient.completionRate)">
                    {{ formatPercentage(patient.completionRate) }}
                  </span>
                </div>
                <div class="completion-bar">
                  <div 
                    class="completion-fill" 
                    :class="getCompletionClass(patient.completionRate)"
                    :style="{ width: (patient.completionRate || 0) + '%' }"
                  ></div>
                </div>
              </div>

              <div class="noshow-analysis">
                <div class="noshow-header">
                  <span class="noshow-title">No-Show Rate</span>
                  <span class="noshow-value" :class="getNoShowClass(patient.noShowRate)">
                    {{ formatPercentage(patient.noShowRate) }}
                  </span>
                </div>
                <div class="noshow-bar">
                  <div 
                    class="noshow-fill" 
                    :class="getNoShowClass(patient.noShowRate)"
                    :style="{ width: (patient.noShowRate || 0) + '%' }"
                  ></div>
                </div>
              </div>

              <div class="patient-insights">
                <div class="insight-item">
                  <i class="fas fa-lightbulb"></i>
                  <span>{{ getPatientInsight(patient) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-patients">
      <div class="no-patients-content">
        <i class="fas fa-user-slash"></i>
        <h3>No Patient Activity Data</h3>
        <p>No patients have scheduled appointments during the selected period. Patient data will appear here once appointments are made.</p>
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
  if (!props.reportData.patientActivity) return 0;
  return props.reportData.patientActivity.reduce((sum, patient) => sum + (patient.totalAppointments || 0), 0);
};

const getOverallCompletionRate = () => {
  if (!props.reportData.patientActivity || props.reportData.patientActivity.length === 0) return 0;
  const totalAppointments = getTotalAppointments();
  const totalCompleted = props.reportData.patientActivity.reduce((sum, patient) => sum + (patient.completedAppointments || 0), 0);
  return totalAppointments > 0 ? Math.round((totalCompleted / totalAppointments) * 100) : 0;
};

const getOverallNoShowRate = () => {
  if (!props.reportData.patientActivity || props.reportData.patientActivity.length === 0) return 0;
  const totalAppointments = getTotalAppointments();
  const totalNoShows = props.reportData.patientActivity.reduce((sum, patient) => sum + (patient.noShowAppointments || 0), 0);
  return totalAppointments > 0 ? Math.round((totalNoShows / totalAppointments) * 100) : 0;
};

const getNoShowSeverity = () => {
  const rate = getOverallNoShowRate();
  if (rate > 20) return 'severe';
  if (rate > 10) return 'moderate';
  return 'good';
};

const getNoShowStatus = () => {
  const rate = getOverallNoShowRate();
  if (rate > 20) return 'High Risk';
  if (rate > 10) return 'Moderate';
  return 'Excellent';
};

const getPatientsByCategory = (category) => {
  if (!props.reportData.patientActivity) return [];
  return props.reportData.patientActivity.filter(patient => {
    const rate = patient.completionRate || 0;
    switch(category) {
      case 'excellent': return rate >= 90;
      case 'good': return rate >= 70 && rate < 90;
      case 'average': return rate >= 50 && rate < 70;
      case 'poor': return rate < 50;
      default: return false;
    }
  });
};

const getPatientCardClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 90) return 'excellent-patient';
  if (rate >= 70) return 'good-patient';
  if (rate >= 50) return 'average-patient';
  return 'poor-patient';
};

const getPerformanceClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 90) return 'performance-excellent';
  if (rate >= 70) return 'performance-good';
  if (rate >= 50) return 'performance-average';
  return 'performance-poor';
};

const getPerformanceText = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 90) return 'Excellent';
  if (rate >= 70) return 'Good';
  if (rate >= 50) return 'Average';
  return 'Needs Attention';
};

const getCompletionClass = (completionRate) => {
  const rate = completionRate || 0;
  if (rate >= 80) return 'excellent';
  if (rate >= 60) return 'good';
  if (rate >= 40) return 'average';
  return 'poor';
};

const getNoShowClass = (noShowRate) => {
  const rate = noShowRate || 0;
  if (rate <= 5) return 'excellent';
  if (rate <= 15) return 'good';
  if (rate <= 25) return 'average';
  return 'poor';
};

const getPatientInsight = (patient) => {
  const completionRate = patient.completionRate || 0;
  const noShowRate = patient.noShowRate || 0;
  const totalAppointments = patient.totalAppointments || 0;
  
  if (completionRate >= 90) {
    return `Excellent patient with ${totalAppointments} appointments`;
  } else if (completionRate >= 70) {
    return `Reliable patient, consider engagement programs`;
  } else if (noShowRate > 25) {
    return `High no-show rate, needs reminder system`;
  } else {
    return `Moderate engagement, room for improvement`;
  }
};

const getNewPatientsPercentage = () => {
  const totalPatients = props.reportData.patientMetrics?.totalPatients || 0;
  const newPatients = props.reportData.patientMetrics?.newPatientsInPeriod || 0;
  return totalPatients > 0 ? Math.round((newPatients / totalPatients) * 100) : 0;
};
</script>

<style scoped>
/* Patient Activity Report - Modern Design */
.patients-report {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Header Section */
.patients-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.patients-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
  opacity: 0.3;
}

.patients-header h2 {
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

.patients-header i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.patients-header p {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

/* Patients Container */
.patients-container {
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

.total-patients::before {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.new-patients::before {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.total-appointments-patients::before {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.completion-overview::before {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.noshow-overview::before {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.overview-icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.overview-icon i {
  font-size: 3rem;
  padding: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.total-patients .overview-icon i {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.new-patients .overview-icon i {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
}

.total-appointments-patients .overview-icon i {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.completion-overview .overview-icon i {
  background: linear-gradient(135deg, #38a169 0%, #48bb78 100%);
}

.noshow-overview .overview-icon i {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.overview-content {
  text-align: center;
}

.overview-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
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

.growth-indicator.new-growth {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
}

.completion-ring {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.ring-progress {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #38a169 0%, #38a169 var(--progress, 0%), #e2e8f0 var(--progress, 0%), #e2e8f0 100%);
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

.noshow-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 1rem;
}

.noshow-indicator.good {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
}

.noshow-indicator.moderate {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.noshow-indicator.severe {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

/* Categories Section */
.categories-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.categories-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.categories-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  text-align: center;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.category-card.excellent {
  border-left: 6px solid #38a169;
}

.category-card.good {
  border-left: 6px solid #3182ce;
}

.category-card.average {
  border-left: 6px solid #ed8936;
}

.category-card.poor {
  border-left: 6px solid #e53e3e;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.category-header i {
  font-size: 2rem;
  color: #667eea;
}

.category-header h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.category-stats .count {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.category-stats .label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

/* Patients Section */
.patients-section {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.patients-section h3 {
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.patients-section i {
  color: #667eea;
  font-size: 1.6rem;
}

.patients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.patient-card {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.patient-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.patient-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.excellent-patient::before {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.good-patient::before {
  background: linear-gradient(90deg, #3182ce 0%, #4299e1 100%);
}

.average-patient::before {
  background: linear-gradient(90deg, #ed8936 0%, #fbb040 100%);
}

.poor-patient::before {
  background: linear-gradient(90deg, #e53e3e 0%, #f56565 100%);
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.patient-avatar {
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

.patient-info {
  flex: 1;
}

.patient-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.patient-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
}

.performance-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.performance-excellent {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.performance-good {
  background: rgba(49, 130, 206, 0.1);
  color: #3182ce;
  border: 1px solid rgba(49, 130, 206, 0.3);
}

.performance-average {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
  border: 1px solid rgba(237, 137, 54, 0.3);
}

.performance-poor {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.patient-metrics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metrics-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.metric-box {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1rem;
  border-left: 4px solid #e2e8f0;
  text-align: center;
}

.metric-icon {
  margin-bottom: 0.5rem;
}

.metric-icon i {
  font-size: 1.5rem;
  color: #667eea;
}

.metric-content .metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.metric-content .metric-value.success {
  color: #38a169;
}

.metric-content .metric-value.warning {
  color: #e53e3e;
}

.metric-content .metric-label {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

.completion-analysis, .noshow-analysis {
  background: #f7fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
}

.completion-header, .noshow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.completion-title, .noshow-title {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.completion-value, .noshow-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.completion-value.excellent, .noshow-value.excellent {
  color: #38a169;
}

.completion-value.good, .noshow-value.good {
  color: #3182ce;
}

.completion-value.average, .noshow-value.average {
  color: #ed8936;
}

.completion-value.poor, .noshow-value.poor {
  color: #e53e3e;
}

.completion-bar, .noshow-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.completion-fill, .noshow-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}

.completion-fill.excellent, .noshow-fill.excellent {
  background: linear-gradient(90deg, #38a169 0%, #48bb78 100%);
}

.completion-fill.good, .noshow-fill.good {
  background: linear-gradient(90deg, #3182ce 0%, #4299e1 100%);
}

.completion-fill.average, .noshow-fill.average {
  background: linear-gradient(90deg, #ed8936 0%, #fbb040 100%);
}

.completion-fill.poor, .noshow-fill.poor {
  background: linear-gradient(90deg, #e53e3e 0%, #f56565 100%);
}

.patient-insights {
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

/* No Patients */
.no-patients {
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-patients-content {
  text-align: center;
  max-width: 500px;
}

.no-patients-content i {
  font-size: 5rem;
  color: #e2e8f0;
  margin-bottom: 2rem;
}

.no-patients-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #4a5568;
}

.no-patients-content p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .patients-report {
    padding: 0.5rem;
    gap: 1.5rem;
  }

  .patients-header h2 {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .patients-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .patient-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .metrics-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .overview-icon i {
    font-size: 2rem;
    padding: 0.75rem;
  }

  .overview-content h4 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .overview-stats {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .overview-section, .categories-section, .patients-section {
    padding: 1.5rem;
  }

  .patient-card {
    padding: 1.5rem;
  }

  .overview-content h4 {
    font-size: 1.8rem;
  }

  .category-stats .count {
    font-size: 2rem;
  }
}
</style> 