<template>
  <div class="medic-feedback-page">
    <div class="page-header">
      <h1>My Patient Feedback</h1>
      <p class="page-description">View feedback and ratings from your patients</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i> Loading your feedback...
    </div>

    <!-- Error State -->
    <div v-if="loadError" class="error-message">
      <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
      <button @click="fetchData" class="btn btn-sm btn-primary retry-btn">
        <i class="fas fa-redo"></i> Retry
      </button>
    </div>

    <!-- Content -->
    <div v-if="!isLoading && !loadError">
      <!-- Statistics Section -->
      <section class="stats-section">
        <div class="stats-card">
          <div class="stats-header">
            <h2>Your Rating Overview</h2>
            <i class="fas fa-chart-bar stats-icon"></i>
          </div>
          
          <div class="stats-content">
            <div class="main-rating">
              <div class="rating-display">
                <StarRating 
                  :rating="Math.round(stats.averageRating || 0)" 
                  :show-value="false"
                  size="large"
                />
                <span class="rating-number">
                  {{ stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A' }}
                </span>
              </div>
              <p class="rating-subtitle">
                Based on {{ stats.totalFeedbacks || 0 }} review{{ (stats.totalFeedbacks || 0) !== 1 ? 's' : '' }}
              </p>
            </div>

            <!-- Rating Distribution -->
            <div v-if="stats.ratingDistribution" class="rating-distribution">
              <h4>Rating Breakdown</h4>
              <div class="distribution-bars">
                <div 
                  v-for="rating in [5, 4, 3, 2, 1]" 
                  :key="rating" 
                  class="distribution-item"
                >
                  <span class="rating-label">{{ rating }} ⭐</span>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: getDistributionPercentage(rating) + '%' }"
                    ></div>
                  </div>
                  <span class="count">{{ stats.ratingDistribution[rating] || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feedback List Section -->
      <section class="feedback-section">
        <div class="section-header">
          <h2>Patient Reviews</h2>
          <div class="feedback-count">
            {{ feedbacks.length }} review{{ feedbacks.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- No Feedback State -->
        <div v-if="feedbacks.length === 0" class="no-feedback">
          <div class="no-feedback-icon">
            <i class="fas fa-star"></i>
          </div>
          <h3>No feedback yet</h3>
          <p>You haven't received any patient feedback yet. Keep providing excellent care!</p>
        </div>

        <!-- Feedback Items -->
        <div v-else class="feedback-list">
          <div 
            v-for="feedback in feedbacks" 
            :key="feedback.id" 
            class="feedback-item"
          >
            <div class="feedback-header">
              <div class="feedback-rating">
                <StarRating :rating="feedback.rating" :show-value="true" />
              </div>
              <div class="feedback-meta">
                <span class="patient-name">{{ feedback.patientName }}</span>
                <span class="feedback-date">{{ formatDate(feedback.createdAt) }}</span>
              </div>
            </div>

            <div v-if="feedback.message" class="feedback-message">
              <p>{{ feedback.message }}</p>
            </div>

            <div v-if="feedback.hasResponse" class="admin-response">
              <div class="response-header">
                <i class="fas fa-reply"></i>
                <span>Company Response</span>
                <span class="response-date">{{ formatDate(feedback.responseCreatedAt) }}</span>
              </div>
              <p class="response-message">{{ feedback.responseMessage }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import StarRating from '@/components/StarRating.vue';
import FeedbackService from '@/services/FeedbackService';
import { useToast } from 'vue-toastification';

const toast = useToast();

// Reactive data
const isLoading = ref(true);
const loadError = ref('');
const feedbacks = ref([]);
const stats = ref({});

// Methods
const fetchData = async () => {
  isLoading.value = true;
  loadError.value = '';

  try {
    // Fetch both feedback and stats in parallel
    const [feedbackResponse, statsResponse] = await Promise.all([
      FeedbackService.getMyMedicFeedback(),
      FeedbackService.getMyMedicStats()
    ]);

    feedbacks.value = feedbackResponse.data || [];
    stats.value = statsResponse.data || {};

  } catch (error) {
    console.error('Error fetching medic feedback:', error);
    const message = error.response?.data?.message || 'Failed to load feedback data.';
    loadError.value = message;
    toast.error(message);
  } finally {
    isLoading.value = false;
  }
};

const getDistributionPercentage = (rating) => {
  if (!stats.value.ratingDistribution || !stats.value.totalFeedbacks) {
    return 0;
  }
  const count = stats.value.ratingDistribution[rating] || 0;
  return (count / stats.value.totalFeedbacks) * 100;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.medic-feedback-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
  color: var(--dark-color, #333);
  font-size: 2rem;
}

.page-description {
  margin: 0;
  color: var(--text-muted-color, #666);
  font-size: 1.1rem;
}

.loading-indicator {
  text-align: center;
  padding: 3rem;
  color: var(--primary-color, #007bff);
  font-size: 1.1rem;
}

.loading-indicator i {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1.5rem;
  border-radius: var(--border-radius, 6px);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.retry-btn {
  margin-left: 1rem;
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
}

.stats-card {
  background: white;
  border-radius: var(--border-radius-large, 12px);
  box-shadow: var(--shadow-light, 0 2px 4px rgba(0, 0, 0, 0.1));
  padding: 2rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.stats-header h2 {
  margin: 0;
  color: var(--primary-color-dark, #333);
}

.stats-icon {
  font-size: 1.5rem;
  color: var(--primary-color, #007bff);
}

.stats-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: start;
}

.main-rating {
  text-align: center;
}

.rating-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rating-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-color, #007bff);
}

.rating-subtitle {
  margin: 0;
  color: var(--text-muted-color, #666);
  font-size: 0.95rem;
}

.rating-distribution h4 {
  margin: 0 0 1rem;
  color: var(--text-color, #333);
  font-size: 1.1rem;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.distribution-item {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  align-items: center;
  gap: 1rem;
}

.rating-label {
  font-size: 0.9rem;
  color: var(--text-color, #333);
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color, #007bff);
  transition: width 0.3s ease;
}

.count {
  font-size: 0.9rem;
  color: var(--text-muted-color, #666);
  text-align: right;
}

/* Feedback Section */
.feedback-section {
  background: white;
  border-radius: var(--border-radius-large, 12px);
  box-shadow: var(--shadow-light, 0 2px 4px rgba(0, 0, 0, 0.1));
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  margin: 0;
  color: var(--primary-color-dark, #333);
}

.feedback-count {
  background-color: var(--primary-color, #007bff);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.no-feedback {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-muted-color, #666);
}

.no-feedback-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.no-feedback h3 {
  margin: 0 0 1rem;
  color: var(--text-color, #333);
}

.no-feedback p {
  margin: 0;
  font-size: 1.1rem;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feedback-item {
  border: 1px solid #e9ecef;
  border-radius: var(--border-radius, 6px);
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.feedback-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.feedback-meta {
  text-align: right;
}

.patient-name {
  display: block;
  font-weight: 600;
  color: var(--text-color, #333);
  margin-bottom: 0.25rem;
}

.feedback-date {
  font-size: 0.85rem;
  color: var(--text-muted-color, #666);
}

.feedback-message {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: var(--border-radius, 6px);
  border-left: 4px solid var(--primary-color, #007bff);
}

.feedback-message p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-color, #333);
}

.admin-response {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e8f4fd;
  border-radius: var(--border-radius, 6px);
  border-left: 4px solid #17a2b8;
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
  font-weight: normal;
  color: #6c757d;
}

.response-message {
  margin: 0;
  color: #0c5460;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .feedback-meta {
    text-align: left;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style> 