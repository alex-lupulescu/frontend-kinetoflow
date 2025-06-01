<template>
  <div 
    class="notification-card" 
    :class="{ 
      'unread': !notification.read, 
      'read': notification.read
    }"
    @click="handleCardClick"
  >
    <!-- Notification Header -->
    <div class="notification-header">
      <div class="notification-type-info">
        <div class="notification-type-icon" :style="{ backgroundColor: getTypeBackgroundColor(notification.type) }">
          <i :class="getTypeIcon(notification.type)" :style="{ color: getTypeColor(notification.type) }"></i>
        </div>
        <div class="notification-meta">
          <span class="notification-type-label">{{ formatType(notification.type) }}</span>
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>
      </div>
      
      <div class="notification-status">
        <span v-if="!notification.read" class="unread-badge">New</span>
        <div class="notification-actions" @click.stop>
          <button 
            v-if="!notification.read"
            @click="markAsRead"
            class="action-btn mark-read-btn"
            title="Mark as read"
          >
            <i class="fas fa-check"></i>
          </button>
          <button 
            @click="deleteNotification"
            class="action-btn delete-btn"
            title="Delete notification"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Content -->
    <div class="notification-body">
      <h3 class="notification-title">{{ notification.title }}</h3>
      <p class="notification-message">{{ notification.message }}</p>
      
      <!-- Related Entity Info -->
      <div v-if="notification.relatedEntityId" class="related-entity">
        <i class="fas fa-link"></i>
        <span>{{ getRelatedEntityText(notification) }}</span>
      </div>
    </div>

    <!-- Notification Footer with View Details Button -->
    <div class="notification-footer">
      <button 
        @click.stop="showDetailsModal"
        class="view-details-btn"
        title="View notification details"
      >
        <i class="fas fa-info-circle"></i>
        <span>View Details</span>
      </button>
    </div>
  </div>

  <!-- Notification Details Modal -->
  <NotificationDetailsModal
    :notification="notification"
    :isVisible="isModalVisible"
    @close="closeModal"
    @mark-read="handleMarkAsRead"
    @delete="handleDelete"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import NotificationDetailsModal from './NotificationDetailsModal.vue';

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click', 'mark-read', 'delete', 'view-details']);

// Local state for modal
const isModalVisible = ref(false);

// Methods
const handleCardClick = () => {
  // Mark as read if not already read
  if (!props.notification.read) {
    markAsRead();
  }
  // Always show details modal when clicking on notification
  showDetailsModal();
};

const markAsRead = () => {
  emit('mark-read', props.notification.id);
};

const deleteNotification = () => {
  if (confirm('Are you sure you want to delete this notification?')) {
    emit('delete', props.notification.id);
  }
};

const showDetailsModal = () => {
  isModalVisible.value = true;
  // Also emit the view-details event for parent component navigation
  emit('view-details', props.notification);
};

const closeModal = () => {
  isModalVisible.value = false;
};

const handleMarkAsRead = (id) => {
  markAsRead();
  closeModal();
};

const handleDelete = (id) => {
  deleteNotification();
  closeModal();
};

const getTypeIcon = (type) => {
  const iconMap = {
    'APPOINTMENT': 'fas fa-calendar-check',
    'PAYMENT': 'fas fa-credit-card',
    'PLAN_UPDATE': 'fas fa-file-medical',
    'SYSTEM': 'fas fa-cog',
    'INVITATION': 'fas fa-user-plus',
    'COMPANY': 'fas fa-building',
    'MEDIC_ASSIGNMENT': 'fas fa-user-md',
    'FEEDBACK_REQUEST': 'fas fa-star',
    'FEEDBACK_RECEIVED': 'fas fa-comment-dots',
    'FEEDBACK_RESPONSE': 'fas fa-reply',
    'VACATION_REQUEST': 'fas fa-umbrella-beach',
    'VACATION_APPROVED': 'fas fa-check-circle',
    'VACATION_REJECTED': 'fas fa-times-circle',
    'EXTRA_WORK_REQUEST': 'fas fa-plus-circle',
    'EXTRA_WORK_APPROVED': 'fas fa-check-circle',
    'EXTRA_WORK_REJECTED': 'fas fa-times-circle',
    'GENERAL': 'fas fa-info-circle'
  };
  return iconMap[type] || 'fas fa-bell';
};

const getTypeColor = (type) => {
  const colorMap = {
    'APPOINTMENT': '#0891f2',
    'PAYMENT': '#22c55e',
    'PLAN_UPDATE': '#3b82f6',
    'SYSTEM': '#737373',
    'INVITATION': '#f97316',
    'COMPANY': '#8b5cf6',
    'MEDIC_ASSIGNMENT': '#10b981',
    'FEEDBACK_REQUEST': '#f59e0b',
    'FEEDBACK_RECEIVED': '#8b5cf6',
    'FEEDBACK_RESPONSE': '#06b6d4',
    'VACATION_REQUEST': '#f97316',
    'VACATION_APPROVED': '#22c55e',
    'VACATION_REJECTED': '#dc2626',
    'EXTRA_WORK_REQUEST': '#f97316',
    'EXTRA_WORK_APPROVED': '#22c55e',
    'EXTRA_WORK_REJECTED': '#dc2626',
    'GENERAL': '#0891f2'
  };
  return colorMap[type] || '#0891f2';
};

const getTypeBackgroundColor = (type) => {
  const colorMap = {
    'APPOINTMENT': '#f0f7ff',
    'PAYMENT': '#f0fdf4',
    'PLAN_UPDATE': '#eff6ff',
    'SYSTEM': '#f9fafb',
    'INVITATION': '#fff7ed',
    'COMPANY': '#faf5ff',
    'MEDIC_ASSIGNMENT': '#ecfdf5',
    'FEEDBACK_REQUEST': '#fef3c7',
    'FEEDBACK_RECEIVED': '#faf5ff',
    'FEEDBACK_RESPONSE': '#cffafe',
    'VACATION_REQUEST': '#fff7ed',
    'VACATION_APPROVED': '#f0fdf4',
    'VACATION_REJECTED': '#fef3c7',
    'EXTRA_WORK_REQUEST': '#fff7ed',
    'EXTRA_WORK_APPROVED': '#f0fdf4',
    'EXTRA_WORK_REJECTED': '#fef3c7',
    'GENERAL': '#f0f7ff'
  };
  return colorMap[type] || '#f0f7ff';
};

const formatType = (type) => {
  const typeMap = {
    'APPOINTMENT': 'Appointment',
    'PAYMENT': 'Payment',
    'PLAN_UPDATE': 'Plan Update',
    'SYSTEM': 'System',
    'INVITATION': 'Invitation',
    'COMPANY': 'Company',
    'MEDIC_ASSIGNMENT': 'Medic Assignment',
    'FEEDBACK_REQUEST': 'Feedback Request',
    'FEEDBACK_RECEIVED': 'Feedback Received',
    'FEEDBACK_RESPONSE': 'Feedback Response',
    'VACATION_REQUEST': 'Vacation Request',
    'VACATION_APPROVED': 'Vacation Approved',
    'VACATION_REJECTED': 'Vacation Rejected',
    'EXTRA_WORK_REQUEST': 'Extra Work Request',
    'EXTRA_WORK_APPROVED': 'Extra Work Approved',
    'EXTRA_WORK_REJECTED': 'Extra Work Rejected',
    'GENERAL': 'General'
  };
  return typeMap[type] || type;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else if (diffInMinutes < 10080) { // 7 days
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

const getRelatedEntityText = (notification) => {
  const { type, relatedEntityId } = notification;
  
  switch (type) {
    case 'APPOINTMENT':
      return `Appointment #${relatedEntityId}`;
    case 'PAYMENT':
      return `Payment #${relatedEntityId}`;
    case 'PLAN_UPDATE':
      return `Treatment Plan #${relatedEntityId}`;
    case 'INVITATION':
      return 'Account invitation';
    case 'COMPANY':
      return 'Company profile';
    case 'MEDIC_ASSIGNMENT':
      return 'Patient assignment';
    case 'VACATION_REQUEST':
    case 'VACATION_APPROVED':
    case 'VACATION_REJECTED':
      return `Vacation Request #${relatedEntityId}`;
    case 'EXTRA_WORK_REQUEST':
    case 'EXTRA_WORK_APPROVED':
    case 'EXTRA_WORK_REJECTED':
      return `Extra Work Request #${relatedEntityId}`;
    default:
      return `Related item #${relatedEntityId}`;
  }
};
</script>

<style scoped>
.notification-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.notification-card:last-child {
  margin-bottom: 0;
}

.notification-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-medium);
}

.notification-card.unread {
  background: var(--primary-50);
  border-left: 4px solid var(--primary-500);
}

.notification-card.read {
  opacity: 0.8;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.notification-type-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.notification-type-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  flex-shrink: 0;
}

.notification-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.notification-type-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notification-time {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.notification-status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.unread-badge {
  background: var(--primary-500);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notification-actions {
  display: flex;
  gap: var(--space-2);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-card:hover .notification-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  width: 32px;
  height: 32px;
}

.mark-read-btn {
  color: var(--success);
}

.mark-read-btn:hover {
  background-color: var(--secondary-50);
  color: var(--secondary-600);
}

.delete-btn {
  color: var(--error);
}

.delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.notification-body {
  margin-bottom: var(--space-4);
}

.notification-title {
  margin: 0 0 var(--space-3) 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
}

.notification-message {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.related-entity {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  width: fit-content;
}

.related-entity i {
  color: var(--primary-500);
}

.notification-footer {
  border-top: 1px solid var(--border-light);
  padding-top: var(--space-4);
  margin-top: var(--space-4);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.view-details-btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border: none;
  background: var(--primary-500);
  color: white;
}

.view-details-btn:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.view-details-btn:active {
  transform: translateY(0);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .notification-card {
    padding: var(--space-4);
    margin-bottom: var(--space-3);
  }

  .notification-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }

  .notification-status {
    justify-content: space-between;
  }

  .notification-actions {
    opacity: 1; /* Always show on mobile */
  }

  .notification-type-icon {
    width: 40px;
    height: 40px;
    font-size: var(--text-lg);
  }

  .notification-title {
    font-size: var(--text-base);
  }

  .notification-message {
    font-size: var(--text-sm);
  }

  .related-entity {
    font-size: var(--text-xs);
  }

  .notification-footer {
    justify-content: center;
    flex-direction: column;
  }

  .view-details-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .notification-card {
    padding: var(--space-3);
    border-radius: var(--radius-lg);
  }

  .notification-type-info {
    gap: var(--space-2);
  }

  .notification-type-icon {
    width: 36px;
    height: 36px;
    font-size: var(--text-base);
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: var(--text-xs);
  }

  .view-details-btn {
    font-size: var(--text-xs);
    padding: var(--space-2) var(--space-3);
  }
}

/* Focus states for accessibility */
.action-btn:focus,
.view-details-btn:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.notification-card:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
</style> 