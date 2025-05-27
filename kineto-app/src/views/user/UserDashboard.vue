<template>
  <div class="user-dashboard-page">
    <header class="dashboard-header">
      <h1>Welcome, {{ authStore.userName || 'Patient' }}!</h1>
      <p class="text-muted">Here's a quick overview of your activities.</p>
    </header>

    <section class="quick-links-header-bar">
      <div class="quick-links-content">
        <ul class="content-list quick-links-list modern">
          <li><router-link :to="{ name: 'user-appointments' }"><i class="fas fa-calendar-alt"></i><span>My Appointments</span></router-link></li>
          <li><router-link :to="{ name: 'user-my-plan' }"><i class="fas fa-file-invoice"></i><span>My Plan Details</span></router-link></li>
          <li><router-link :to="{ name: 'my-account' }"><i class="fas fa-user-cog"></i><span>My Account Settings</span></router-link></li>
        </ul>
      </div>
    </section>

    <div class="dashboard-grid">
      <section class="dashboard-card appointments-card">
        <div class="card-header">
          <i class="fas fa-calendar-check card-icon"></i>
          <h2>Upcoming Appointments</h2>
        </div>
        <div class="card-content">
          <div v-if="isLoadingAppointments" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i> Loading appointments...
          </div>
          <div v-else-if="loadAppointmentsError" class="error-state">
            <i class="fas fa-exclamation-triangle"></i> {{ loadAppointmentsError }}
          </div>
          <div v-else-if="upcomingAppointments.length === 0" class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <p>You have no upcoming appointments.</p>
          </div>
          <ul v-else class="content-list appointment-list">
            <li v-for="appt in upcomingAppointments" :key="appt.appointmentId" class="appointment-item" @click="openAppointmentModal(appt)">
              <div class="appointment-info">
                <strong class="service-name">{{ appt.serviceName }}</strong>
                <span class="medic-name">with {{ appt.medicName }}</span>
              </div>
              <div class="appointment-datetime">
                <span class="date"><i class="far fa-calendar-alt"></i> {{ formatDateTime(appt.scheduledStartTime, 'date') }}</span>
                <span class="time"><i class="far fa-clock"></i> {{ formatDateTime(appt.scheduledStartTime, 'time') }}</span>
              </div>
            </li>
          </ul>
          <div class="card-footer" v-if="!isLoadingAppointments && !loadAppointmentsError && upcomingAppointments.length > 0">
            <router-link :to="{ name: 'user-appointments' }" class="btn btn-secondary btn-sm">View All Appointments</router-link>
          </div>
        </div>
      </section>

      <section class="dashboard-card plan-card" @click="openPlanModal" :class="{ 'clickable': currentPlan && !isLoadingPlan && !loadPlanError }">
        <div class="card-header">
          <i class="fas fa-file-alt card-icon"></i>
          <h2>My Current Plan</h2>
        </div>
        <div class="card-content">
          <div v-if="isLoadingPlan" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i> Loading plan details...
          </div>
          <div v-else-if="loadPlanError && currentPlan !== null" class="error-state">
            <i class="fas fa-exclamation-triangle"></i> {{ loadPlanError }}
          </div>
          <div v-else-if="!currentPlan" class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>You do not have an active plan.</p>
          </div>
          <div v-else class="plan-details-content">
            <h4 class="plan-title">{{ currentPlan.planName }} <span class="plan-type-badge">({{ currentPlan.planType }})</span></h4>
            <p class="assigned-date meta-info"><i class="far fa-calendar-check"></i> Assigned: {{ formatDateTime(currentPlan.assignmentDate, 'date') }}</p>
            
            <div class="progress-section" v-if="currentPlan.totalSessions > 0">
              <div class="progress-info">
                <span>Session Progress</span>
                <span>{{ currentPlan.completedSessions }} / {{ currentPlan.totalSessions }}</span>
              </div>
              <div class="progress-bar-container modern">
                <div class="progress-bar modern" :style="{ width: calculateProgress(currentPlan.totalSessions, currentPlan.completedSessions) + '%' }"></div>
              </div>
            </div>
            <p v-else class="meta-info">This plan does not have session-based services.</p>
            
            <p class="meta-info services-count"><i class="fas fa-concierge-bell"></i> Includes {{ currentPlan.totalServiceItemsCount }} type(s) of service(s).</p>
          </div>
          <div class="card-footer" v-if="!isLoadingPlan && !loadPlanError && currentPlan">
            <router-link :to="{ name: 'user-my-plan' }" @click.stop class="btn btn-secondary btn-sm">View Plan Details</router-link>
          </div>
        </div>
      </section>
    </div>

    <!-- Appointment Details Modal -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeAppointmentModal">
      <div class="modal-content futuristic">
        <button class="close-button" @click="closeAppointmentModal">&times;</button>
        <h3 class="modal-title">Appointment Details</h3>
        <div v-if="selectedAppointment" class="modal-body">
          <div class="detail-item">
            <span class="detail-label"><i class="fas fa-concierge-bell"></i> Service:</span>
            <span class="detail-value">{{ selectedAppointment.serviceName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="fas fa-user-md"></i> Medic:</span>
            <span class="detail-value">{{ selectedAppointment.medicName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="far fa-calendar-alt"></i> Date:</span>
            <span class="detail-value">{{ formatDateTime(selectedAppointment.scheduledStartTime, 'date') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="far fa-clock"></i> Time:</span>
            <span class="detail-value" v-if="selectedAppointment.scheduledEndTime">
              {{ formatDateTime(selectedAppointment.scheduledStartTime, 'time') }} - {{ formatDateTime(selectedAppointment.scheduledEndTime, 'time') }}
            </span>
            <span class="detail-value" v-else>
              {{ formatDateTime(selectedAppointment.scheduledStartTime, 'time') }}
            </span>
          </div>
          <!-- Add more details here as needed -->
          <div class="detail-item" v-if="selectedAppointment.status">
            <span class="detail-label"><i class="fas fa-info-circle"></i> Status:</span>
            <span :class="['detail-value', 'status-badge-modal', `status-${selectedAppointment.status.toLowerCase().replace(/ /g, '_')}`]">{{ selectedAppointment.status }}</span>
          </div>
        </div>
        <div v-else class="loading-state-modal">
          <i class="fas fa-spinner fa-spin"></i> Loading details...
        </div>
      </div>
    </div>

    <!-- Current Plan Details Modal -->
    <div v-if="isPlanModalVisible" class="modal-overlay" @click.self="closePlanModal">
      <div class="modal-content futuristic plan-details-modal-content">
        <button class="close-button" @click="closePlanModal">&times;</button>
        <h3 class="modal-title" v-if="!isLoadingPlanDetails && selectedPlanDetails">{{ selectedPlanDetails.planName }} - Details</h3>
        <h3 class="modal-title" v-else-if="isLoadingPlanDetails">Loading Plan...</h3>
        <h3 class="modal-title" v-else-if="loadPlanDetailsError">Error</h3>

        <div v-if="isLoadingPlanDetails" class="loading-state-modal">
          <i class="fas fa-spinner fa-spin"></i> Loading plan details...
        </div>
        <div v-else-if="loadPlanDetailsError" class="error-state-modal">
          <i class="fas fa-exclamation-triangle"></i> {{ loadPlanDetailsError }}
        </div>
        <div v-else-if="selectedPlanDetails" class="modal-body">
          <div class="detail-item">
            <span class="detail-label"><i class="fas fa-info-circle"></i> Type:</span>
            <span class="detail-value">{{ selectedPlanDetails.planType }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="far fa-calendar-alt"></i> Assigned:</span>
            <span class="detail-value">{{ formatDateTime(selectedPlanDetails.assignmentDate, 'date') }}</span>
          </div>
          <div v-if="selectedPlanDetails.expiryDate" class="detail-item">
            <span class="detail-label"><i class="far fa-calendar-times"></i> Expires:</span>
            <span class="detail-value">{{ formatDateTime(selectedPlanDetails.expiryDate, 'date') }}</span>
          </div>

          <div class="modal-section financial-summary">
            <h4><i class="fas fa-coins"></i> Financial Summary</h4>
            <div class="detail-item">
              <span class="detail-label">Total Cost:</span>
              <span class="detail-value">{{ formatCurrency(selectedPlanDetails.totalPlanCost) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Paid:</span>
              <span class="detail-value">{{ formatCurrency(selectedPlanDetails.paidAmount) }}</span>
            </div>
            <div class="detail-item due-amount-item">
              <span class="detail-label">Due:</span>
              <span class="detail-value">{{ formatCurrency(selectedPlanDetails.dueAmount) }}
                <span v-if="selectedPlanDetails.planPaymentStatus" :class="['status-badge-modal', `status-payment-${selectedPlanDetails.planPaymentStatus.toLowerCase().replace(/_/g, '-')}`]" style="margin-left: 8px; font-size: 0.8em;">
                  {{ selectedPlanDetails.planPaymentStatus.replace(/_/g, ' ') }}
                </span>
              </span>
            </div>
          </div>

          <div v-if="(currentPlan && currentPlan.totalSessions > 0) || (selectedPlanDetails && selectedPlanDetails.serviceItems && selectedPlanDetails.serviceItems.some(item => item.totalQuantity > 0))" class="modal-section progress-details">
            <h4><i class="fas fa-tasks"></i> Session Progress</h4>

            <!-- Overall Plan Progress (from currentPlan summary) -->
            <div v-if="currentPlan && currentPlan.totalSessions > 0">
                <div class="detail-item">
                  <span class="detail-label">Overall Plan Progress:</span>
                  <span class="detail-value">{{ currentPlan.completedSessions }} / {{ currentPlan.totalSessions }} sessions</span>
                </div>
                <div class="progress-bar-container modern modal-progress">
                  <div class="progress-bar modern" :style="{ width: calculateProgress(currentPlan.totalSessions, currentPlan.completedSessions) + '%' }"></div>
                </div>
            </div>
             <p v-else-if="currentPlan && !(currentPlan.totalSessions > 0) && selectedPlanDetails && selectedPlanDetails.serviceItems && selectedPlanDetails.serviceItems.every(item => !(item.totalQuantity > 0))" class="text-muted text-center small" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                This plan does not have overall session tracking.
            </p>

            <!-- Per-item progress (from selectedPlanDetails - detailed fetch) -->
            <div v-if="selectedPlanDetails && selectedPlanDetails.serviceItems && selectedPlanDetails.serviceItems.some(item => item.totalQuantity > 0)" :style="{ marginTop: (currentPlan && currentPlan.totalSessions > 0) ? '1.5rem' : '0' }">
                <h5 v-if="currentPlan && currentPlan.totalSessions > 0" class="progress-subtitle">Individual Service Item Progress:</h5>
                <div v-for="item in selectedPlanDetails.serviceItems.filter(si => si.totalQuantity > 0)" :key="`progress-${item.serviceItemId || item.serviceName}`" class="service-item-progress">
                    <div class="detail-item">
                        <span class="detail-label">{{ item.serviceName }}:</span>
                        <span class="detail-value">{{ item.totalQuantity - item.remainingQuantity }} / {{ item.totalQuantity }} used</span>
                    </div>
                    <div class="progress-bar-container modern modal-progress small-progress">
                        <div class="progress-bar modern" :style="{ width: calculateProgress(item.totalQuantity, (item.totalQuantity - item.remainingQuantity)) + '%' }"></div>
                    </div>
                </div>
            </div>
            <p v-else-if="selectedPlanDetails && selectedPlanDetails.serviceItems && selectedPlanDetails.serviceItems.length > 0 && selectedPlanDetails.serviceItems.every(item => !(item.totalQuantity > 0)) && !(currentPlan && currentPlan.totalSessions > 0)" class="text-muted text-center small" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                No service items in this plan have session quantity tracking.
            </p>
            <p v-else-if="(!selectedPlanDetails || !selectedPlanDetails.serviceItems || selectedPlanDetails.serviceItems.length === 0) && !(currentPlan && currentPlan.totalSessions > 0)" class="text-muted text-center small" style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
                No service items found for this plan to display progress.
            </p>
          </div>

          <div v-if="selectedPlanDetails.notes" class="modal-section notes-details">
            <h4><i class="far fa-sticky-note"></i> Notes</h4>
            <p class="notes-text">{{ selectedPlanDetails.notes }}</p>
          </div>
          
          <div class="modal-section service-items-details" v-if="selectedPlanDetails.serviceItems && selectedPlanDetails.serviceItems.length > 0">
            <h4><i class="fas fa-concierge-bell"></i> Service Items ({{selectedPlanDetails.serviceItems.length}})</h4>
            <ul class="service-items-list-modal">
              <li v-for="item in selectedPlanDetails.serviceItems" :key="item.serviceItemId || item.serviceName" class="service-item-modal">
                <div class="item-name">
                  <strong>{{ item.serviceName }}</strong>
                  <span v-if="item.serviceDurationMinutes"> ({{ item.serviceDurationMinutes }} min)</span>
                  <span :class="['item-status-pill', item.isItemActive === false ? 'item-inactive' : 'item-active']">{{ item.isItemActive === false ? 'Disabled' : 'Enabled' }}</span>
                </div>
                <div class="item-details">
                   <span v-if="item.totalQuantity > 0">Sessions: {{ item.remainingQuantity }} / {{ item.totalQuantity }} remaining</span>
                   <span v-else>N/A Sessions</span>
                  <small v-if="item.pricePerUnit !== null">Price/session: {{ formatCurrency(item.pricePerUnit) }}</small>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { RouterLink, useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import UserService from '@/services/UserService';
// Toast not used directly in this version of the dashboard logic, but keep if other parts might need it
// import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
// const toast = useToast(); // To be used if direct user feedback for dashboard loading is needed

const router = useRouter(); // Initialize router

// Upcoming Appointments State
const upcomingAppointments = ref([]);
const isLoadingAppointments = ref(true);
const loadAppointmentsError = ref('');

// Current Plan State
const currentPlan = ref(null);
const isLoadingPlan = ref(true);
const loadPlanError = ref('');

// Modal State
const isModalVisible = ref(false);
const selectedAppointment = ref(null);
const isPlanModalVisible = ref(false); 
const selectedPlanDetails = ref(null); // To store fully fetched plan details
const isLoadingPlanDetails = ref(false); // Loading state for plan modal
const loadPlanDetailsError = ref(''); // Error state for plan modal

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
    if (response.status === 204 || !response.data) { // Handle no content or empty data
        currentPlan.value = null;
    } else {
        currentPlan.value = response.data;
    }
  } catch (error) {
    console.error("Error fetching current plan:", error);
    if (error.response && (error.response.status === 404 || error.response.status === 204)) { 
        currentPlan.value = null; 
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
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    }
    if (part === 'time') {
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    }
    return date.toLocaleString('en-GB'); // Fallback
  } catch (e) {
    // console.error("Error formatting date:", e, dateTimeString);
    return dateTimeString; 
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const calculateProgress = (total, completed) => {
  const numTotal = parseFloat(total);
  const numCompleted = parseFloat(completed);

  if (isNaN(numTotal) || isNaN(numCompleted) || numTotal === 0) {
    return 0;
  }
  return (numCompleted / numTotal) * 100;
};

const openAppointmentModal = (appointment) => {
  selectedAppointment.value = appointment;
  isModalVisible.value = true;
};

const closeAppointmentModal = () => {
  isModalVisible.value = false;
  selectedAppointment.value = null; // Clear selected appointment
};

const openPlanModal = async () => {
  if (currentPlan.value && !isLoadingPlan.value && !loadPlanError.value) {
    isPlanModalVisible.value = true;
    isLoadingPlanDetails.value = true;
    loadPlanDetailsError.value = '';
    selectedPlanDetails.value = null; // Clear previous details

    try {
      // Assuming currentPlan.value has an ID like patientPlanId or id
      // Adjust currentPlan.value.patientPlanId if the ID field is named differently
      const planIdToFetch = currentPlan.value.patientPlanId || currentPlan.value.id;
      if (!planIdToFetch) {
        throw new Error("Current plan ID is missing, cannot fetch details.");
      }
      const response = await UserService.getMyPlanDetails(planIdToFetch);
      selectedPlanDetails.value = response.data; 
    } catch (error) {
      console.error("Error fetching plan details for modal:", error);
      loadPlanDetailsError.value = error.response?.data?.message || 'Failed to load plan details.';
      // Optionally, could fall back to showing currentPlan.value if fetch fails but currentPlan exists
      // selectedPlanDetails.value = currentPlan.value; // Fallback, if desired
    } finally {
      isLoadingPlanDetails.value = false;
    }
  } else if (currentPlan.value) {
    // If we are not fetching new details (e.g. already loaded or an error in initial card load)
    // but the modal is requested, show the existing currentPlan data as fallback.
    // This part might be redundant if the primary goal is always to fresh-fetch.
    selectedPlanDetails.value = currentPlan.value; 
    isPlanModalVisible.value = true;
  }
};

const closePlanModal = () => {
  isPlanModalVisible.value = false;
  // Consider clearing selectedPlanDetails and error states if modal is closed
  // selectedPlanDetails.value = null;
  // loadPlanDetailsError.value = ''; 
};

const navigateToPlanDetails = () => {
  if (currentPlan.value && !isLoadingPlan.value && !loadPlanError.value) {
    router.push({ name: 'user-my-plan' });
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
/* Foundational Styles for a simpler, light theme */
.user-dashboard-page {
  /* Light Theme Variables */
  --primary-color: #007bff; /* Standard Blue */
  --secondary-color: #6c757d; /* Standard Grey */
  --accent-color: #007bff; /* Using primary as accent for now */
  --background-light: #ffffff;
  --text-dark: #212529;      /* Dark grey for text */
  --text-muted-light: #6c757d; /* Muted grey for secondary text */
  --border-color-light: #dee2e6; /* Light border color */
  --card-background-light: #ffffff;
  --card-shadow-light: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); /* Subtle shadow */
  --font-main: 'Roboto', sans-serif; /* Keep Roboto */

  padding: 2.5rem;
  background-color: var(--background-light); /* Solid white or very light grey background */
  color: var(--text-dark);
  font-family: var(--font-main);
  min-height: 100vh;
  overflow-x: hidden;
}

.dashboard-header {
  text-align: left;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-dark); /* Black text */
  animation: none;
  text-shadow: none;
  margin: 0 0 0.2rem 0;
}

.dashboard-header .text-muted {
  font-size: 1rem;
  color: var(--text-muted-light); /* Muted grey text */
  opacity: 1; /* No need for opacity if color is set */
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
}

/* Card Styling for Light Theme */
.dashboard-card {
  background-color: var(--card-background-light);
  border-radius: 12px; /* Softened radius */
  box-shadow: var(--card-shadow-light);
  /* backdrop-filter: none; */ /* Remove blur/glassmorphism */
  /* -webkit-backdrop-filter: none; */
  border: 1px solid var(--border-color-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Standard transition */
  position: relative;
}

.dashboard-card::before { /* Remove ::before pseudo-element glow border */
    content: none;
}

.dashboard-card:hover {
  transform: translateY(-5px); /* Simpler hover transform */
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1); /* Slightly more pronounced shadow on hover */
  /* border-color: var(--primary-color); */ /* Optional: accent border on hover */
  /* animation: none; */ /* Remove borderGlow animation */
}
/* .dashboard-card:hover::before - remove this rule */


.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem; /* Adjusted padding */
  border-bottom: 1px solid var(--border-color-light);
  background: transparent; /* No special background for header */
}

.card-header .card-icon {
  font-size: 1.5rem; /* Adjusted icon size */
  color: var(--primary-color); /* Primary color for icons */
  animation: none; /* Remove pulseGlow animation */
  text-shadow: none; /* Remove text shadow */
}

.card-header h2 {
  font-size: 1.25rem; /* Adjusted title size */
  font-weight: 600;
  margin: 0;
  color: var(--text-dark);
}

.card-content {
  padding: 1.5rem; /* Adjusted padding */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--text-muted-light);
  flex-grow: 1;
  font-size: 1rem;
}

.loading-state i, .error-state i, .empty-state i {
  font-size: 2.5rem; /* Adjusted icon size */
  margin-bottom: 1rem;
  text-shadow: none; /* Remove text shadow */
  animation: none; /* Remove pulseGlow animations */
  /* Color will be inherited or set specifically if needed */
}
.loading-state i { color: var(--primary-color); }
.error-state i { color: #dc3545; /* Standard Bootstrap danger */ }
.empty-state i { color: var(--secondary-color); }

.error-state {
  color: #dc3545; /* Standard Bootstrap danger */
}

.content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.appointment-list .appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.15rem; /* Adjusted padding */
  border-bottom: 1px solid var(--border-color-light); /* Lighter solid border */
  gap: 1rem;
  transition: background-color 0.2s ease; /* Simpler transition */
}
.appointment-list .appointment-item:hover {
    background-color: #f8f9fa; /* Light grey hover background */
    transform: none; /* No x-transform on hover */
}

.appointment-list .appointment-item:last-child {
  border-bottom: none;
}

.appointment-info .service-name {
  font-weight: 600;
  color: var(--text-dark);
  display: block;
  font-size: 1rem; /* Adjusted size */
}

.appointment-info .medic-name {
  font-size: 0.9rem;
  color: var(--text-muted-light);
  opacity: 1;
}

.appointment-datetime {
  text-align: right;
  font-size: 0.9rem;
  color: var(--text-muted-light);
  white-space: nowrap;
}
.appointment-datetime .date,
.appointment-datetime .time {
 display: block;
 font-weight: normal; /* Normal weight */
 opacity: 1;
}
.appointment-datetime i {
  margin-right: 0.4rem;
  color: var(--secondary-color); /* Secondary color for icons */
  opacity: 1;
  transition: none;
}
/* .appointment-list .appointment-item:hover .appointment-datetime i - remove this hover effect */

.card-footer {
  padding: 1.25rem 1.5rem; /* Adjusted padding */
  background-color: #f8f9fa; /* Light grey footer background */
  border-top: 1px solid var(--border-color-light);
  text-align: right;
  margin-top: auto;
}

.btn-secondary {
  background: var(--primary-color);
  color: #ffffff;
  border: 1px solid var(--primary-color);
  font-weight: 500; /* Normal weight */
  padding: 0.5rem 1rem; /* Standard padding */
  border-radius: 0.25rem; /* Standard Bootstrap radius */
  transition: background-color 0.2s ease, border-color 0.2s ease;
  text-transform: none; /* No uppercase */
  letter-spacing: normal;
  position: relative;
  overflow: hidden; /* Keep for potential future effects, but shine is removed */
}
.btn-secondary::before { /* Remove shine effect */
  content: none;
}

.btn-secondary:hover {
  background-color: #0056b3; /* Darker blue on hover */
  border-color: #0056b3;
  color: #ffffff;
  box-shadow: none; /* Remove glow shadow */
  transform: none; /* No y-transform */
}
/* .btn-secondary:hover::before - remove this rule */
.btn-secondary:active {
    transform: none;
    box-shadow: none;
    background-color: #004085; /* Even darker on active */
    border-color: #00376e;
}


/* Plan Card Specific Styles - Light Theme */
.plan-card .plan-details-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* Adjusted gap */
}

.plan-card .plan-title {
  font-size: 1.1rem; /* Adjusted size */
  font-weight: 600;
  color: var(--text-dark);
  margin:0;
}
.plan-card .plan-type-badge {
  font-size: 0.8rem;
  font-weight: normal;
  color: var(--text-muted-light);
  background-color: #e9ecef; /* Light grey badge background */
  padding: 0.25em 0.5em;
  border-radius: 0.2rem;
  border: 1px solid #ced4da; /* Light grey border for badge */
}

.plan-card .meta-info {
  font-size: 0.9rem;
  color: var(--text-muted-light);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.plan-card .meta-info i {
  color: var(--secondary-color);
  opacity: 1;
}

.progress-section {
  margin-top: 0.75rem; /* Adjusted margin */
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem; /* Adjusted size */
  color: var(--text-muted-light);
  margin-bottom: 0.4rem;
}

.progress-bar-container.modern {
  width: 100%;
  background-color: #e9ecef; /* Light grey track */
  border-radius: 0.25rem; /* Standard radius */
  height: 12px; /* Adjusted height */
  overflow: hidden;
  border: 1px solid #ced4da; /* Light grey border */
  position: relative;
}
.progress-bar-container.modern::after { /* Remove inner shine */
    content: none;
}


.progress-bar.modern {
  height: 100%;
  /* Standard blue fill, can be var(--accent-color) or var(--primary-color) */
  background: linear-gradient(90deg, var(--primary-color) 0%, #0056b3 100%); /* Simple gradient */
  border-radius: 0.2rem; /* Match container rounding */
  transition: width 0.6s ease; /* Standard transition */
  box-shadow: none; /* Remove glow shadow */
  position: relative;
  overflow: hidden;
}

.progress-bar.modern::before { /* Remove animated shine */
  content: none;
}
/* Remove shine visibility rules */

/* Quick Links Header Bar Styles - Light Theme */
.quick-links-header-bar {
  margin-bottom: 2.5rem; /* Adjusted margin */
  padding: 0.75rem 0;
  background: var(--card-background-light); /* White background, same as cards */
  border-radius: 8px; /* Softer radius */
  box-shadow: var(--card-shadow-light); /* Same shadow as cards */
  border: 1px solid var(--border-color-light); /* Same border as cards */
  position: relative;
}

.quick-links-header-bar::before { /* Remove top highlight */
    content: none;
}

.quick-links-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quick-links-list.modern {
  display: flex;
  gap: 1rem; /* Adjusted gap */
  padding: 0.25rem 0;
  margin: 0;
  list-style: none;
}

.quick-links-list.modern li a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.6rem 1rem;
  color: var(--text-dark); /* Dark text */
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease, background-color 0.2s ease;
  font-size: 0.85rem;
  border-radius: 6px;
  min-width: 100px;
  text-align: center;
}

.quick-links-list.modern li a:hover {
  color: var(--primary-color); /* Primary color text on hover */
  background-color: #e9ecef; /* Light grey background on hover */
  transform: none;
  box-shadow: none;
  letter-spacing: normal;
}

.quick-links-list.modern li a i {
  color: var(--primary-color); /* Primary color for icons */
  font-size: 1.5rem;
  width: auto;
  text-align: center;
  transition: transform 0.2s ease;
  margin-bottom: 0.15rem;
  text-shadow: none; /* Remove icon glow */
}

.quick-links-list.modern li a:hover i {
  transform: scale(1.05); /* Slight scale on hover */
  text-shadow: none;
}

.quick-links-list.modern li a span {
  display: block;
  line-height: 1.3;
}

/* Modal Styles - Light Theme */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Standard dark overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(3px); /* Subtle blur for light theme */
  -webkit-backdrop-filter: blur(3px);
}

.modal-content.futuristic, /* Keep .futuristic for now if modals are shared, or create new modal classes */
.modal-content { /* General modal style for light theme */
  background-color: var(--background-light); /* White modal background */
  padding: 2rem; /* Adjusted padding */
  border-radius: 8px; /* Softer radius */
  box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.1); /* Standard modal shadow */
  border: 1px solid #ccc; /* Slightly darker border for modals */
  width: 90%;
  max-width: 550px; /* Adjusted max width */
  position: relative;
  color: var(--text-dark); /* Dark text for modal content */
  overflow-y: auto;
  max-height: 90vh; /* Adjusted max height */
}

.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-muted-light); /* Grey close button */
  font-size: 1.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;
  line-height: 1;
}

.close-button:hover {
  color: #dc3545; /* Red on hover for close */
  transform: none;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-shadow: none; /* Remove text shadow */
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Adjusted gap */
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color-light); /* Light dashed separator */
  font-size: 0.9rem;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500; /* Normal weight for labels */
  color: var(--text-muted-light); /* Muted grey for labels */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  width: 110px; /* Adjusted width */
}
.detail-label i {
  color: var(--primary-color); /* Primary color for icons */
  opacity: 1;
  font-size: 1em;
  margin-right: 0;
}

.detail-value {
  font-weight: normal;
  color: var(--text-dark);
  word-break: break-word;
  flex-grow: 1;
}

.loading-state-modal {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--text-muted-light);
}
.loading-state-modal i {
    font-size: 1.8rem;
    color: var(--primary-color);
    margin-bottom: 0.8rem;
    animation: none; /* Removed pulseGlow as it's not defined in light theme */
    /* Consider adding a standard spin animation if desired: */
    /* animation: fa-spin 2s infinite linear; */
}
.error-state-modal { /* Added for plan modal error */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #dc3545;
}
.error-state-modal i {
    font-size: 1.8rem;
    margin-bottom: 0.8rem;
}

/* Status Badge for Modal - Light Theme */
.status-badge-modal {
  padding: 0.3em 0.6em; /* Adjusted padding */
  font-size: 0.75em; /* Sleeker badge */
  font-weight: 500;
  border-radius: 0.2rem; /* Standard radius */
  white-space: nowrap;
  text-transform: capitalize;
  border: 1px solid transparent;
  line-height: 1.2;
  display: inline-block;
  color: #fff; /* Default white text for badges */
}

/* Remove text shadow from badges */

.status-badge-modal.status-scheduled,
.status-badge-modal.status-payment-partially-paid { /* Example for a yellow/warning badge */
  background-color: #ffc107; /* Bootstrap warning */
  border-color: #ffc107;
  color: var(--text-dark); /* Dark text for light yellow */
}
.status-badge-modal.status-confirmed, /* Example for a blue/info badge */
.status-badge-modal.status-payment-overpaid {
  background-color: #17a2b8; /* Bootstrap info */
  border-color: #17a2b8;
}
.status-badge-modal.status-completed,
.status-badge-modal.status-payment-paid { /* Example for a green/success badge */
  background-color: #28a745; /* Bootstrap success */
  border-color: #28a745;
}
.status-badge-modal.status-cancelled_by_medic,
.status-badge-modal.status-cancelled_by_patient,
.status-badge-modal.status-cancelled_by_system,
.status-badge-modal.status-payment-unpaid { /* Example for a red/danger badge */
  background-color: #dc3545; /* Bootstrap danger */
  border-color: #dc3545;
}
.status-badge-modal.status-no_show { /* Example for a dark grey/secondary badge */
  background-color: #6c757d; /* Bootstrap secondary */
  border-color: #6c757d;
}
.status-badge-modal.status-payment-not-applicable {
  background-color: #e9ecef;
  border-color: #ced4da;
  color: var(--text-dark);
}


/* Plan Details Modal Specific Styles - Light Theme */
.plan-details-modal-content .modal-title {
  color: var(--text-dark);
}

.plan-details-modal-content .modal-body {
  gap: 1.25rem;
}

.modal-section {
  padding: 1rem;
  border-radius: 6px;
  background-color: #f8f9fa; /* Light grey for sections within modal */
  border: 1px solid var(--border-color-light);
}
.modal-section h4 {
  font-size: 1.05rem;
  color: var(--primary-color); /* Primary color for section titles */
  margin-top: 0;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border-color-light);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.modal-section h4 i {
  font-size: 0.9em;
  opacity: 0.9;
}

.financial-summary .detail-item .detail-label {
  width: 80px; /* Adjusted width */
}
.due-amount-item .detail-value {
  font-weight: 500; /* Normal weight */
  color: #dc3545; /* Standard danger color for due amount */
}

.progress-details .progress-bar-container.modal-progress {
  height: 10px;
  margin-top: 0.4rem;
}
.progress-details .progress-bar-container.modal-progress.small-progress {
  height: 6px;
  margin-top: 0.2rem;
  margin-bottom: 0.4rem;
}

.notes-details .notes-text {
  font-size: 0.85rem;
  color: var(--text-dark);
  white-space: pre-wrap;
  background-color: var(--background-light); /* White background for notes box */
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--border-color-light);
}

.service-items-list-modal {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 180px;
  overflow-y: auto;
}

.service-item-modal {
  padding: 0.6rem;
  border-bottom: 1px solid #e9ecef; /* Lighter separator */
  font-size: 0.85rem;
}
.service-item-modal:last-child {
  border-bottom: none;
}

.service-item-modal .item-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}
.service-item-modal .item-name strong {
  color: var(--text-dark);
}

.item-status-pill {
  padding: 0.2em 0.5em;
  border-radius: 0.2rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: #fff;
  border: 1px solid transparent;
}
.item-status-pill.item-active {
  background-color: #28a745; /* Bootstrap success */
  border-color: #28a745;
  /* color: var(--text-dark); */ /* Consider dark text if green is too light */
}
.item-status-pill.item-inactive {
  background-color: #6c757d; /* Bootstrap secondary */
  border-color: #6c757d;
}

.service-item-modal .item-details {
  font-size: 0.8rem;
  color: var(--text-muted-light);
  display: flex;
  justify-content: space-between;
}

.dashboard-card.plan-card.clickable {
  cursor: pointer;
}

.dashboard-card.plan-card.clickable:hover {
  /* Simpler hover, inherits from .dashboard-card:hover */
  border-color: var(--primary-color); /* Example: primary color border on hover */
}

/* Add new style for subtitle */
.progress-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted-light); /* Muted grey */
  margin-bottom: 0.75rem;
  margin-top: 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color-light); /* Light separator */
}

.service-item-progress .detail-label {
  font-weight: normal;
}

/* FontAwesome import (if not already global) */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
</style> 