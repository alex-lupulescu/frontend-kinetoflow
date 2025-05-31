<template>
  <div class="holidays-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-calendar-alt"></i> Legal Holidays Management</h1>
        <p class="subtitle">Manage company-wide holidays that appear in all medics' calendars</p>
      </div>
      <div class="header-actions">
        <button @click="openCreateModal" class="btn btn-primary">
          <i class="fas fa-plus"></i> Add Holiday
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Filter by Year:</label>
        <select v-model="selectedYear" @change="fetchHolidays" class="form-control">
          <option value="">All Years</option>
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Filter by Type:</label>
        <select v-model="filterType" @change="applyFilters" class="form-control">
          <option value="">All Types</option>
          <option value="recurring">Recurring</option>
          <option value="one-time">One-time</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Search:</label>
        <input 
          v-model="searchTerm" 
          @input="applyFilters"
          type="text" 
          placeholder="Search holidays..."
          class="form-control"
        >
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-section">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading holidays...</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error && !isLoading" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
      <button @click="fetchHolidays" class="btn btn-sm btn-secondary retry-btn">
        Retry
      </button>
    </div>

    <!-- Holidays List -->
    <div v-if="!isLoading && !error" class="holidays-list">
      <div class="holidays-stats">
        <div class="stat-item">
          <span class="stat-number">{{ filteredHolidays.length }}</span>
          <span class="stat-label">Total Holidays</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ recurringCount }}</span>
          <span class="stat-label">Recurring</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ upcomingCount }}</span>
          <span class="stat-label">Upcoming</span>
        </div>
      </div>

      <div v-if="filteredHolidays.length === 0" class="no-holidays">
        <i class="fas fa-calendar-times"></i>
        <h3>No holidays found</h3>
        <p>{{ searchTerm || filterType ? 'Try adjusting your filters' : 'Click "Add Holiday" to create your first holiday' }}</p>
      </div>

      <div v-else class="holidays-grid">
        <div 
          v-for="holiday in filteredHolidays" 
          :key="holiday.id"
          class="holiday-card"
          :class="{ 
            'past': isPast(holiday.date),
            'today': isToday(holiday.date),
            'upcoming': isFuture(holiday.date)
          }"
        >
          <div class="holiday-header">
            <h3 class="holiday-name">{{ holiday.name }}</h3>
            <div class="holiday-badges">
              <span v-if="holiday.isRecurring" class="badge recurring">
                <i class="fas fa-redo"></i> Recurring
              </span>
              <span class="badge status" :class="getStatusClass(holiday.date)">
                {{ getStatusText(holiday.date) }}
              </span>
            </div>
          </div>

          <div class="holiday-content">
            <div class="holiday-date">
              <i class="fas fa-calendar"></i>
              {{ formatDate(holiday.date) }}
            </div>
            <div v-if="holiday.description" class="holiday-description">
              <i class="fas fa-info-circle"></i>
              {{ holiday.description }}
            </div>
          </div>

          <div class="holiday-actions">
            <button 
              @click="editHoliday(holiday)" 
              class="btn btn-sm btn-outline-primary"
              title="Edit Holiday"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              @click="deleteHoliday(holiday)" 
              class="btn btn-sm btn-outline-danger"
              title="Delete Holiday"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content holiday-modal">
        <div class="modal-header">
          <h2>
            <i class="fas fa-calendar-plus"></i>
            {{ isEditing ? 'Edit Holiday' : 'Add New Holiday' }}
          </h2>
          <button @click="closeModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveHoliday" class="modal-form">
          <div class="form-group">
            <label for="holidayName" class="form-label">
              Holiday Name <span class="required">*</span>
            </label>
            <input
              id="holidayName"
              v-model="holidayForm.name"
              type="text"
              class="form-control"
              placeholder="e.g., Christmas Day"
              required
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="holidayDate" class="form-label">
              Date <span class="required">*</span>
            </label>
            <input
              id="holidayDate"
              v-model="holidayForm.date"
              type="date"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="holidayForm.isRecurring"
                type="checkbox"
                class="form-checkbox"
              />
              <span class="checkmark"></span>
              Recurring Holiday (appears every year)
            </label>
          </div>

          <div class="form-group">
            <label for="holidayDescription" class="form-label">
              Description (Optional)
            </label>
            <textarea
              id="holidayDescription"
              v-model="holidayForm.description"
              class="form-control"
              rows="3"
              placeholder="Optional description or notes"
              maxlength="500"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              @click="closeModal" 
              class="btn btn-cancel"
              :disabled="isSaving"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isSaving"
            >
              <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ isSaving ? 'Saving...' : (isEditing ? 'Update Holiday' : 'Create Holiday') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import HolidayService from '@/services/HolidayService';

const toast = useToast();

// State
const isLoading = ref(true);
const error = ref('');
const holidays = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);

// Filters
const selectedYear = ref('');
const filterType = ref('');
const searchTerm = ref('');

// Form
const holidayForm = reactive({
  id: null,
  name: '',
  date: '',
  isRecurring: false,
  description: ''
});

// Computed
const availableYears = computed(() => {
  const years = new Set();
  holidays.value.forEach(holiday => {
    years.add(new Date(holiday.date).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
});

const filteredHolidays = computed(() => {
  let filtered = holidays.value;

  // Filter by year
  if (selectedYear.value) {
    filtered = filtered.filter(holiday => 
      new Date(holiday.date).getFullYear() === parseInt(selectedYear.value)
    );
  }

  // Filter by type
  if (filterType.value) {
    if (filterType.value === 'recurring') {
      filtered = filtered.filter(holiday => holiday.isRecurring);
    } else if (filterType.value === 'one-time') {
      filtered = filtered.filter(holiday => !holiday.isRecurring);
    }
  }

  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(holiday => 
      holiday.name.toLowerCase().includes(term) ||
      (holiday.description && holiday.description.toLowerCase().includes(term))
    );
  }

  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
});

const recurringCount = computed(() => 
  holidays.value.filter(h => h.isRecurring).length
);

const upcomingCount = computed(() => 
  holidays.value.filter(h => isFuture(h.date)).length
);

// Methods
async function fetchHolidays() {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await HolidayService.getCompanyHolidays();
    holidays.value = response.data || [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load holidays';
  } finally {
    isLoading.value = false;
  }
}

function applyFilters() {
  // Filters are reactive through computed property
}

function openCreateModal() {
  isEditing.value = false;
  resetForm();
  showModal.value = true;
}

function editHoliday(holiday) {
  isEditing.value = true;
  holidayForm.id = holiday.id;
  holidayForm.name = holiday.name;
  holidayForm.date = holiday.date;
  holidayForm.isRecurring = holiday.isRecurring;
  holidayForm.description = holiday.description || '';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  resetForm();
}

function resetForm() {
  holidayForm.id = null;
  holidayForm.name = '';
  holidayForm.date = '';
  holidayForm.isRecurring = false;
  holidayForm.description = '';
}

async function saveHoliday() {
  isSaving.value = true;
  
  try {
    const holidayData = {
      name: holidayForm.name,
      date: holidayForm.date,
      isRecurring: holidayForm.isRecurring,
      description: holidayForm.description
    };

    if (isEditing.value) {
      await HolidayService.updateHoliday(holidayForm.id, holidayData);
      toast.success('Holiday updated successfully');
    } else {
      await HolidayService.createHoliday(holidayData);
      toast.success('Holiday created successfully');
    }

    closeModal();
    await fetchHolidays();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to save holiday');
  } finally {
    isSaving.value = false;
  }
}

async function deleteHoliday(holiday) {
  if (!confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
    return;
  }

  try {
    await HolidayService.deleteHoliday(holiday.id);
    toast.success('Holiday deleted successfully');
    await fetchHolidays();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete holiday');
  }
}

// Utility functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return today.toDateString() === date.toDateString();
}

function isPast(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return date < today && !isToday(dateString);
}

function isFuture(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return date > today;
}

function getStatusClass(dateString) {
  if (isToday(dateString)) return 'today';
  if (isPast(dateString)) return 'past';
  return 'upcoming';
}

function getStatusText(dateString) {
  if (isToday(dateString)) return 'Today';
  if (isPast(dateString)) return 'Past';
  return 'Upcoming';
}

onMounted(() => {
  fetchHolidays();
});
</script>

<style scoped>
.holidays-management {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h1 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-content .subtitle {
  color: #718096;
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

/* Filters */
.filters-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.filter-group .form-control {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* Loading & Error */
.loading-section {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner i {
  font-size: 2rem;
  color: #4299e1;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn {
  margin-left: auto;
}

/* Stats */
.holidays-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #4299e1;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* No holidays */
.no-holidays {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.no-holidays i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-holidays h3 {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
}

/* Holidays Grid */
.holidays-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.holiday-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.holiday-card.past {
  border-left-color: #a0aec0;
  opacity: 0.8;
}

.holiday-card.today {
  border-left-color: #4299e1;
  box-shadow: 0 4px 16px rgba(66, 153, 225, 0.2);
}

.holiday-card.upcoming {
  border-left-color: #48bb78;
}

.holiday-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.holiday-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.holiday-name {
  margin: 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

.holiday-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.badge.recurring {
  background: #e6fffa;
  color: #38b2ac;
}

.badge.status.past {
  background: #f7fafc;
  color: #a0aec0;
}

.badge.status.today {
  background: #ebf8ff;
  color: #4299e1;
}

.badge.status.upcoming {
  background: #f0fff4;
  color: #48bb78;
}

.holiday-content {
  padding: 0 1.5rem 1rem;
}

.holiday-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.holiday-description {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.4;
}

.holiday-actions {
  padding: 1rem 1.5rem;
  background: #f7fafc;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content.holiday-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #718096;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.required {
  color: #e53e3e;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #4a5568;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #4299e1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .holidays-management {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    flex-direction: column;
  }

  .filters-section {
    flex-direction: column;
    gap: 1rem;
  }

  .holidays-stats {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .holidays-grid {
    grid-template-columns: 1fr;
  }

  .holiday-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .holiday-badges {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style> 