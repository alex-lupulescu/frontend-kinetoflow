<template>
  <div class="page-container">
    <div class="page-header">
      <h1>My Dashboard</h1>
    </div>

    <div class="welcome-message card">
      <h2>Welcome, {{ authStore.userName || 'Patient' }}!</h2>
      <p>This is your personal dashboard. Here you can find a quick overview of your activities.</p>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-section card appointments-card">
        <h3>Upcoming Appointments</h3>
        <div v-if="isLoadingAppointments" class="loading-indicator small-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading appointments...
        </div>
        <div v-else-if="loadAppointmentsError" class="error-message small-error">
          <i class="fas fa-exclamation-triangle"></i> {{ loadAppointmentsError }}
        </div>
        <div v-else-if="upcomingAppointments.length === 0" class="no-data-message small-no-data">
          You have no upcoming appointments.
        </div>
        <ul v-else class="appointment-list">
          <li v-for="appt in upcomingAppointments" :key="appt.appointmentId" class="appointment-item">
            <div class="appointment-date">{{ formatDateTime(appt.scheduledStartTime, 'date') }}</div>
            <div class="appointment-time">{{ formatDateTime(appt.scheduledStartTime, 'time') }}</div>
            <div class="appointment-details">
              <span class="service-name">{{ appt.serviceName }}</span>
              with <span class="medic-name">{{ appt.medicName }}</span>
            </div>
            <span class="status-badge" :class="'status-' + appt.status.toLowerCase()">{{ appt.status }}</span>
          </li>
        </ul>
        <router-link v-if="!isLoadingAppointments && !loadAppointmentsError && upcomingAppointments.length > 0" :to="{ name: 'user-appointments' }" class="btn btn-sm btn-outline-primary mt-2">View All Appointments</router-link>
      </div>

      <div class="dashboard-section card plan-card">
        <h3>My Current Plan</h3>
        <div v-if="isLoadingPlan" class="loading-indicator small-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading plan details...
        </div>
        <div v-else-if="loadPlanError" class="error-message small-error">
          <i class="fas fa-exclamation-triangle"></i> {{ loadPlanError }}
        </div>
        <div v-else-if="!currentPlan" class="no-data-message small-no-data">
          You do not have an active plan assigned currently.
        </div>
        <div v-else class="plan-details-content">
          <h4>{{ currentPlan.planName }} ({{ currentPlan.planType }})</h4>
          <p class="assigned-date">Assigned on: {{ formatDateTime(currentPlan.assignmentDate, 'date') }}</p>
          <div class="progress-section" v-if="currentPlan.totalSessions > 0">
            <p>Session Progress: {{ currentPlan.completedSessions }} / {{ currentPlan.totalSessions }} completed</p>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: (currentPlan.completedSessions / currentPlan.totalSessions * 100) + '%' }"></div>
            </div>
          </div>
          <p v-else>This plan does not have session-based services.</p>
          <p>Contains {{ currentPlan.totalServiceItemsCount }} type(s) of service(s).</p>
          <router-link :to="{ name: 'user-my-plan' }" class="btn btn-sm btn-outline-primary mt-2">View Plan Details</router-link>
        </div>
      </div>

      <div class="dashboard-section card quick-links-card">
        <h3>Quick Links</h3>
        <ul class="quick-links-list">
          <li><router-link :to="{ name: 'user-appointments' }">My Appointments</router-link></li>
          <li><router-link :to="{ name: 'user-my-plan' }">My Plan Details</router-link></li>
          <!-- <li><router-link :to="{ name: 'user-billing' }">Billing & Payments</router-link></li> -->
          <li><router-link :to="{ name: 'my-account' }">My Account Settings</router-link></li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { RouterLink } from 'vue-router';
import { onMounted, ref } from 'vue';
import UserService from '@/services/UserService';
// Toast not used directly in this version of the dashboard logic, but keep if other parts might need it
// import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
// const toast = useToast(); // To be used if direct user feedback for dashboard loading is needed

// Upcoming Appointments State
const upcomingAppointments = ref([]);
const isLoadingAppointments = ref(true);
const loadAppointmentsError = ref('');

// Current Plan State
const currentPlan = ref(null);
const isLoadingPlan = ref(true);
const loadPlanError = ref('');

const fetchUpcomingAppointments = async () => {
  isLoadingAppointments.value = true;
  loadAppointmentsError.value = '';
  try {
    const response = await UserService.getUpcomingAppointmentsDashboard(3);
    upcomingAppointments.value = response.data;
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    loadAppointmentsError.value = error.response?.data?.message || 'Failed to load upcoming appointments.';
    // Consider if a toast is needed here or if the inline error message is sufficient
  } finally {
    isLoadingAppointments.value = false;
  }
};

const fetchCurrentPlan = async () => {
  isLoadingPlan.value = true;
  loadPlanError.value = '';
  try {
    const response = await UserService.getCurrentPlanDashboard();
    if (response.status === 204) { // No active plan found
        currentPlan.value = null;
    } else {
        currentPlan.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching current plan:", error);
    if (error.response && error.response.status === 404) { // Or 204 if API returns that for no plan
        currentPlan.value = null; // Handle case where API might 404 if no plan
        loadPlanError.value = 'No active plan found.'; // More user-friendly message
    } else {
        loadPlanError.value = error.response?.data?.message || 'Failed to load current plan details.';
    }
    // Consider if a toast is needed here
  } finally {
    isLoadingPlan.value = false;
  }
};

const formatDateTime = (dateTimeString, part) => {
  if (!dateTimeString) return 'N/A';
  try {
    const date = new Date(dateTimeString);
    if (part === 'date') {
      return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    }
    if (part === 'time') {
      return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
    }
    return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  } catch (e) {
    return dateTimeString; 
  }
};

onMounted(async () => {
  await Promise.all([
    fetchUpcomingAppointments(),
    fetchCurrentPlan()
  ]);
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; 
}

.page-header h1 {
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.card {
  background-color: #fff;
  padding: 1.5rem 2rem;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
}

.welcome-message {
  /* background-color: var(--primary-color-light, #e7f3fe); */
  background-image: linear-gradient(to right, var(--primary-color-light), var(--secondary-color-light));
  border-left: 5px solid var(--primary-color, #007bff);
  padding: 1.5rem;
}

.welcome-message h2 {
  margin-top: 0;
  color: var(--primary-color-dark, #0056b3);
  font-size: 1.6rem;
}

.welcome-message p {
  font-size: 1.1rem;
  color: var(--text-color);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
}

.dashboard-section h3 {
  color: var(--dark-color);
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.placeholder-text {
  color: #777;
  font-style: italic;
  margin-bottom: 1rem;
}

.quick-links-list {
  list-style: none;
  padding: 0;
  margin-bottom: 1rem;
}

.quick-links-list li {
  margin-bottom: 0.5rem;
}

.quick-links-list li a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

.quick-links-list li a:hover {
  text-decoration: underline;
  color: var(--primary-color-dark);
}

/* Styles for appointment list */
.appointment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* Allows list to take space before button */
}

.appointment-item {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 0.75rem;
}

.appointment-item:last-child {
  border-bottom: none;
}

.appointment-date {
  font-weight: bold;
  font-size: 0.9rem;
  color: var(--dark-color);
  white-space: nowrap;
}

.appointment-time {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-color);
  background-color: #f8f9fa;
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-small);
}

.appointment-details {
  font-size: 0.95rem;
}

.service-name {
  font-weight: 600;
  color: var(--primary-color-dark);
}

.medic-name {
  color: var(--text-muted-color, #6c757d);
}

.status-badge {
  padding: 0.25em 0.6em;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--border-radius-small);
  color: white;
  white-space: nowrap;
  text-transform: capitalize;
}
.status-scheduled { background-color: var(--info-color, #17a2b8); }
.status-confirmed { background-color: var(--primary-color, #007bff); }
.status-completed { background-color: var(--success-color, #28a745); }
.status-cancelled_by_medic, .status-cancelled_by_patient, .status-cancelled_by_system {
  background-color: var(--danger-color, #dc3545);
}
.status-no_show { background-color: var(--warning-color, #ffc107); color: #212529;}

/* Styles for Plan Details */
.plan-details-content {
  flex-grow: 1; /* Allows content to take space before button */
}
.plan-details-content h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--primary-color-dark);
  font-size: 1.1rem;
}
.assigned-date {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 1rem;
}
.progress-section p {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}
.progress-bar-container {
  width: 100%;
  background-color: #e9ecef;
  border-radius: var(--border-radius-small);
  height: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.progress-bar {
  height: 100%;
  background-color: var(--success-color);
  border-radius: var(--border-radius-small);
  transition: width 0.5s ease-in-out;
}


/* Placeholder for loading/error/no-data inside section */
.small-loading,
.small-error,
.small-no-data {
  font-size: 0.9rem;
  padding: 1rem 0;
  text-align: left; 
  color: #6c757d;
}
.small-loading i { margin-right: 0.5rem; }
.small-error i { margin-right: 0.5rem; color: var(--danger-color); }
.small-no-data { text-align: center; font-style: italic;}

.mt-2 { margin-top: 1rem; /* For buttons below list/content */ }

/* Adjust button to be at the bottom of the card */
.dashboard-section .btn {
  margin-top: auto; /* Pushes button to the bottom if section is flex column */
  align-self: flex-start; /* Aligns button to the left */
}

</style> 