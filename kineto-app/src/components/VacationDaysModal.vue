<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content vacation-modal-content">
      <button @click="$emit('close')" class="modal-close-button" title="Close">
        ×
      </button>
      
      <h2><i class="fas fa-umbrella-beach"></i> Manage Vacation Days</h2>
      <p>Select dates when you will be on vacation. No appointments will be possible on these days.</p>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading vacation days...
      </div>

      <!-- Content -->
      <div v-else class="modal-body">
        <!-- Add New Vacation Period -->
        <div class="add-vacation-section">
          <h3>Add Vacation Period</h3>
          <form @submit.prevent="addVacationPeriod" class="vacation-form">
            <div class="form-row">
              <div class="form-group">
                <label for="startDate" class="form-label">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  v-model="newVacation.startDate"
                  class="form-control"
                  :min="today"
                  required
                />
              </div>
              <div class="form-group">
                <label for="endDate" class="form-label">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  v-model="newVacation.endDate"
                  class="form-control"
                  :min="newVacation.startDate || today"
                  required
                />
              </div>
            </div>
            <div class="form-group">
              <label for="reason" class="form-label">Reason (Optional)</label>
              <input
                type="text"
                id="reason"
                v-model="newVacation.reason"
                placeholder="e.g., Annual leave, Personal vacation"
                class="form-control"
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isProcessing || !newVacation.startDate || !newVacation.endDate"
            >
              <span v-if="isProcessing"><i class="fas fa-spinner fa-spin"></i> Adding...</span>
              <span v-else><i class="fas fa-plus"></i> Add Vacation Period</span>
            </button>
          </form>
        </div>

        <!-- Planned Vacation Days (Approved & Future/Current) -->
        <div v-if="plannedVacations.length > 0" class="planned-vacations-section">
          <h3><i class="fas fa-calendar-check"></i> Planned Vacation Days</h3>
          <p class="section-description">Your approved and pending vacation days that are current or upcoming.</p>
          <div class="vacation-list planned-list">
            <div
              v-for="vacation in plannedVacations"
              :key="`planned-${vacation.id}`"
              class="vacation-item planned-vacation"
              :class="{ 'current-vacation': isCurrentVacation(vacation) }"
            >
              <div class="vacation-info">
                <div class="vacation-dates">
                  <i class="fas fa-calendar-alt"></i>
                  {{ formatDate(vacation.startDate) }} 
                  <span v-if="vacation.startDate !== vacation.endDate">
                    - {{ formatDate(vacation.endDate) }}
                  </span>
                  <span class="vacation-duration">
                    ({{ calculateDuration(vacation.startDate, vacation.endDate) }} 
                    {{ calculateDuration(vacation.startDate, vacation.endDate) === 1 ? 'day' : 'days' }})
                  </span>
                </div>
                <div v-if="vacation.reason" class="vacation-reason">
                  <i class="fas fa-comment"></i> {{ vacation.reason }}
                </div>
                <div class="vacation-status-row">
                  <div class="vacation-status">
                    <span v-if="isCurrentVacation(vacation)" class="status-badge current">
                      <i class="fas fa-play-circle"></i> In Progress
                    </span>
                    <span v-else class="status-badge future">
                      <i class="fas fa-calendar-plus"></i> Upcoming
                    </span>
                  </div>
                  <div class="approval-status">
                    <span 
                      v-if="vacation.approvalStatus === 'APPROVED'" 
                      class="approval-badge approved"
                    >
                      <i class="fas fa-check"></i> Approved
                    </span>
                    <span 
                      v-else-if="vacation.approvalStatus === 'PENDING'" 
                      class="approval-badge pending"
                    >
                      <i class="fas fa-clock"></i> Pending Approval
                    </span>
                  </div>
                </div>
              </div>
              <div class="vacation-actions">
                <span class="approved-notice">
                  <i class="fas fa-shield-alt"></i> Protected - Cannot be deleted
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Existing Vacation Days -->
        <div class="existing-vacations-section">
          <h3>Existing Vacation Periods</h3>
          <div v-if="!vacationDays || vacationDays.length === 0" class="no-data">
            <i class="fas fa-info-circle"></i> No vacation days scheduled.
          </div>
          <div v-else class="vacation-list">
            <div
              v-for="vacation in vacationDays"
              :key="vacation.id"
              class="vacation-item"
              :class="{ 'past-vacation': isPastVacation(vacation) }"
            >
              <div class="vacation-info">
                <div class="vacation-dates">
                  <i class="fas fa-calendar-alt"></i>
                  {{ formatDate(vacation.startDate) }} 
                  <span v-if="vacation.startDate !== vacation.endDate">
                    - {{ formatDate(vacation.endDate) }}
                  </span>
                  <span class="vacation-duration">
                    ({{ calculateDuration(vacation.startDate, vacation.endDate) }} 
                    {{ calculateDuration(vacation.startDate, vacation.endDate) === 1 ? 'day' : 'days' }})
                  </span>
                </div>
                <div v-if="vacation.reason" class="vacation-reason">
                  <i class="fas fa-comment"></i> {{ vacation.reason }}
                </div>
                <div class="vacation-status-row">
                  <div class="vacation-status">
                    <span v-if="isPastVacation(vacation)" class="status-badge past">Past</span>
                    <span v-else-if="isCurrentVacation(vacation)" class="status-badge current">Current</span>
                    <span v-else class="status-badge future">Upcoming</span>
                  </div>
                  <div class="approval-status">
                    <span 
                      v-if="vacation.approvalStatus === 'PENDING'" 
                      class="approval-badge pending"
                      title="Pending approval"
                    >
                      <i class="fas fa-clock"></i> Pending
                    </span>
                    <span 
                      v-else-if="vacation.approvalStatus === 'APPROVED'" 
                      class="approval-badge approved"
                      :title="`Approved by ${vacation.approvedByName || 'Admin'} on ${formatApprovalDate(vacation.approvalDate)}`"
                    >
                      <i class="fas fa-check"></i> Approved
                    </span>
                    <span 
                      v-else-if="vacation.approvalStatus === 'REJECTED'" 
                      class="approval-badge rejected"
                      :title="`Rejected by ${vacation.approvedByName || 'Admin'} on ${formatApprovalDate(vacation.approvalDate)}${vacation.rejectionReason ? ': ' + vacation.rejectionReason : ''}`"
                    >
                      <i class="fas fa-times"></i> Rejected
                    </span>
                  </div>
                </div>
                <div v-if="vacation.approvalStatus === 'REJECTED' && vacation.rejectionReason" class="rejection-reason">
                  <i class="fas fa-exclamation-triangle"></i> 
                  <strong>Rejection Reason:</strong> {{ vacation.rejectionReason }}
                </div>
              </div>
              <div class="vacation-actions">
                <button
                  v-if="vacation.approvalStatus === 'PENDING'"
                  @click="deleteVacationPeriod(vacation.id)"
                  class="btn btn-sm btn-danger"
                  :disabled="isProcessing"
                  title="Delete vacation period"
                >
                  <i class="fas fa-trash"></i> Delete
                </button>
                <span v-else-if="vacation.approvalStatus === 'APPROVED'" class="approved-notice">
                  <i class="fas fa-shield-alt"></i> Protected - Cannot be deleted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import MedicService from '@/services/MedicService';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['close', 'saved']);
const toast = useToast();

// State
const loading = ref(true);
const isProcessing = ref(false);
const vacationDays = ref([]);
const newVacation = ref({
  startDate: '',
  endDate: '',
  reason: ''
});

// Computed
const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Computed property for planned vacations (approved and pending future/current)
const plannedVacations = computed(() => {
  if (!vacationDays.value) return [];
  
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
  
  return vacationDays.value.filter(vacation => {
    // Only approved or pending vacations (exclude rejected)
    if (vacation.approvalStatus === 'REJECTED') return false;
    
    // Only current or future vacations (not past)
    const endDate = new Date(vacation.endDate);
    endDate.setHours(23, 59, 59, 999); // Set to end of day for comparison
    
    return endDate >= currentDate;
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort by start date
});

// Methods
async function loadVacationDays() {
  try {
    loading.value = true;
    const response = await MedicService.getVacationDays();
    vacationDays.value = response || []; // response is already the data array
  } catch (error) {
    console.error('Error loading vacation days:', error);
    toast.error('Failed to load vacation days');
    vacationDays.value = []; // Ensure it's always an array even on error
  } finally {
    loading.value = false;
  }
}

async function addVacationPeriod() {
  try {
    isProcessing.value = true;
    await MedicService.addVacationPeriod(newVacation.value);
    toast.success('Vacation period added successfully');
    
    // Reset form
    newVacation.value = {
      startDate: '',
      endDate: '',
      reason: ''
    };
    
    // Reload vacation days
    await loadVacationDays();
    emit('saved');
  } catch (error) {
    console.error('Error adding vacation period:', error);
    toast.error(error.response?.data?.message || 'Failed to add vacation period');
  } finally {
    isProcessing.value = false;
  }
}

async function deleteVacationPeriod(vacationId) {
  if (!confirm('Are you sure you want to delete this vacation period?')) {
    return;
  }

  try {
    isProcessing.value = true;
    await MedicService.deleteVacationPeriod(vacationId);
    toast.success('Vacation period deleted successfully');
    
    // Reload vacation days
    await loadVacationDays();
    emit('saved');
  } catch (error) {
    console.error('Error deleting vacation period:', error);
    toast.error(error.response?.data?.message || 'Failed to delete vacation period');
  } finally {
    isProcessing.value = false;
  }
}

function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Europe/Bucharest'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  return diffDays;
}

function isPastVacation(vacation) {
  const today = new Date();
  const endDate = new Date(vacation.endDate);
  return endDate < today;
}

function isCurrentVacation(vacation) {
  const today = new Date();
  const startDate = new Date(vacation.startDate);
  const endDate = new Date(vacation.endDate);
  return startDate <= today && today <= endDate;
}

function formatApprovalDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Europe/Bucharest'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Lifecycle
onMounted(() => {
  loadVacationDays();
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
  padding: 2rem 2.5rem;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-dark);
  position: relative;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.8rem;
  font-size: 2rem;
  font-weight: bold;
  color: #aaa;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  padding: 0.2rem 0.5rem;
}

.modal-close-button:hover {
  color: #777;
}

.modal-content h2 {
  color: var(--dark-color);
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
  text-align: center;
  flex-shrink: 0;
}

.modal-content > p {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.vacation-modal-content {
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.add-vacation-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #f8f9fa;
}

.add-vacation-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.vacation-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
}

.form-control {
  padding: 0.6rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.existing-vacations-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.vacation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vacation-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease;
}

.vacation-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.vacation-item.past-vacation {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.vacation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vacation-dates {
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vacation-duration {
  font-weight: normal;
  color: #6c757d;
  font-size: 0.9rem;
}

.vacation-reason {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vacation-status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vacation-status {
  margin-top: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.past {
  background-color: #6c757d;
  color: white;
}

.status-badge.current {
  background-color: #28a745;
  color: white;
}

.status-badge.future {
  background-color: #007bff;
  color: white;
}

.approval-status {
  margin-top: 0.5rem;
}

.approval-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.approval-badge.pending {
  background-color: #007bff;
  color: white;
}

.approval-badge.approved {
  background-color: #28a745;
  color: white;
}

.approval-badge.rejected {
  background-color: #dc3545;
  color: white;
}

.rejection-reason {
  color: #dc3545;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vacation-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.5rem;
  font-size: 0.8rem;
}

.modal-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.approved-notice {
  color: #28a745;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .vacation-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .vacation-actions {
    align-self: flex-end;
  }
}

.section-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* Planned Vacations Section */
.planned-vacations-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 12px;
  border: 2px solid #2196f3;
}

.planned-vacations-section h3 {
  color: #1976d2;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.planned-list .vacation-item.planned-vacation {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.15);
}

.planned-list .vacation-item.planned-vacation:hover {
  border-color: #1e7e34;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.25);
}

.planned-list .vacation-item.current-vacation {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, #ffffff 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 2px 8px rgba(255, 193, 7, 0.15); }
  50% { box-shadow: 0 4px 16px rgba(255, 193, 7, 0.35); }
  100% { box-shadow: 0 2px 8px rgba(255, 193, 7, 0.15); }
}
</style> 