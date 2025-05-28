<template>
  <div 
    class="notification-item" 
    :class="{ 
      'unread': !notification.read, 
      'read': notification.read 
    }"
    @click="handleClick"
  >
    <div class="notification-content">
      <!-- Notification Icon based on type -->
      <div class="notification-type-icon">
        <i :class="getTypeIcon(notification.type)" :style="{ color: getTypeColor(notification.type) }"></i>
      </div>

      <!-- Notification Details -->
      <div class="notification-details">
        <h4 class="notification-title">{{ notification.title }}</h4>
        <p class="notification-message">{{ notification.message }}</p>
        <div class="notification-meta">
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          <span class="notification-type-label">{{ formatType(notification.type) }}</span>
        </div>
      </div>

      <!-- Unread Indicator -->
      <div v-if="!notification.read" class="unread-indicator"></div>
    </div>

    <!-- Action Buttons -->
    <div class="notification-actions" @click.stop>
      <button 
        @click="showDetailsModal"
        class="action-btn details-btn"
        title="View details"
      >
        <i class="fas fa-info-circle"></i>
      </button>
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

const emit = defineEmits(['mark-read', 'delete']);

// Local state for modal
const isModalVisible = ref(false);

// Methods
const handleClick = () => {
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
  emit('delete', props.notification.id);
};

const showDetailsModal = () => {
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

const handleMarkAsRead = (id) => {
  markAsRead();
};

const handleDelete = (id) => {
  deleteNotification();
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
    'GENERAL': '#0891f2'
  };
  return colorMap[type] || '#0891f2';
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
    return date.toLocaleDateString();
  }
};
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid var(--neutral-200);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background-color: var(--bg-secondary);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background-color: var(--primary-50);
  border-left: 3px solid var(--primary-500);
}

.notification-item.read {
  opacity: 0.7;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  flex: 1;
  gap: 0.75rem;
  position: relative;
}

.notification-type-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.125rem;
}

.notification-type-icon i {
  font-size: 0.9rem;
}

.notification-details {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--neutral-800);
  line-height: 1.3;
}

.notification-message {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: var(--neutral-600);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.notification-time {
  color: var(--neutral-400);
  font-weight: 500;
}

.notification-type-label {
  color: var(--neutral-600);
  background-color: var(--neutral-200);
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.unread-indicator {
  position: absolute;
  top: 0.5rem;
  right: -0.5rem;
  width: 8px;
  height: 8px;
  background-color: var(--error);
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.notification-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.details-btn {
  color: var(--primary-500);
}

.details-btn:hover {
  background-color: var(--primary-50);
}

.mark-read-btn {
  color: var(--success);
}

.mark-read-btn:hover {
  background-color: var(--secondary-50);
}

.delete-btn {
  color: var(--error);
}

.delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .notification-item {
    padding: 0.75rem;
  }
  
  .notification-actions {
    opacity: 1; /* Always show on mobile */
  }
  
  .notification-content {
    gap: 0.5rem;
  }
  
  .notification-type-icon {
    width: 28px;
    height: 28px;
  }
  
  .notification-type-icon i {
    font-size: 0.8rem;
  }
  
  .notification-title {
    font-size: 0.85rem;
  }
  
  .notification-message {
    font-size: 0.8rem;
  }
  
  .notification-meta {
    font-size: 0.7rem;
    gap: 0.5rem;
  }
}

/* Focus states for accessibility */
.action-btn:focus {
  outline: 2px solid #4a90e2;
  outline-offset: 2px;
}

.notification-item:focus {
  outline: 2px solid #4a90e2;
  outline-offset: -2px;
}
</style> 