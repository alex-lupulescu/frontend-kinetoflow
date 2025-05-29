<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content extra-work-modal-content">
      <button @click="$emit('close')" class="modal-close-button" title="Close">
        ×
      </button>
      
      <h2><i class="fas fa-plus-circle"></i> Manage Extra Work Days</h2>
      <p>Add extra working days outside your regular schedule (e.g., weekends, holidays).</p>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading extra work days...
      </div>

      <!-- Content -->
      <div v-else class="modal-body">
        <!-- Add New Extra Work Day -->
        <div class="add-extra-work-section">
          <h3>Add Extra Work Day</h3>
          <form @submit.prevent="addExtraWorkDay" class="extra-work-form">
            <div class="form-row">
              <div class="form-group">
                <label for="workDate" class="form-label">Date</label>
                <input
                  type="date"
                  id="workDate"
                  v-model="newExtraWork.workDate"
                  class="form-control"
                  :min="today"
                  required
                />
              </div>
              <div class="form-group">
                <label for="workType" class="form-label">Type</label>
                <select
                  id="workType"
                  v-model="newExtraWork.workType"
                  class="form-control"
                  required
                >
                  <option value="">Select type</option>
                  <option value="WEEKEND_WORK">Weekend Work</option>
                  <option value="HOLIDAY_WORK">Holiday Work</option>
                  <option value="EMERGENCY_COVERAGE">Emergency Coverage</option>
                  <option value="EXTENDED_HOURS">Extended Hours</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="startTime" class="form-label">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  v-model="newExtraWork.startTime"
                  class="form-control"
                  required
                />
              </div>
              <div class="form-group">
                <label for="endTime" class="form-label">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  v-model="newExtraWork.endTime"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="form-group">
              <label for="reason" class="form-label">Reason/Description</label>
              <input
                type="text"
                id="reason"
                v-model="newExtraWork.reason"
                placeholder="e.g., Emergency coverage, Special clinic hours"
                class="form-control"
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isProcessing || !isValidExtraWorkForm"
            >
              <span v-if="isProcessing"><i class="fas fa-spinner fa-spin"></i> Adding...</span>
              <span v-else><i class="fas fa-plus"></i> Add Extra Work Day</span>
            </button>
          </form>
        </div>

        <!-- Existing Extra Work Days -->
        <div class="existing-extra-work-section">
          <h3>Existing Extra Work Days</h3>
          <div v-if="!extraWorkDays || extraWorkDays.length === 0" class="no-data">
            <i class="fas fa-info-circle"></i> No extra work days scheduled.
          </div>
          <div v-else class="extra-work-list">
            <div
              v-for="extraWork in extraWorkDays"
              :key="extraWork.id"
              class="extra-work-item"
              :class="{ 'past-extra-work': isPastExtraWork(extraWork) }"
            >
              <div class="extra-work-info">
                <div class="extra-work-date">
                  <i class="fas fa-calendar-day"></i>
                  {{ formatDate(extraWork.workDate) }}
                  <span class="work-time">
                    {{ formatTime(extraWork.startTime) }} - {{ formatTime(extraWork.endTime) }}
                  </span>
                </div>
                <div class="extra-work-type">
                  <span class="type-badge" :class="getTypeBadgeClass(extraWork.workType)">
                    {{ formatWorkType(extraWork.workType) }}
                  </span>
                </div>
                <div v-if="extraWork.reason" class="extra-work-reason">
                  <i class="fas fa-comment"></i> {{ extraWork.reason }}
                </div>
                <div class="extra-work-status">
                  <span v-if="isPastExtraWork(extraWork)" class="status-badge past">Past</span>
                  <span v-else-if="isCurrentExtraWork(extraWork)" class="status-badge current">Today</span>
                  <span v-else class="status-badge future">Upcoming</span>
                </div>
              </div>
              <div class="extra-work-actions">
                <button
                  v-if="!isPastExtraWork(extraWork)"
                  @click="deleteExtraWorkDay(extraWork.id)"
                  class="btn btn-sm btn-danger"
                  :disabled="isProcessing"
                  title="Delete extra work day"
                >
                  <i class="fas fa-trash"></i>
                </button>
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
const extraWorkDays = ref([]);
const newExtraWork = ref({
  workDate: '',
  workType: '',
  startTime: '09:00',
  endTime: '17:00',
  reason: ''
});

// Computed
const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const isValidExtraWorkForm = computed(() => {
  return newExtraWork.value.workDate && 
         newExtraWork.value.workType && 
         newExtraWork.value.startTime && 
         newExtraWork.value.endTime &&
         newExtraWork.value.startTime < newExtraWork.value.endTime;
});

// Methods
async function loadExtraWorkDays() {
  try {
    loading.value = true;
    const response = await MedicService.getExtraWorkDays();
    console.log('Extra work days response:', response); // Debug log
    extraWorkDays.value = response.data || []; // Ensure it's always an array
  } catch (error) {
    console.error('Error loading extra work days:', error);
    toast.error('Failed to load extra work days');
    extraWorkDays.value = []; // Ensure it's always an array even on error
  } finally {
    loading.value = false;
  }
}

async function addExtraWorkDay() {
  try {
    isProcessing.value = true;
    await MedicService.addExtraWorkDay(newExtraWork.value);
    toast.success('Extra work day added successfully');
    
    // Reset form
    newExtraWork.value = {
      workDate: '',
      workType: '',
      startTime: '09:00',
      endTime: '17:00',
      reason: ''
    };
    
    // Reload extra work days
    await loadExtraWorkDays();
    emit('saved');
  } catch (error) {
    console.error('Error adding extra work day:', error);
    toast.error(error.response?.data?.message || 'Failed to add extra work day');
  } finally {
    isProcessing.value = false;
  }
}

async function deleteExtraWorkDay(extraWorkId) {
  if (!confirm('Are you sure you want to delete this extra work day?')) {
    return;
  }

  try {
    isProcessing.value = true;
    await MedicService.deleteExtraWorkDay(extraWorkId);
    toast.success('Extra work day deleted successfully');
    
    // Reload extra work days
    await loadExtraWorkDays();
    emit('saved');
  } catch (error) {
    console.error('Error deleting extra work day:', error);
    toast.error(error.response?.data?.message || 'Failed to delete extra work day');
  } finally {
    isProcessing.value = false;
  }
}

function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Europe/Bucharest'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
  return timeString.substring(0, 5); // Remove seconds if present
}

function formatWorkType(workType) {
  const types = {
    'WEEKEND_WORK': 'Weekend Work',
    'HOLIDAY_WORK': 'Holiday Work', 
    'EMERGENCY_COVERAGE': 'Emergency Coverage',
    'EXTENDED_HOURS': 'Extended Hours',
    'OTHER': 'Other'
  };
  return types[workType] || workType;
}

function getTypeBadgeClass(workType) {
  const classes = {
    'WEEKEND_WORK': 'type-weekend',
    'HOLIDAY_WORK': 'type-holiday',
    'EMERGENCY_COVERAGE': 'type-emergency',
    'EXTENDED_HOURS': 'type-extended',
    'OTHER': 'type-other'
  };
  return classes[workType] || 'type-other';
}

function isPastExtraWork(extraWork) {
  const today = new Date();
  const workDate = new Date(extraWork.workDate);
  return workDate < today;
}

function isCurrentExtraWork(extraWork) {
  const today = new Date().toISOString().split('T')[0];
  return extraWork.workDate === today;
}

// Lifecycle
onMounted(() => {
  loadExtraWorkDays();
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

.extra-work-modal-content {
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

.add-extra-work-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #f0f8ff;
}

.add-extra-work-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.extra-work-form {
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

.existing-extra-work-section h3 {
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

.extra-work-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.extra-work-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease;
}

.extra-work-item:hover {
  border-color: #28a745;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.1);
}

.extra-work-item.past-extra-work {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.extra-work-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.extra-work-date {
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.work-time {
  font-weight: normal;
  color: #28a745;
  font-size: 0.9rem;
  margin-left: auto;
}

.extra-work-type {
  margin-top: 0.25rem;
}

.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-badge.type-weekend {
  background-color: #17a2b8;
  color: white;
}

.type-badge.type-holiday {
  background-color: #fd7e14;
  color: white;
}

.type-badge.type-emergency {
  background-color: #dc3545;
  color: white;
}

.type-badge.type-extended {
  background-color: #6f42c1;
  color: white;
}

.type-badge.type-other {
  background-color: #6c757d;
  color: white;
}

.extra-work-reason {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.extra-work-status {
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

.extra-work-actions {
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .extra-work-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .extra-work-actions {
    align-self: flex-end;
  }
  
  .work-time {
    margin-left: 0;
  }
}
</style> 