<template>
  <div class="notification-icon-container">
    <button 
      @click="toggleDropdown" 
      class="notification-button"
      :class="{ 'has-notifications': hasUnreadNotifications }"
      :title="`${unreadCount} unread notifications`"
    >
      <i class="fas fa-bell notification-icon"></i>
      <span 
        v-if="unreadCount > 0" 
        class="notification-badge"
        :class="{ 'pulse': hasUnreadNotifications }"
      >
        {{ displayCount }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <div 
      v-if="isDropdownOpen" 
      class="notification-dropdown"
      @click.stop
    >
      <div class="dropdown-header">
        <h3>Notifications</h3>
        <div class="header-actions">
          <button 
            v-if="hasUnreadNotifications" 
            @click="markAllAsRead"
            class="mark-all-read-btn"
            :disabled="isMarkingAllRead"
          >
            <i class="fas fa-check-double"></i>
            Mark all read
          </button>
          <button @click="closeDropdown" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="dropdown-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading notifications...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="empty-state">
          <i class="fas fa-bell-slash"></i>
          <p>No notifications yet</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="notifications-list">
          <NotificationItem
            v-for="notification in notifications"
            :key="notification.id"
            :notification="notification"
            @mark-read="handleMarkAsRead"
            @delete="handleDelete"
          />
        </div>
      </div>

      <div class="dropdown-footer" v-if="notifications.length > 0">
        <router-link to="/app/notifications" class="view-all-link" @click="closeDropdown">
          View all notifications
        </router-link>
      </div>
    </div>

    <!-- Overlay -->
    <div 
      v-if="isDropdownOpen" 
      class="dropdown-overlay" 
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import NotificationItem from './NotificationItem.vue';

const notificationStore = useNotificationStore();

// Local state
const isDropdownOpen = ref(false);
const isMarkingAllRead = ref(false);

// Computed properties
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const hasUnreadNotifications = computed(() => notificationStore.hasUnreadNotifications);
const isLoading = computed(() => notificationStore.isLoading);

const displayCount = computed(() => {
  if (unreadCount.value > 99) return '99+';
  return unreadCount.value.toString();
});

// Methods
const toggleDropdown = async () => {
  if (isDropdownOpen.value) {
    closeDropdown();
  } else {
    await openDropdown();
  }
};

const openDropdown = async () => {
  isDropdownOpen.value = true;
  // Fetch recent notifications when opening dropdown
  await notificationStore.fetchRecentNotifications(10);
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const handleMarkAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

const handleDelete = async (notificationId) => {
  try {
    await notificationStore.deleteNotification(notificationId);
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
};

const markAllAsRead = async () => {
  if (isMarkingAllRead.value) return;
  
  isMarkingAllRead.value = true;
  try {
    await notificationStore.markAllAsRead();
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  } finally {
    isMarkingAllRead.value = false;
  }
};

// Auto-refresh notifications periodically
let refreshInterval;

onMounted(() => {
  // Initial load
  notificationStore.autoRefresh();
  
  // Set up periodic refresh (every 30 seconds)
  refreshInterval = setInterval(() => {
    notificationStore.autoRefresh();
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (isDropdownOpen.value && !event.target.closest('.notification-icon-container')) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-icon-container {
  position: relative;
  display: inline-block;
}

.notification-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.notification-button:hover {
  background-color: var(--primary-50);
  transform: translateY(-1px);
}

.notification-button.has-notifications:hover {
  background-color: var(--primary-100);
}

.notification-icon {
  font-size: 1.4rem;
  color: var(--neutral-500);
  transition: all 0.2s ease;
}

.notification-button.has-notifications .notification-icon {
  color: var(--primary-500);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: linear-gradient(135deg, var(--error), #dc2626);
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid var(--bg-primary);
  box-shadow: var(--shadow-medium);
  z-index: 10;
}

.notification-badge.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: var(--bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--neutral-200);
  z-index: 1050;
  overflow: hidden;
  margin-top: 0.5rem;
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid var(--neutral-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--neutral-800);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: var(--primary-500);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mark-all-read-btn:hover:not(:disabled) {
  background-color: var(--primary-50);
}

.mark-all-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-btn {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-content {
  max-height: 350px;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.loading-state i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #4a90e2;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #dee2e6;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.notifications-list {
  padding: 0;
}

.dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  text-align: center;
}

.view-all-link {
  color: #4a90e2;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #357abd;
  text-decoration: underline;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
  background: transparent;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .notification-dropdown {
    width: 320px;
    right: -1rem;
  }
}

@media (max-width: 480px) {
  .notification-dropdown {
    width: 280px;
    right: -2rem;
  }
}

/* Scrollbar styling */
.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 