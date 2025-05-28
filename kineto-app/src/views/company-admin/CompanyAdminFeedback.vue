<template>
  <div class="feedback-management-page">
    <header class="page-header">
      <h1><i class="fas fa-star"></i> Feedback Management</h1>
      <p class="page-subtitle">Manage and respond to patient feedback for your company</p>
    </header>

    <!-- Statistics Overview -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total-feedback">
          <div class="stat-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalFeedbacks }}</h3>
            <p>Total Feedback</p>
          </div>
        </div>
        
        <div class="stat-card average-rating">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h3>{{ averageRating }}</h3>
            <p>Average Rating</p>
          </div>
        </div>
        
        <div class="stat-card pending-responses">
          <div class="stat-icon">
            <i class="fas fa-reply"></i>
          </div>
          <div class="stat-content">
            <h3>{{ pendingResponses }}</h3>
            <p>Pending Responses</p>
          </div>
        </div>
        
        <div class="stat-card active-medics">
          <div class="stat-icon">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="stat-content">
            <h3>{{ activeMedics }}</h3>
            <p>Medics with Feedback</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Medic Statistics -->
    <section class="medic-stats-section">
      <div class="section-header">
        <h2><i class="fas fa-chart-bar"></i> Medic Performance</h2>
        <button @click="refreshStats" class="btn btn-secondary btn-sm" :disabled="isLoadingStats">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoadingStats }"></i>
          Refresh
        </button>
      </div>
      
      <div v-if="isLoadingStats" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading statistics...
      </div>
      
      <div v-else-if="medicStats.length === 0" class="empty-state">
        <i class="fas fa-chart-line"></i>
        <p>No medic statistics available yet.</p>
      </div>
      
      <div v-else class="medic-stats-grid">
        <div v-for="stat in medicStats" :key="stat.medicId" class="medic-stat-card">
          <div class="medic-header">
            <h4>{{ stat.medicName }}</h4>
            <span class="medic-email">{{ stat.medicEmail }}</span>
          </div>
          
          <div class="medic-metrics">
            <div class="metric">
              <span class="metric-label">Average Rating</span>
              <div class="rating-display">
                <StarRating :rating="stat.averageRating || 0" :show-value="true" size="small" />
              </div>
            </div>
            
            <div class="metric">
              <span class="metric-label">Total Feedback</span>
              <span class="metric-value">{{ stat.totalFeedbacks }}</span>
            </div>
            
            <div class="metric">
              <span class="metric-label">Active</span>
              <span class="metric-value active">{{ stat.activeFeedbacks }}</span>
            </div>
            
            <div class="metric">
              <span class="metric-label">Hidden</span>
              <span class="metric-value hidden">{{ stat.hiddenFeedbacks }}</span>
            </div>
          </div>
          
          <div class="rating-distribution">
            <h5>Rating Distribution</h5>
            <div class="distribution-bars">
              <div v-for="(count, rating) in stat.ratingDistribution" :key="rating" class="distribution-bar">
                <span class="rating-label">{{ rating }}★</span>
                <div class="bar-container">
                  <div class="bar" :style="{ width: getDistributionPercentage(count, stat.totalFeedbacks) + '%' }"></div>
                </div>
                <span class="count-label">{{ count }}</span>
              </div>
            </div>
          </div>
          
          <button @click="filterByMedic(stat.medicId, stat.medicName)" class="btn btn-outline btn-sm">
            <i class="fas fa-filter"></i> View Feedback
          </button>
        </div>
      </div>
    </section>

    <!-- Feedback List -->
    <section class="feedback-list-section">
      <div class="section-header">
        <h2><i class="fas fa-list"></i> All Feedback</h2>
        <div class="header-actions">
          <button @click="clearFilters" class="btn btn-secondary btn-sm" v-if="hasActiveFilters">
            <i class="fas fa-times"></i> Clear Filters
          </button>
          <button @click="refreshFeedback" class="btn btn-secondary btn-sm" :disabled="isLoadingFeedback">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoadingFeedback }"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="statusFilter">Status:</label>
          <select id="statusFilter" v-model="filters.status" @change="applyFilters">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="ratingFilter">Rating:</label>
          <select id="ratingFilter" v-model="filters.rating" @change="applyFilters">
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="responseFilter">Response:</label>
          <select id="responseFilter" v-model="filters.hasResponse" @change="applyFilters">
            <option value="">All</option>
            <option value="true">Has Response</option>
            <option value="false">No Response</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="medicFilter">Medic:</label>
          <select id="medicFilter" v-model="filters.medicId" @change="applyFilters">
            <option value="">All Medics</option>
            <option v-for="stat in medicStats" :key="stat.medicId" :value="stat.medicId">
              {{ stat.medicName }}
            </option>
          </select>
        </div>
      </div>

      <!-- Feedback Cards -->
      <div v-if="isLoadingFeedback" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i> Loading feedback...
      </div>
      
      <div v-else-if="filteredFeedback.length === 0" class="empty-state">
        <i class="fas fa-comments"></i>
        <p>{{ hasActiveFilters ? 'No feedback matches your filters.' : 'No feedback available yet.' }}</p>
      </div>
      
      <div v-else class="feedback-grid">
        <div v-for="feedback in filteredFeedback" :key="feedback.id" class="feedback-card">
          <div class="feedback-header">
            <div class="patient-info">
              <h4>{{ feedback.patientName }}</h4>
              <span class="patient-email">{{ feedback.patientEmail }}</span>
            </div>
            <div class="feedback-meta">
              <span class="feedback-date">{{ formatDate(feedback.createdAt) }}</span>
              <span :class="['status-badge', `status-${feedback.status.toLowerCase()}`]">
                {{ feedback.status }}
              </span>
            </div>
          </div>
          
          <div class="medic-info">
            <span class="medic-label">For:</span>
            <span class="medic-name">Dr. {{ feedback.medicName }}</span>
          </div>
          
          <div class="rating-section">
            <StarRating :rating="feedback.rating" :show-value="true" />
          </div>
          
          <div v-if="feedback.message" class="feedback-message">
            <p>"{{ feedback.message }}"</p>
          </div>
          
          <div v-if="feedback.hasResponse" class="response-section">
            <div class="response-header">
              <i class="fas fa-reply"></i>
              <span>Your Response</span>
              <span class="response-date">{{ formatDate(feedback.responseCreatedAt) }}</span>
            </div>
            <div class="response-message">
              <p>{{ feedback.responseMessage }}</p>
            </div>
          </div>
          
          <div class="feedback-actions">
            <button 
              @click="toggleFeedbackStatus(feedback)" 
              :class="['btn', 'btn-sm', feedback.status === 'ACTIVE' ? 'btn-warning' : 'btn-success']"
              :disabled="isUpdatingStatus === feedback.id"
            >
              <i v-if="isUpdatingStatus === feedback.id" class="fas fa-spinner fa-spin"></i>
              <i v-else :class="feedback.status === 'ACTIVE' ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              {{ feedback.status === 'ACTIVE' ? 'Hide' : 'Show' }}
            </button>
            
            <button 
              @click="openResponseModal(feedback)" 
              class="btn btn-primary btn-sm"
              :disabled="feedback.hasResponse"
            >
              <i class="fas fa-reply"></i>
              {{ feedback.hasResponse ? 'Responded' : 'Respond' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Response Modal -->
    <div v-if="showResponseModal" class="modal-overlay" @click.self="closeResponseModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Respond to Feedback</h3>
          <button @click="closeResponseModal" class="modal-close-button">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedFeedback" class="feedback-summary">
            <div class="summary-item">
              <span class="label">Patient:</span>
              <span class="value">{{ selectedFeedback.patientName }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Medic:</span>
              <span class="value">Dr. {{ selectedFeedback.medicName }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Rating:</span>
              <StarRating :rating="selectedFeedback.rating" :show-value="true" size="small" />
            </div>
            <div v-if="selectedFeedback.message" class="summary-item">
              <span class="label">Message:</span>
              <div class="feedback-text">{{ selectedFeedback.message }}</div>
            </div>
          </div>
          
          <form @submit.prevent="submitResponse" class="response-form">
            <div class="form-group">
              <label for="responseMessage">Your Response *</label>
              <textarea 
                id="responseMessage"
                v-model="responseForm.message"
                placeholder="Write your response to the patient..."
                maxlength="1000"
                rows="4"
                required
                :disabled="isSubmittingResponse"
              ></textarea>
              <div class="character-count">
                {{ responseForm.message.length }}/1000 characters
              </div>
            </div>
            
            <div v-if="responseError" class="error-message">
              {{ responseError }}
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeResponseModal" class="btn btn-secondary" :disabled="isSubmittingResponse">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!responseForm.message.trim() || isSubmittingResponse">
                <span v-if="isSubmittingResponse">
                  <i class="fas fa-spinner fa-spin"></i> Sending...
                </span>
                <span v-else>
                  <i class="fas fa-paper-plane"></i> Send Response
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import FeedbackService from '@/services/FeedbackService';
import StarRating from '@/components/StarRating.vue';

const toast = useToast();

// Data
const feedbackList = ref([]);
const medicStats = ref([]);
const isLoadingFeedback = ref(true);
const isLoadingStats = ref(true);
const isUpdatingStatus = ref(null);
const isSubmittingResponse = ref(false);

// Modal state
const showResponseModal = ref(false);
const selectedFeedback = ref(null);
const responseForm = ref({
  message: ''
});
const responseError = ref('');

// Filters
const filters = ref({
  status: '',
  rating: '',
  hasResponse: '',
  medicId: ''
});

// Computed properties
const totalFeedbacks = computed(() => {
  return medicStats.value.reduce((total, stat) => total + stat.totalFeedbacks, 0);
});

const averageRating = computed(() => {
  if (medicStats.value.length === 0) return '0.0';
  const totalRating = medicStats.value.reduce((sum, stat) => sum + (stat.averageRating || 0) * stat.totalFeedbacks, 0);
  const totalCount = medicStats.value.reduce((sum, stat) => sum + stat.totalFeedbacks, 0);
  return totalCount > 0 ? (totalRating / totalCount).toFixed(1) : '0.0';
});

const pendingResponses = computed(() => {
  return feedbackList.value.filter(feedback => !feedback.hasResponse).length;
});

const activeMedics = computed(() => {
  return medicStats.value.length;
});

const filteredFeedback = computed(() => {
  let filtered = [...feedbackList.value];
  
  if (filters.value.status) {
    filtered = filtered.filter(feedback => feedback.status === filters.value.status);
  }
  
  if (filters.value.rating) {
    filtered = filtered.filter(feedback => feedback.rating === parseInt(filters.value.rating));
  }
  
  if (filters.value.hasResponse !== '') {
    const hasResponse = filters.value.hasResponse === 'true';
    filtered = filtered.filter(feedback => feedback.hasResponse === hasResponse);
  }
  
  if (filters.value.medicId) {
    filtered = filtered.filter(feedback => feedback.medicId === parseInt(filters.value.medicId));
  }
  
  return filtered;
});

const hasActiveFilters = computed(() => {
  return filters.value.status || filters.value.rating || filters.value.hasResponse !== '' || filters.value.medicId;
});

// Methods
const fetchFeedback = async () => {
  isLoadingFeedback.value = true;
  try {
    const response = await FeedbackService.getCompanyFeedbacks();
    feedbackList.value = response.data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    toast.error('Failed to load feedback');
  } finally {
    isLoadingFeedback.value = false;
  }
};

const fetchStats = async () => {
  isLoadingStats.value = true;
  try {
    const response = await FeedbackService.getCompanyStats();
    medicStats.value = response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    toast.error('Failed to load statistics');
  } finally {
    isLoadingStats.value = false;
  }
};

const refreshFeedback = async () => {
  await fetchFeedback();
  toast.success('Feedback refreshed');
};

const refreshStats = async () => {
  await fetchStats();
  toast.success('Statistics refreshed');
};

const toggleFeedbackStatus = async (feedback) => {
  isUpdatingStatus.value = feedback.id;
  try {
    const newStatus = feedback.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    await FeedbackService.updateFeedbackStatus(feedback.id, newStatus);
    
    // Update local data
    const index = feedbackList.value.findIndex(f => f.id === feedback.id);
    if (index !== -1) {
      feedbackList.value[index].status = newStatus;
    }
    
    toast.success(`Feedback ${newStatus.toLowerCase()}`);
  } catch (error) {
    console.error('Error updating feedback status:', error);
    toast.error('Failed to update feedback status');
  } finally {
    isUpdatingStatus.value = null;
  }
};

const openResponseModal = (feedback) => {
  selectedFeedback.value = feedback;
  responseForm.value.message = '';
  responseError.value = '';
  showResponseModal.value = true;
};

const closeResponseModal = () => {
  showResponseModal.value = false;
  selectedFeedback.value = null;
  responseForm.value.message = '';
  responseError.value = '';
};

const submitResponse = async () => {
  if (!responseForm.value.message.trim()) {
    responseError.value = 'Response message is required';
    return;
  }
  
  isSubmittingResponse.value = true;
  responseError.value = '';
  
  try {
    await FeedbackService.createFeedbackResponse(
      selectedFeedback.value.id, 
      responseForm.value.message.trim()
    );
    
    // Update local data
    const index = feedbackList.value.findIndex(f => f.id === selectedFeedback.value.id);
    if (index !== -1) {
      feedbackList.value[index].hasResponse = true;
      feedbackList.value[index].responseMessage = responseForm.value.message.trim();
      feedbackList.value[index].responseCreatedAt = new Date().toISOString();
    }
    
    toast.success('Response sent successfully');
    closeResponseModal();
  } catch (error) {
    console.error('Error sending response:', error);
    responseError.value = error.response?.data?.message || 'Failed to send response';
  } finally {
    isSubmittingResponse.value = false;
  }
};

const filterByMedic = (medicId, medicName) => {
  filters.value.medicId = medicId.toString();
  applyFilters();
  toast.info(`Filtered by Dr. ${medicName}`);
};

const applyFilters = () => {
  // Filters are applied automatically through computed property
};

const clearFilters = () => {
  filters.value = {
    status: '',
    rating: '',
    hasResponse: '',
    medicId: ''
  };
  toast.info('Filters cleared');
};

const getDistributionPercentage = (count, total) => {
  return total > 0 ? (count / total) * 100 : 0;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchFeedback(),
    fetchStats()
  ]);
});
</script>

<style scoped>
.feedback-management-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-header h1 i {
  color: #ffc107;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 1.1rem;
}

/* Statistics Section */
.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
}

.stat-card.total-feedback {
  border-left-color: #007bff;
}

.stat-card.average-rating {
  border-left-color: #ffc107;
}

.stat-card.pending-responses {
  border-left-color: #dc3545;
}

.stat-card.active-medics {
  border-left-color: #28a745;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.total-feedback .stat-icon {
  background: #007bff;
}

.average-rating .stat-icon {
  background: #ffc107;
}

.pending-responses .stat-icon {
  background: #dc3545;
}

.active-medics .stat-icon {
  background: #28a745;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Medic Statistics Section */
.medic-stats-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.medic-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.medic-stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.medic-header h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.1rem;
}

.medic-email {
  color: #666;
  font-size: 0.9rem;
}

.medic-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.metric-value.active {
  color: #28a745;
}

.metric-value.hidden {
  color: #dc3545;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-distribution {
  margin: 1rem 0;
}

.rating-distribution h5 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.rating-label {
  width: 30px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #ffc107, #ffb300);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.count-label {
  width: 20px;
  text-align: right;
  color: #666;
}

/* Feedback List Section */
.feedback-list-section {
  margin-bottom: 2rem;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.filter-group select {
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.filter-group select:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
  transform: translateY(-1px);
}

.filter-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  transform: translateY(-1px);
}

.filter-group select::placeholder {
  color: #adb5bd;
  font-style: italic;
}

.filter-group select option {
  padding: 0.75rem;
  font-weight: 500;
  color: #495057;
  background: white;
}

.filter-group select option:hover {
  background: #f8f9fa;
}

/* Custom styling for different filter types */
.filter-group:nth-child(1) select:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.filter-group:nth-child(2) select:focus {
  border-color: #ffc107;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
}

.filter-group:nth-child(3) select:focus {
  border-color: #17a2b8;
  box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.1);
}

.filter-group:nth-child(4) select:focus {
  border-color: #6f42c1;
  box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.1);
}

/* Add subtle icons to filter labels */
.filter-group:nth-child(1) label::before {
  content: "📊 ";
  margin-right: 0.25rem;
}

.filter-group:nth-child(2) label::before {
  content: "⭐ ";
  margin-right: 0.25rem;
}

.filter-group:nth-child(3) label::before {
  content: "💬 ";
  margin-right: 0.25rem;
}

.filter-group:nth-child(4) label::before {
  content: "👨‍⚕️ ";
  margin-right: 0.25rem;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.feedback-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.patient-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.1rem;
}

.patient-email {
  color: #666;
  font-size: 0.9rem;
}

.feedback-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feedback-date {
  color: #666;
  font-size: 0.8rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-active {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-hidden {
  background: #f8d7da;
  color: #721c24;
}

.medic-info {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.medic-label {
  color: #666;
  font-size: 0.9rem;
}

.medic-name {
  color: #333;
  font-weight: 500;
  margin-left: 0.5rem;
}

.rating-section {
  margin-bottom: 1rem;
}

.feedback-message {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #007bff;
}

.feedback-message p {
  margin: 0;
  font-style: italic;
  color: #333;
  line-height: 1.4;
}

.response-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 3px solid #17a2b8;
}

.response-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #0c5460;
  font-weight: 500;
}

.response-date {
  margin-left: auto;
  font-size: 0.8rem;
  color: #666;
}

.response-message p {
  margin: 0;
  color: #0c5460;
  line-height: 1.4;
}

.feedback-actions {
  display: flex;
  gap: 0.75rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close-button:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 1.5rem 2rem 2rem;
}

.feedback-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  font-weight: 500;
  color: #666;
  min-width: 60px;
}

.summary-item .value {
  color: #333;
}

.feedback-text {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #007bff;
  font-style: italic;
  color: #333;
}

.response-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group label::before {
  content: "✍️ ";
  margin-right: 0.5rem;
}

.form-group textarea {
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  font-family: inherit;
  line-height: 1.5;
  background: white;
  color: #495057;
}

.form-group textarea:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group textarea::placeholder {
  color: #adb5bd;
  font-style: italic;
}

.character-count {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
  font-weight: 500;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-left: auto;
  width: fit-content;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Common Styles */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #666;
  text-align: center;
}

.loading-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #007bff;
}

.empty-state i {
  color: #999;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn:disabled::before {
  display: none;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #545b62);
  color: white;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #545b62, #495057);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  color: white;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e7e34, #155724);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #212529;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #e0a800, #d39e00);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.4);
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 2px solid #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.btn-outline:hover:not(:disabled) {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.3);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 6px;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 6px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .feedback-management-page {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .medic-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .feedback-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .feedback-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style> 