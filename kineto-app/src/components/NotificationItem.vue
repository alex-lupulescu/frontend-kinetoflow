<template>
  <div 
    class="notification-item" 
    :class="{ 
      'unread': !notification.isRead, 
      'read': notification.isRead 
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
      <div v-if="!notification.isRead" class="unread-indicator"></div>
    </div>

    <!-- Action Buttons -->
    <div class="notification-actions" @click.stop>
      <button 
        v-if="!notification.isRead"
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
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['mark-read', 'delete']);

// Methods
const handleClick = () => {
  if (!props.notification.isRead) {
    markAsRead();
  }
};

const markAsRead = () => {
  emit('mark-read', props.notification.id);
};

const deleteNotification = () => {
  emit('delete', props.notification.id);
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
    'APPOINTMENT': '#28a745',
    'PAYMENT': '#ffc107',
    'PLAN_UPDATE': '#17a2b8',
    'SYSTEM': '#6c757d',
    'INVITATION': '#007bff',
    'COMPANY': '#6f42c1',
    'MEDIC_ASSIGNMENT': '#20c997',
    'GENERAL': '#4a90e2'
  };
  return colorMap[type] || '#4a90e2';
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
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background-color: #f8f9ff;
  border-left: 3px solid #4a90e2;
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
  background-color: #f8f9fa;
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
  color: #2c3e50;
  line-height: 1.3;
}

.notification-message {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #6c757d;
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
  color: #9ca3af;
  font-weight: 500;
}

.notification-type-label {
  color: #6c757d;
  background-color: #e9ecef;
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
  background-color: #dc3545;
  border-radius: 50%;
  border: 2px solid white;
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

.mark-read-btn {
  color: #28a745;
}

.mark-read-btn:hover {
  background-color: rgba(40, 167, 69, 0.1);
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
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