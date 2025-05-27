<template>
  <div class="page-container">
    <div class="page-header">
      <h1>My Appointments</h1>
      <p>View your past and upcoming appointments.</p>
    </div>

    <section class="card list-section">
      <!-- Add Filtering Controls Here Later (e.g., by status, date range) -->
      <!-- <div class="list-controls">
        <select v-model="filterStatus" class="form-control filter-select">
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option> 
        </select>
      </div> -->

      <div v-if="isLoading" class="loading-indicator">
        <i class="fas fa-spinner fa-spin"></i> Loading appointments...
      </div>
      <div v-else-if="loadError" class="error-message table-error">
        <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
      </div>
      <div v-else-if="appointments.length === 0" class="no-data-message">
        You have no appointments on record.
      </div>

      <table v-else class="data-table appointments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Service</th>
            <th>Medic</th>
            <th>Status</th>
            <th>Notes</th>
            <!-- <th>Actions</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.appointmentId" @click="openAppointmentModal(appt)" class="clickable-row">
            <td>{{ formatDateTime(appt.scheduledStartTime, 'date') }}</td>
            <td>{{ formatDateTime(appt.scheduledStartTime, 'time') }} - {{ formatDateTime(appt.scheduledEndTime, 'time') }}</td>
            <td>
                <strong>{{ appt.serviceName }}</strong>
                <small v-if="appt.serviceDescription" class="text-muted d-block">{{ appt.serviceDescription }}</small>
            </td>
            <td>{{ appt.medicName }}</td>
            <td>
              <span class="status-badge" :class="'status-' + appt.status.toLowerCase()">{{ appt.status.replace('_', ' ') }}</span>
            </td>
            <td class="notes-cell">{{ appt.notes || '-' }}</td>
            <!-- <td class="actions-cell">
              <button v-if="canCancel(appt)" @click="openCancelModal(appt)" class="btn btn-danger btn-sm">Cancel</button>
            </td> -->
          </tr>
        </tbody>
      </table>
      <!-- Add Pagination Controls Here Later -->
    </section>

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
           <div class="detail-item" v-if="selectedAppointment.serviceDescription">
            <span class="detail-label"><i class="fas fa-info-circle"></i> Description:</span>
            <span class="detail-value">{{ selectedAppointment.serviceDescription }}</span>
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
          <div class="detail-item" v-if="selectedAppointment.status">
            <span class="detail-label"><i class="fas fa-check-circle"></i> Status:</span>
            <span :class="['detail-value', 'status-badge-modal', `status-${selectedAppointment.status.toLowerCase().replace(/_/g, '-')}`]">{{ (selectedAppointment.status || '').replace(/_/g, ' ') }}</span>
          </div>
          <div class="detail-item" v-if="selectedAppointment.notes">
            <span class="detail-label"><i class="far fa-sticky-note"></i> Notes:</span>
            <span class="detail-value notes-value">{{ selectedAppointment.notes }}</span>
          </div>
          <!-- Add more details as needed -->
        </div>
        <div v-else class="loading-state-modal">
            <i class="fas fa-spinner fa-spin"></i> Loading details...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import UserService from '@/services/UserService';
import { useToast } from 'vue-toastification';

const toast = useToast();
const appointments = ref([]);
const isLoading = ref(true);
const loadError = ref('');

// Modal State
const isModalVisible = ref(false);
const selectedAppointment = ref(null);

const openAppointmentModal = (appointment) => {
  selectedAppointment.value = appointment;
  isModalVisible.value = true;
};

const closeAppointmentModal = () => {
  isModalVisible.value = false;
  selectedAppointment.value = null;
};

// const filterStatus = ref('ALL'); // For later filtering

const fetchAppointments = async () => {
  isLoading.value = true;
  loadError.value = '';
  try {
    const response = await UserService.getAllMyAppointments();
    appointments.value = response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    loadError.value = error.response?.data?.message || 'Failed to load appointments.';
    toast.error(loadError.value);
  } finally {
    isLoading.value = false;
  }
};

const formatDateTime = (dateTimeString, part) => {
  if (!dateTimeString) return 'N/A';
  try {
    const date = new Date(dateTimeString);
    const options = {};
    if (part === 'date') {
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      return new Intl.DateTimeFormat('en-GB', options).format(date);
    }
    if (part === 'time') {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      return new Intl.DateTimeFormat('en-GB', options).format(date);
    }
    return date.toLocaleString('en-GB'); // Fallback
  } catch (e) {
    console.warn("Error formatting date:", e);
    return dateTimeString;
  }
};

// Methods for future actions (cancel, reschedule - if allowed)
// const canCancel = (appointment) => { ... return appointment.status === 'SCHEDULED' && new Date(appointment.scheduledStartTime) > new Date(); ... };
// const openCancelModal = (appointment) => { ... };

onMounted(() => {
  fetchAppointments();
});

// Computed property for filtering (example for later)
/*
const filteredAppointments = computed(() => {
  if (filterStatus.value === 'ALL') {
    return appointments.value;
  }
  return appointments.value.filter(appt => appt.status === filterStatus.value);
});
*/
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header h1 {
  margin-bottom: 0.25rem;
}
.page-header p {
  color: var(--text-muted-color);
  font-size: 1.1rem;
  margin-top: 0;
}

.card {
  background-color: #fff;
  padding: 1.5rem 2rem;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
}

.list-section {
  overflow-x: auto;
}

.list-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.filter-select {
  max-width: 200px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  padding: 0.9rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}
.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background-color: #f1f3f5;
}

.notes-cell {
  max-width: 250px; /* Limit width and allow wrap or ellipsis */
  white-space: pre-wrap; /* Or use text-overflow: ellipsis with other properties */
  font-size: 0.85rem;
  color: #555;
}

.actions-cell {
  text-align: right;
}

.status-badge {
  padding: 0.3em 0.7em;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: var(--border-radius-small);
  color: white;
  white-space: nowrap;
  text-transform: capitalize;
}

.status-scheduled { background-color: var(--info-color, #17a2b8); }
.status-confirmed { background-color: var(--primary-color, #007bff); }
.status-completed { background-color: var(--success-color, #28a745); }
.status-cancelled_by_medic, .status-cancelled_by_patient, .status-cancelled_by_user, .status-cancelled_by_system {
  background-color: var(--danger-color, #dc3545);
}
.status-no_show { background-color: var(--warning-color, #ffc107); color: #212529; }


.loading-indicator, .error-message, .no-data-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #6c757d;
}
.error-message i {
  margin-right: 0.5rem;
  color: var(--danger-color);
}

.text-muted {
    color: #6c757d !important;
}
.d-block {
    display: block !important;
}

.clickable-row {
    cursor: pointer;
}

/* Copied Modal Styles - Ensure theme variables are globally available or defined here if needed */
/* If theme variables like --card-background, --primary-glow are not global, 
   modal might not perfectly match dashboard style. */
/* :root { Add these if not global - example from UserDashboard 
  --primary-glow: #00ffff; 
  --secondary-glow: #ff00ff; 
  --background-dark: #12121f; 
  --card-background: rgba(25, 25, 45, 0.85); 
  --text-primary: #f0f0f5; 
  --text-secondary: #b0b0d0; 
  --border-color-futuristic: rgba(0, 255, 255, 0.25); 
  --accent-color: var(--primary-glow); 
  --danger-color-futuristic: #ff5555;
  --success-color-futuristic: #55ff55;
  --info-color-futuristic: #55ddff;
  --warning-color-futuristic: #ffcc33;
} */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75); 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; 
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-content.futuristic {
  background-color: rgba(240, 242, 245, 0.98); /* Light, slightly off-white background for the modal square */
  padding: 2.5rem;
  border-radius: 12px; /* Slightly softer radius */
  box-shadow: 0 8px 30px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1); /* Softer shadow for light box */
  border: 1px solid rgba(0,0,0,0.1); /* Subtle dark border */
  width: 90%;
  max-width: 580px; 
  position: relative;
  color: #2c3e50; /* Default dark text color for modal content */
  overflow-y: auto; 
  max-height: 85vh; 
}

.close-button {
  position: absolute;
  top: 0.8rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #888; 
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
  line-height: 1;
}

.close-button:hover {
  color: var(--danger-color-futuristic, #ff5555); /* Fallback if variable not present */
  transform: scale(1.1);
}

.modal-title {
  font-size: 1.7rem; 
  font-weight: 600;
  color: var(--background-dark, #12121f); /* Fallback for dark title */
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.8rem; 
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem; 
}

.detail-item {
  display: flex;
  align-items: flex-start; 
  gap: 0.8rem; 
  padding: 0.65rem 0;
  border-bottom: 1px dashed #dce0e6; 
  font-size: 0.95rem; 
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600; 
  color: #4a5568; 
  display: flex;
  align-items: center;
  gap: 0.6rem; 
  flex-shrink: 0; 
  width: 120px; 
}
.detail-label i {
  color: #007bff; /* Changed from var(--primary-glow) to a standard blue */ 
  opacity: 1; 
  font-size: 1.05em;
  margin-right: 0.1em; 
}

.detail-value {
  font-weight: normal;
  color: #2c3e50; 
  word-break: break-word; 
  flex-grow: 1; 
}
.detail-value.notes-value { /* For pre-wrap on notes */
    white-space: pre-wrap;
}

.loading-state-modal {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #4a5568; 
}
.loading-state-modal i {
    font-size: 2rem;
    color: var(--primary-glow, #00ffff);  /* Fallback */
    margin-bottom: 1rem;
    animation: pulseGlow 1.5s infinite ease-in-out; /* Ensure pulseGlow is defined or remove animation */
}

/* Status Badge for Modal - Aligning with table status badges */
.status-badge-modal {
  padding: 0.4em 0.8em; 
  font-size: 0.8em; 
  font-weight: 600; 
  border-radius: 10px; 
  white-space: nowrap;
  text-transform: capitalize;
  border: 1px solid;
  line-height: 1.3; 
  display: inline-block; 
}

/* Remove general text-shadow for all, apply only where needed (e.g., No Show) */
.status-badge-modal.status-scheduled,
.status-badge-modal.status-confirmed,
.status-badge-modal.status-completed,
/* Ensure cancelled also has no default text-shadow if it has light text */
.status-badge-modal.status-cancelled_by_medic,
.status-badge-modal.status-cancelled_by_patient,
.status-badge-modal.status-cancelled_by_user,
.status-badge-modal.status-cancelled_by_system {
  text-shadow: none; 
}

.status-badge-modal.status-no_show {
  text-shadow: 0px 0px 2px rgba(0,0,0,0.05); /* Keep for dark text on yellow */
}

.status-badge-modal.status-scheduled { 
  background-color: var(--info-color, #17a2b8); /* From table .status-scheduled */
  border-color: var(--info-color, #17a2b8);
  color: #fff; /* White text */
}
.status-badge-modal.status-confirmed { 
  background-color: var(--primary-color, #007bff); /* From table .status-confirmed */
  border-color: var(--primary-color, #007bff);
  color: #fff; /* White text */
}
.status-badge-modal.status-completed { 
  background-color: var(--success-color, #28a745); /* From table .status-completed */
  border-color: var(--success-color, #28a745);
  color: #fff; /* White text */
}
.status-badge-modal.status-cancelled_by_medic,
.status-badge-modal.status-cancelled_by_patient,
.status-badge-modal.status-cancelled_by_user,
.status-badge-modal.status-cancelled_by_system {
  background-color: var(--danger-color, #dc3545); /* From table .status-cancelled_... */
  border-color: var(--danger-color, #dc3545);
  color: #fff; 
}
.status-badge-modal.status-no_show { 
  background-color: var(--warning-color, #ffc107); /* From table .status-no_show */
  border-color: var(--warning-color, #ffc107);
  color: #212529; /* Dark text, as in table */
}

/* Ensure pulseGlow animation is defined if used by loading icon */
@keyframes pulseGlow {
  0%, 100% { text-shadow: 0 0 8px var(--primary-glow, #00ffff), 0 0 16px var(--primary-glow, #00ffff); opacity: 0.8; }
  50% { text-shadow: 0 0 12px var(--primary-glow, #00ffff), 0 0 24px var(--primary-glow, #00ffff), 0 0 30px var(--primary-glow, #00ffff); opacity: 1; }
}

</style> 