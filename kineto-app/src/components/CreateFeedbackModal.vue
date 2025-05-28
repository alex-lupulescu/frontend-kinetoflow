<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isUpdate ? 'Update Your Feedback' : 'Rate Your Experience' }}</h2>
        <button @click="closeModal" class="modal-close-button" title="Close">×</button>
      </div>

      <div class="modal-body">
        <div class="medic-info">
          <h3>{{ medicName }}</h3>
          <p class="medic-subtitle">How was your experience with this medic?</p>
        </div>

        <form @submit.prevent="submitFeedback" class="feedback-form">
          <div class="form-group rating-group">
            <label class="form-label">Your Rating *</label>
            <StarRating 
              v-model:rating="feedbackData.rating" 
              :interactive="true" 
              :show-value="true"
              size="large"
              @rating-changed="onRatingChanged"
            />
            <div v-if="ratingError" class="error-message">{{ ratingError }}</div>
          </div>
          
          <div class="form-group">
            <label for="message" class="form-label">Your Comments (Optional)</label>
            <textarea 
              id="message"
              v-model="feedbackData.message"
              placeholder="Share your experience with this medic..."
              maxlength="1000"
              rows="4"
              class="form-control"
            ></textarea>
            <div class="character-count">
              {{ feedbackData.message?.length || 0 }}/1000 characters
            </div>
          </div>

          <div v-if="submitError" class="error-message form-error">
            {{ submitError }}
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              @click="closeModal" 
              class="btn btn-cancel"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="!feedbackData.rating || isSubmitting"
            >
              <span v-if="isSubmitting">
                <i class="fas fa-spinner fa-spin"></i> 
                {{ isUpdate ? 'Updating...' : 'Submitting...' }}
              </span>
              <span v-else>
                <i class="fas fa-star"></i>
                {{ isUpdate ? 'Update Feedback' : 'Submit Feedback' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import StarRating from './StarRating.vue';
import FeedbackService from '@/services/FeedbackService';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  medicName: {
    type: String,
    required: true
  },
  existingFeedback: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:show', 'feedback-submitted']);

const toast = useToast();

// Reactive data
const feedbackData = reactive({
  rating: 0,
  message: ''
});

const isSubmitting = ref(false);
const ratingError = ref('');
const submitError = ref('');

// Computed properties
const isUpdate = computed(() => {
  return props.existingFeedback !== null && 
         props.existingFeedback !== undefined && 
         props.existingFeedback.id !== null && 
         props.existingFeedback.id !== undefined;
});

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    console.log('Modal opening with existingFeedback:', props.existingFeedback);
    console.log('isUpdate computed value:', isUpdate.value);
    resetForm();
    if (props.existingFeedback) {
      // Pre-populate form with existing feedback
      feedbackData.rating = props.existingFeedback.rating;
      feedbackData.message = props.existingFeedback.message || '';
    }
  }
});

watch(() => props.existingFeedback, (newValue) => {
  console.log('existingFeedback prop changed:', newValue);
  if (newValue && props.show) {
    feedbackData.rating = newValue.rating;
    feedbackData.message = newValue.message || '';
  }
});

// Methods
const closeModal = () => {
  emit('update:show', false);
  resetForm();
};

const resetForm = () => {
  feedbackData.rating = 0;
  feedbackData.message = '';
  ratingError.value = '';
  submitError.value = '';
  isSubmitting.value = false;
};

const onRatingChanged = (rating) => {
  if (rating > 0) {
    ratingError.value = '';
  }
};

const validateForm = () => {
  ratingError.value = '';
  submitError.value = '';

  if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
    ratingError.value = 'Please select a rating from 1 to 5 stars.';
    return false;
  }

  if (feedbackData.message && feedbackData.message.length > 1000) {
    submitError.value = 'Message cannot exceed 1000 characters.';
    return false;
  }

  return true;
};

const submitFeedback = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  submitError.value = '';

  try {
    const feedbackPayload = {
      rating: feedbackData.rating,
      message: feedbackData.message.trim() || null
    };

    let response;
    if (isUpdate.value) {
      response = await FeedbackService.updateFeedback(feedbackPayload);
      toast.success('Feedback updated successfully!');
    } else {
      response = await FeedbackService.createFeedback(feedbackPayload);
      toast.success('Thank you for your feedback!');
    }

    emit('feedback-submitted', response.data);
    closeModal();

  } catch (error) {
    console.error('Error submitting feedback:', error);
    const message = error.response?.data?.message || 
                   `Failed to ${isUpdate.value ? 'update' : 'submit'} feedback. Please try again.`;
    submitError.value = message;
    toast.error(message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-large, 12px);
  box-shadow: var(--shadow-large, 0 10px 25px rgba(0, 0, 0, 0.15));
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: var(--primary-color-dark, #333);
  font-size: 1.5rem;
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
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 1.5rem 2rem 2rem;
}

.medic-info {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.medic-info h3 {
  margin: 0 0 0.5rem;
  color: var(--primary-color, #007bff);
  font-size: 1.25rem;
}

.medic-subtitle {
  margin: 0;
  color: var(--text-muted-color, #666);
  font-size: 0.95rem;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-group {
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-color, #333);
  font-size: 0.95rem;
}

.form-control {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: var(--border-radius, 6px);
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 100px;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.character-count {
  font-size: 0.8rem;
  color: var(--text-muted-color, #666);
  text-align: right;
}

.error-message {
  color: var(--danger-color, #dc3545);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.form-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: var(--border-radius, 6px);
  margin-top: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius, 6px);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #e9ecef;
  color: #495057;
}

.btn-primary {
  background-color: var(--primary-color, #007bff);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-color-dark, #0056b3);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-header,
  .modal-body {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 