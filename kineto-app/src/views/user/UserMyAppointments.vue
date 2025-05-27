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
          <tr v-for="appt in appointments" :key="appt.appointmentId">
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
</style> 