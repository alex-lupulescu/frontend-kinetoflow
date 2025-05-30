<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content appointment-details-modal-content">
      <button @click="closeModal" class="modal-close-button" title="Close">×</button>
      <h2><i class="fas fa-calendar-check"></i> Appointment Details</h2>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading appointment details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p>{{ loadError }}</p>
        <button @click="retryLoad" class="btn btn-primary btn-sm">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>

      <!-- Appointment Details -->
      <div v-else-if="appointmentDetails" class="appointment-details">
        <!-- Status Banner -->
        <div class="status-banner" :class="`status-${appointmentDetails.status?.toLowerCase()}`">
          <i :class="getStatusIcon(appointmentDetails.status)"></i>
          <span>{{ getStatusText(appointmentDetails.status) }}</span>
        </div>

        <!-- Main Details Grid -->
        <div class="details-grid">
          <!-- Date & Time -->
          <div class="detail-section">
            <h4><i class="fas fa-clock"></i> Date & Time</h4>
            <div class="detail-content">
              <p class="detail-primary">
                {{ formatAppointmentDate(appointmentDetails.scheduledStartTime) }}
              </p>
              <p class="detail-secondary">
                {{ formatTimeRange(appointmentDetails.scheduledStartTime, appointmentDetails.scheduledEndTime) }}
                <span class="duration">({{ calculateDuration(appointmentDetails.scheduledStartTime, appointmentDetails.scheduledEndTime) }} min)</span>
              </p>
            </div>
          </div>

          <!-- Patient Info -->
          <div class="detail-section">
            <h4><i class="fas fa-user"></i> Patient</h4>
            <div class="detail-content">
              <p class="detail-primary">{{ appointmentDetails.patientName }}</p>
              <p class="detail-secondary">ID: {{ appointmentDetails.patientId }}</p>
            </div>
          </div>

          <!-- Service Info -->
          <div class="detail-section">
            <h4><i class="fas fa-stethoscope"></i> Service</h4>
            <div class="detail-content">
              <p class="detail-primary">{{ appointmentDetails.serviceName }}</p>
              <p class="detail-secondary" v-if="appointmentDetails.serviceDuration">
                Duration: {{ appointmentDetails.serviceDuration }} minutes
              </p>
            </div>
          </div>

          <!-- Plan Info (if applicable) -->
          <div v-if="appointmentDetails.patientPlanServiceItemId" class="detail-section">
            <h4><i class="fas fa-box"></i> From Plan</h4>
            <div class="detail-content">
              <p class="detail-primary">Part of Patient Plan</p>
              <p class="detail-secondary">Plan Item ID: {{ appointmentDetails.patientPlanServiceItemId }}</p>
            </div>
          </div>
        </div>

        <!-- Notes Section -->
        <div v-if="appointmentDetails.notes" class="notes-section">
          <h4><i class="fas fa-sticky-note"></i> Notes</h4>
          <div class="notes-content">
            {{ appointmentDetails.notes }}
          </div>
        </div>

        <!-- Timing Details (if completed) -->
        <div v-if="appointmentDetails.actualStartTime || appointmentDetails.actualEndTime" class="timing-section">
          <h4><i class="fas fa-stopwatch"></i> Actual Timing</h4>
          <div class="timing-grid">
            <div v-if="appointmentDetails.actualStartTime">
              <span class="timing-label">Started:</span>
              <span class="timing-value">{{ formatDateTime(appointmentDetails.actualStartTime) }}</span>
            </div>
            <div v-if="appointmentDetails.actualEndTime">
              <span class="timing-label">Ended:</span>
              <span class="timing-value">{{ formatDateTime(appointmentDetails.actualEndTime) }}</span>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="metadata-section">
          <div class="metadata-grid">
            <div>
              <span class="metadata-label">Created:</span>
              <span class="metadata-value">{{ formatDateTime(appointmentDetails.createdAt) }}</span>
            </div>
            <div v-if="appointmentDetails.updatedAt !== appointmentDetails.createdAt">
              <span class="metadata-label">Updated:</span>
              <span class="metadata-value">{{ formatDateTime(appointmentDetails.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-actions">
        <button @click="closeModal" class="btn btn-secondary">
          <i class="fas fa-times"></i> Close
        </button>
        <button 
          v-if="appointmentDetails?.status === 'SCHEDULED'"
          @click="editAppointment" 
          class="btn btn-primary"
        >
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import MedicService from '@/services/MedicService';

const props = defineProps({
  appointmentId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['close', 'edit']);

const toast = useToast();
const isLoading = ref(true);
const loadError = ref('');
const appointmentDetails = ref(null);

async function loadAppointmentDetails() {
  if (!props.appointmentId) return;
  
  isLoading.value = true;
  loadError.value = '';
  
  try {
    const response = await MedicService.getAppointmentDetails(props.appointmentId);
    appointmentDetails.value = response.data;
  } catch (error) {
    console.error('Error loading appointment details:', error);
    loadError.value = error.response?.data?.message || 'Failed to load appointment details';
  } finally {
    isLoading.value = false;
  }
}

function closeModal() {
  emit('close');
}

function editAppointment() {
  emit('edit', appointmentDetails.value);
}

function retryLoad() {
  loadAppointmentDetails();
}

function getStatusIcon(status) {
  const icons = {
    'SCHEDULED': 'fas fa-clock',
    'COMPLETED': 'fas fa-check-circle',
    'CANCELLED_BY_MEDIC': 'fas fa-user-md',
    'CANCELLED_BY_PATIENT': 'fas fa-user',
    'NO_SHOW': 'fas fa-exclamation-triangle'
  };
  return icons[status] || 'fas fa-circle';
}

function getStatusText(status) {
  const texts = {
    'SCHEDULED': 'Scheduled',
    'COMPLETED': 'Completed',
    'CANCELLED_BY_MEDIC': 'Cancelled by Medic',
    'CANCELLED_BY_PATIENT': 'Cancelled by Patient',
    'NO_SHOW': 'No Show'
  };
  return texts[status] || status;
}

function formatAppointmentDate(dateTime) {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  const start = new Date(startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const end = new Date(endTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${start} - ${end}`;
}

function formatDateTime(dateTime) {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / (1000 * 60)); // minutes
}

onMounted(() => {
  loadAppointmentDetails();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.appointment-details-modal-content {
  animation: slideInUp 0.3s ease-out;
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

.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #aaa;
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1;
}

.modal-close-button:hover {
  color: #666;
  background: rgba(0, 0, 0, 0.05);
}

.modal-content h2 {
  color: #2d3748;
  margin: 0;
  padding: 2rem 2rem 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.modal-content h2 i {
  color: #667eea;
}

/* Loading and Error States */
.loading-container,
.error-container {
  padding: 3rem 2rem;
  text-align: center;
  color: #718096;
}

.loading-spinner i {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.error-icon i {
  font-size: 2rem;
  color: #f56565;
  margin-bottom: 1rem;
}

/* Status Banner */
.status-banner {
  margin: 0 2rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-scheduled {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
  border: 1px solid rgba(66, 153, 225, 0.2);
}

.status-completed {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.status-cancelled_by_medic,
.status-cancelled_by_patient {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(245, 101, 101, 0.2);
}

.status-no_show {
  background: rgba(237, 137, 54, 0.1);
  color: #dd6b20;
  border: 1px solid rgba(237, 137, 54, 0.2);
}

/* Appointment Details */
.appointment-details {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-section {
  background: rgba(102, 126, 234, 0.02);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.detail-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-section h4 i {
  color: #667eea;
  width: 16px;
  text-align: center;
}

.detail-primary {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.detail-secondary {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.duration {
  font-weight: 600;
  color: #4a5568;
}

/* Notes Section */
.notes-section {
  margin-bottom: 2rem;
}

.notes-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notes-section h4 i {
  color: #667eea;
}

.notes-content {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  color: #2d3748;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* Timing Section */
.timing-section {
  margin-bottom: 2rem;
}

.timing-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timing-section h4 i {
  color: #667eea;
}

.timing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.timing-grid > div {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.timing-label {
  font-weight: 600;
  color: #4a5568;
}

.timing-value {
  color: #2d3748;
}

/* Metadata Section */
.metadata-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metadata-grid > div {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.metadata-label {
  color: #718096;
  font-weight: 500;
}

.metadata-value {
  color: #4a5568;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-shrink: 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-content h2 {
    font-size: 1.25rem;
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .appointment-details {
    padding: 1rem 1.5rem 0;
  }
  
  .modal-actions {
    padding: 1rem 1.5rem;
  }
}
</style> 