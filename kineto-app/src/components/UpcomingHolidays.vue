<template>
  <div class="upcoming-holidays">
    <div class="holidays-header">
      <h3><i class="fas fa-calendar-alt"></i> Upcoming Holidays</h3>
      <button v-if="holidays.length > 3" @click="showAll = !showAll" class="toggle-btn">
        <i class="fas" :class="showAll ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        {{ showAll ? 'Show Less' : 'Show All' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading holidays...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ error }}</span>
      <button @click="fetchHolidays" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="holidays.length === 0" class="no-holidays">
      <i class="fas fa-info-circle"></i>
      <span>No upcoming holidays</span>
    </div>

    <div v-else class="holidays-list">
      <div 
        v-for="(holiday, index) in displayedHolidays" 
        :key="holiday.id"
        class="holiday-item"
        :class="{ 'today': isToday(holiday.date) }"
      >
        <div class="holiday-icon">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="holiday-content">
          <h4 class="holiday-name">{{ holiday.name }}</h4>
          <p class="holiday-date">{{ formatDate(holiday.date) }}</p>
          <p v-if="holiday.description" class="holiday-description">{{ holiday.description }}</p>
        </div>
        <div class="holiday-meta">
          <span v-if="holiday.isRecurring" class="recurring-badge">
            <i class="fas fa-redo"></i>
          </span>
          <span class="days-until">
            {{ getDaysUntil(holiday.date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import HolidayService from '@/services/HolidayService';

// Props
const props = defineProps({
  maxDisplay: {
    type: Number,
    default: 3
  },
  showToggle: {
    type: Boolean,
    default: true
  }
});

// State
const holidays = ref([]);
const isLoading = ref(true);
const error = ref('');
const showAll = ref(false);

// Computed
const displayedHolidays = computed(() => {
  if (showAll.value || !props.showToggle) {
    return holidays.value;
  }
  return holidays.value.slice(0, props.maxDisplay);
});

// Methods
async function fetchHolidays() {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await HolidayService.getUpcomingHolidays();
    holidays.value = response.data || [];
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load holidays';
  } finally {
    isLoading.value = false;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
}

function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return today.toDateString() === date.toDateString();
}

function getDaysUntil(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  const timeDiff = date.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysDiff === 0) {
    return 'Today';
  } else if (daysDiff === 1) {
    return 'Tomorrow';
  } else if (daysDiff < 0) {
    return 'Past';
  } else if (daysDiff <= 7) {
    return `${daysDiff} days`;
  } else if (daysDiff <= 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(daysDiff / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
}

onMounted(() => {
  fetchHolidays();
});

// Expose fetchHolidays for parent components
defineExpose({
  fetchHolidays
});
</script>

<style scoped>
.upcoming-holidays {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.holidays-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
}

.holidays-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.loading-state,
.error-state,
.no-holidays {
  padding: 2rem;
  text-align: center;
  color: #718096;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.error-state {
  color: #e53e3e;
}

.retry-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #c53030;
}

.holidays-list {
  padding: 1rem;
}

.holiday-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.holiday-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-left-color: #667eea;
}

.holiday-item.today {
  background: rgba(102, 126, 234, 0.1);
  border-left-color: #667eea;
}

.holiday-item:last-child {
  margin-bottom: 0;
}

.holiday-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6f42c1, #805ad5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.holiday-content {
  flex: 1;
}

.holiday-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.holiday-date {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.holiday-description {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.3;
}

.holiday-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
}

.recurring-badge {
  background: rgba(56, 178, 172, 0.1);
  color: #38b2ac;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.days-until {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .holidays-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .toggle-btn {
    justify-content: center;
  }

  .holiday-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .holiday-meta {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
}
</style> 