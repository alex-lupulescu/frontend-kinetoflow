<template>
  <div class="star-rating">
    <span 
      v-for="star in 5" 
      :key="star"
      @click="setRating(star)"
      @mouseover="hoverRating = star"
      @mouseleave="hoverRating = 0"
      :class="['star', { 
        'filled': star <= (hoverRating || rating),
        'interactive': interactive,
        'hover': interactive && hoverRating > 0 && star <= hoverRating
      }]"
      :title="interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : `${rating} out of 5 stars`"
    >
      ★
    </span>
    <span v-if="showValue" class="rating-value">
      {{ rating ? `${rating}/5` : 'No rating' }}
    </span>
    <span v-if="showCount && count !== undefined" class="rating-count">
      ({{ count }} review{{ count !== 1 ? 's' : '' }})
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  rating: { 
    type: Number, 
    default: 0,
    validator: (value) => value >= 0 && value <= 5
  },
  interactive: { 
    type: Boolean, 
    default: false 
  },
  showValue: { 
    type: Boolean, 
    default: false 
  },
  showCount: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: undefined
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
});

const emit = defineEmits(['update:rating', 'rating-changed']);

const hoverRating = ref(0);

const setRating = (star) => {
  if (props.interactive) {
    emit('update:rating', star);
    emit('rating-changed', star);
  }
};
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star {
  color: #ddd;
  font-size: 1.5rem;
  transition: color 0.2s ease;
  user-select: none;
}

.star.filled {
  color: #ffc107;
}

.star.interactive {
  cursor: pointer;
}

.star.interactive:hover,
.star.hover {
  color: #ffb300;
  transform: scale(1.1);
}

.star.interactive.filled:hover {
  color: #ff8f00;
}

.rating-value {
  font-size: 0.9rem;
  color: var(--text-color, #333);
  font-weight: 500;
  margin-left: 0.5rem;
}

.rating-count {
  font-size: 0.85rem;
  color: var(--text-muted-color, #666);
  margin-left: 0.25rem;
}

/* Size variations */
.star-rating.small .star {
  font-size: 1rem;
}

.star-rating.large .star {
  font-size: 2rem;
}

/* Animation for interactive stars */
.star.interactive {
  transition: all 0.2s ease;
}

.star.interactive:active {
  transform: scale(0.95);
}

/* Accessibility improvements */
.star:focus {
  outline: 2px solid var(--primary-color, #007bff);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .star {
    font-size: 1.25rem;
  }
  
  .star-rating.large .star {
    font-size: 1.75rem;
  }
}
</style> 