<template>
    <div class="medic-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome back, <span class="doctor-name">Dr. {{ authStore.userName }}</span>
          </h1>
          <p class="welcome-subtitle">
            <i class="fas fa-calendar-day"></i>
            {{ currentDate }} • {{ currentTime }}
          </p>
        </div>
        <div class="doctor-avatar">
          <div class="avatar-circle">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="status-indicator online"></div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card patients-card" @click="navigateTo('/app/medic/my-patients')">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalPatients }}</h3>
          <p class="stat-label">Total Patients</p>
        </div>
        <div class="stat-trend positive">
          <i class="fas fa-arrow-up"></i>
          <span>{{ stats.newPatientsThisMonth }}</span>
        </div>
      </div>

      <div class="stat-card appointments-card" @click="navigateTo('/app/medic/calendar')">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.todayAppointments }}</h3>
          <p class="stat-label">Today's Appointments</p>
        </div>
        <div class="stat-trend neutral">
          <i class="fas fa-clock"></i>
          <span>{{ stats.nextAppointmentTime }}</span>
        </div>
      </div>

      <div class="stat-card feedback-card" @click="navigateTo('/app/medic/feedback')">
        <div class="stat-icon">
          <i class="fas fa-star"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.averageRating }}</h3>
          <p class="stat-label">Average Rating</p>
        </div>
        <div class="stat-trend positive">
          <i class="fas fa-thumbs-up"></i>
          <span>{{ stats.totalFeedbacks }} reviews</span>
        </div>
      </div>

      <div class="stat-card revenue-card">
        <div class="stat-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.completedToday }}</h3>
          <p class="stat-label">Completed Today</p>
        </div>
        <div class="stat-trend positive">
          <i class="fas fa-check-circle"></i>
          <span>{{ stats.completionRate }}% rate</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-content">
      <!-- Recent Activities -->
      <div class="activity-panel">
        <div class="panel-header">
          <h3><i class="fas fa-history"></i> Recent Activities</h3>
          <button class="refresh-btn" @click="refreshData" :disabled="isLoading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          </button>
        </div>
        <div class="activity-list">
          <div 
            v-for="(activity, index) in recentActivities" 
            :key="activity.id"
            class="activity-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="activity-icon" :class="activity.type">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
          <div v-if="recentActivities.length === 0" class="no-activities">
            <i class="fas fa-info-circle"></i>
            <p>No recent activities</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-panel">
        <div class="panel-header">
          <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
        </div>
        <div class="actions-grid">
          <div class="action-button" @click="navigateTo('/app/medic/calendar')">
            <div class="action-icon calendar">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <span>Schedule</span>
          </div>
          <div class="action-button" @click="navigateTo('/app/medic/my-patients')">
            <div class="action-icon patients">
              <i class="fas fa-user-plus"></i>
            </div>
            <span>Patients</span>
          </div>
          <div class="action-button" @click="navigateTo('/app/medic/services')">
            <div class="action-icon services">
              <i class="fas fa-stethoscope"></i>
            </div>
            <span>Services</span>
          </div>
          <div class="action-button" @click="navigateTo('/app/medic/packages')">
            <div class="action-icon packages">
              <i class="fas fa-box"></i>
            </div>
            <span>Packages</span>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="schedule-panel">
        <div class="panel-header">
          <h3><i class="fas fa-clock"></i> Today's Schedule</h3>
          <router-link to="/app/medic/calendar" class="view-all-link">
            View All <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        <div class="schedule-list">
          <div 
            v-for="(appointment, index) in todaysSchedule" 
            :key="appointment.id"
            class="schedule-item"
            :class="appointment.status"
            :style="{ animationDelay: `${index * 0.15}s` }"
            @click="openAppointmentDetails(appointment.id)"
          >
            <div class="schedule-time">
              <span class="time">{{ appointment.time }}</span>
            </div>
            <div class="schedule-content">
              <p class="patient-name">{{ appointment.patientName }}</p>
              <p class="service-name">{{ appointment.serviceName }}</p>
            </div>
            <div class="schedule-status" :class="appointment.status">
              <i :class="getStatusIcon(appointment.status)"></i>
            </div>
          </div>
          <div v-if="todaysSchedule.length === 0" class="no-schedule">
            <i class="fas fa-calendar-times"></i>
            <p>No appointments today</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
      </div>

    <!-- Appointment Details Modal -->
    <AppointmentDetailsModal
      v-if="showAppointmentDetailsModal"
      :appointment-id="selectedAppointmentId"
      @close="closeAppointmentDetails"
      @edit="handleEditAppointment"
    />

    <!-- Upcoming Holidays -->
    <div class="holidays-section">
      <UpcomingHolidays :max-display="4" />
    </div>
    </div>
  </template>
  
  <script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import MedicService from '@/services/MedicService';
import AppointmentDetailsModal from '@/components/AppointmentDetailsModal.vue';
import UpcomingHolidays from '@/components/UpcomingHolidays.vue';

const router = useRouter();
  const authStore = useAuthStore();
const toast = useToast();

const isLoading = ref(true);

const stats = reactive({
  totalPatients: 0,
  newPatientsThisMonth: 0,
  todayAppointments: 0,
  nextAppointmentTime: '--:--',
  averageRating: 0,
  totalFeedbacks: 0,
  completedToday: 0,
  completionRate: 0
});

const recentActivities = ref([]);
const todaysSchedule = ref([]);

// Modal state
const showAppointmentDetailsModal = ref(false);
const selectedAppointmentId = ref(null);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const currentTime = ref('');

function updateCurrentTime() {
  currentTime.value = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function navigateTo(path) {
  router.push(path);
}

function getStatusIcon(status) {
  const icons = {
    'scheduled': 'fas fa-clock',
    'completed': 'fas fa-check-circle',
    'cancelled': 'fas fa-times-circle',
    'no-show': 'fas fa-exclamation-triangle'
  };
  return icons[status] || 'fas fa-circle';
}

async function loadDashboardData() {
  isLoading.value = true;
  try {
    // Load all dashboard data in parallel
    const [
      patientsResponse,
      appointmentsResponse,
      feedbackResponse,
      scheduleResponse,
      activitiesResponse
    ] = await Promise.allSettled([
      MedicService.getMyPatients(),
      MedicService.getTodaysAppointments(),
      MedicService.getMyFeedbackSummary(),
      MedicService.getTodaysSchedule(),
      MedicService.getRecentActivities()
    ]);

    // Process patients data
    if (patientsResponse.status === 'fulfilled') {
      stats.totalPatients = patientsResponse.value.data?.length || 0;
      stats.newPatientsThisMonth = patientsResponse.value.data?.filter(p => {
        const patientDate = new Date(p.createdAt);
        const now = new Date();
        return patientDate.getMonth() === now.getMonth() && 
               patientDate.getFullYear() === now.getFullYear();
      }).length || 0;
    }

    // Process appointments data
    if (appointmentsResponse.status === 'fulfilled') {
      const appointments = appointmentsResponse.value.data || [];
      stats.todayAppointments = appointments.length;
      stats.completedToday = appointments.filter(a => a.status === 'COMPLETED').length;
      stats.completionRate = appointments.length > 0 ? 
        Math.round((stats.completedToday / appointments.length) * 100) : 0;
      
      const nextAppt = appointments.find(a => a.status === 'SCHEDULED');
      if (nextAppt) {
        stats.nextAppointmentTime = new Date(nextAppt.scheduledStartTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }

    // Process feedback data
    if (feedbackResponse.status === 'fulfilled') {
      const feedback = feedbackResponse.value.data || {};
      stats.averageRating = feedback.averageRating || 0;
      stats.totalFeedbacks = feedback.totalFeedbacks || 0;
    }

    // Process schedule data
    if (scheduleResponse.status === 'fulfilled') {
      todaysSchedule.value = (scheduleResponse.value.data || []).map(appt => ({
        id: appt.id,
        time: new Date(appt.scheduledStartTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        patientName: appt.patientName || 'Unknown Patient',
        serviceName: appt.serviceName || 'General Consultation',
        status: appt.status?.toLowerCase() || 'scheduled'
      }));
    }

    // Process activities data
    if (activitiesResponse.status === 'fulfilled') {
      recentActivities.value = activitiesResponse.value.data || [];
    }

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    isLoading.value = false;
  }
}

async function refreshData() {
  await loadDashboardData();
  toast.success('Dashboard data refreshed');
}

// Modal handlers
function openAppointmentDetails(appointmentId) {
  selectedAppointmentId.value = appointmentId;
  showAppointmentDetailsModal.value = true;
}

function closeAppointmentDetails() {
  showAppointmentDetailsModal.value = false;
  selectedAppointmentId.value = null;
}

function handleEditAppointment(appointmentDetails) {
  closeAppointmentDetails();
  // Navigate to calendar with edit mode
  router.push('/app/medic/calendar');
  toast.info('Navigate to calendar to edit the appointment');
}

onMounted(() => {
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000); // Update every minute
  loadDashboardData();
});
  </script>
  
  <style scoped>
.medic-dashboard {
  min-height: 100vh;
  background: #ffffff;
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
}

/* Header Section */
.dashboard-header {
  margin-bottom: 2rem;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideInDown 0.8s ease-out;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.doctor-name {
  color: #4299e1;
  animation: pulse 2s infinite;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.doctor-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  animation: float 3s ease-in-out infinite;
}

.status-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-indicator.online {
  background: #48bb78;
  animation: blink 2s infinite;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.patients-card {
  --gradient-start: #4299e1;
  --gradient-end: #3182ce;
}

.appointments-card {
  --gradient-start: #48bb78;
  --gradient-end: #38a169;
}

.feedback-card {
  --gradient-start: #ed8936;
  --gradient-end: #dd6b20;
}

.revenue-card {
  --gradient-start: #9f7aea;
  --gradient-end: #805ad5;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  gap: 0.25rem;
}

.stat-trend.positive {
  color: #48bb78;
}

.stat-trend.neutral {
  color: #718096;
}

.stat-trend i {
  font-size: 1rem;
}

/* Dashboard Content */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.activity-panel,
.quick-actions-panel,
.schedule-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: slideInUp 0.8s ease-out;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
}

.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #5a67d8;
}

/* Activity List */
.activity-list {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  animation: slideInLeft 0.6s ease-out;
}

.activity-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.activity-icon.appointment {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.activity-icon.feedback {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.activity-icon.patient {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.activity-icon.schedule {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 500;
}

.activity-time {
  font-size: 0.8rem;
  color: #718096;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(102, 126, 234, 0.03);
  border: 2px solid transparent;
  animation: slideInUp 0.6s ease-out;
}

.action-button:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-icon.calendar {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.action-icon.patients {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.action-icon.services {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.action-icon.packages {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
}

.action-button span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
}

/* Schedule List */
.schedule-list {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  background: rgba(102, 126, 234, 0.03);
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
  animation: slideInRight 0.6s ease-out;
  cursor: pointer;
}

.schedule-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(-4px);
}

.schedule-item.scheduled {
  border-left-color: #4299e1;
}

.schedule-item.completed {
  border-left-color: #48bb78;
}

.schedule-item.cancelled {
  border-left-color: #f56565;
  opacity: 0.7;
}

.schedule-time {
  min-width: 80px;
}

.schedule-time .time {
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
}

.schedule-content {
  flex: 1;
}

.patient-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
}

.service-name {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
}

.schedule-status {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.schedule-status.scheduled {
  background: rgba(66, 153, 225, 0.1);
  color: #4299e1;
}

.schedule-status.completed {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.schedule-status.cancelled {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

/* Empty States */
.no-activities,
.no-schedule {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.no-activities i,
.no-schedule i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: #667eea;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(102, 126, 234, 0.1);
  border-left: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* Holidays Section */
.holidays-section {
  margin-top: 2rem;
  grid-column: 1 / -1; /* Span across all grid columns */
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Animations */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .quick-actions-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .medic-dashboard {
    padding: 1rem;
  }
  
  .welcome-section {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
  </style>