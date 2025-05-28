<template>
  <div class="notifications-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-bell"></i>
          Notifications
        </h1>
        <p class="page-subtitle">Manage and view all your notifications</p>
      </div>
      <div class="header-actions">
        <button 
          v-if="hasUnreadNotifications" 
          @click="markAllAsRead"
          class="btn btn-primary"
          :disabled="isMarkingAllRead"
        >
          <i class="fas fa-check-double"></i>
          <span v-if="!isMarkingAllRead">Mark All Read</span>
          <span v-else>
            <i class="fas fa-spinner fa-spin"></i>
            Marking...
          </span>
        </button>
        <button 
          @click="clearAllNotifications"
          class="btn btn-secondary"
          :disabled="isClearingAll"
        >
          <i class="fas fa-trash"></i>
          <span v-if="!isClearingAll">Clear All</span>
          <span v-else>
            <i class="fas fa-spinner fa-spin"></i>
            Clearing...
          </span>
        </button>
      </div>
    </div>

    <!-- Filters and Stats -->
    <div class="notifications-controls">
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon unread">
            <i class="fas fa-bell"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ unreadCount }}</span>
            <span class="stat-label">Unread</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="fas fa-list"></i>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ totalCount }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label for="statusFilter">Status:</label>
          <select id="statusFilter" v-model="filters.status" class="form-control">
            <option value="">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="typeFilter">Type:</label>
          <select id="typeFilter" v-model="filters.type" class="form-control">
            <option value="">All Types</option>
            <option value="APPOINTMENT">Appointments</option>
            <option value="PAYMENT">Payments</option>
            <option value="PLAN_UPDATE">Plan Updates</option>
            <option value="INVITATION">Invitations</option>
            <option value="COMPANY">Company</option>
            <option value="MEDIC_ASSIGNMENT">Medic Assignment</option>
            <option value="FEEDBACK_REQUEST">Feedback Requests</option>
            <option value="FEEDBACK_RECEIVED">Feedback Received</option>
            <option value="FEEDBACK_RESPONSE">Feedback Responses</option>
            <option value="SYSTEM">System</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="sortFilter">Sort by:</label>
          <select id="sortFilter" v-model="filters.sort" class="form-control">
            <option value="createdAt,desc">Newest First</option>
            <option value="createdAt,asc">Oldest First</option>
            <option value="isRead,asc">Unread First</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="notifications-content">
      <!-- Loading State -->
      <div v-if="isLoading && notifications.length === 0" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading notifications...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="notifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-bell-slash"></i>
        </div>
        <h3>No notifications found</h3>
        <p v-if="hasActiveFilters">Try adjusting your filters to see more notifications.</p>
        <p v-else>You don't have any notifications yet.</p>
        <button v-if="hasActiveFilters" @click="clearFilters" class="btn btn-primary">
          Clear Filters
        </button>
      </div>

      <!-- Notifications Grid -->
      <div v-else class="notifications-grid">
        <NotificationCard
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @mark-read="handleMarkAsRead"
          @delete="handleDelete"
          @view-details="handleViewDetails"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-section">
        <nav class="pagination-nav">
          <button 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="btn btn-secondary pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="['btn', page === currentPage ? 'btn-primary' : 'btn-secondary']"
              class="page-btn"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="btn btn-secondary pagination-btn"
          >
            Next
            <i class="fas fa-chevron-right"></i>
          </button>
        </nav>
        
        <div class="pagination-info">
          Showing {{ startItem }} - {{ endItem }} of {{ totalCount }} notifications
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notifications';
import { useToast } from 'vue-toastification';
import NotificationCard from '@/components/NotificationCard.vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const notificationStore = useNotificationStore();
const toast = useToast();
const authStore = useAuthStore();

// State
const isLoading = ref(false);
const isMarkingAllRead = ref(false);
const isClearingAll = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);

// Filters
const filters = ref({
  status: '',
  type: '',
  sort: 'createdAt,desc'
});

// Computed properties
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const totalCount = computed(() => notificationStore.totalCount);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));
const hasUnreadNotifications = computed(() => unreadCount.value > 0);

const hasActiveFilters = computed(() => {
  return filters.value.status || filters.value.type || filters.value.sort !== 'createdAt,desc';
});

const startItem = computed(() => {
  return totalCount.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * pageSize.value, totalCount.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Methods
const fetchNotifications = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value - 1, // Backend uses 0-based indexing
      size: pageSize.value,
      sort: filters.value.sort
    };

    if (filters.value.status === 'unread') {
      params.isRead = false;
    } else if (filters.value.status === 'read') {
      params.isRead = true;
    }

    if (filters.value.type) {
      params.type = filters.value.type;
    }

    await notificationStore.fetchNotifications(params);
    
    // Also refresh unread count to ensure consistency
    await notificationStore.fetchUnreadCount();
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    toast.error('Failed to load notifications');
  } finally {
    isLoading.value = false;
  }
};

const handleNotificationClick = async (notification) => {
  // Only mark as read if unread, don't navigate automatically
  if (!notification.isRead) {
    await handleMarkAsRead(notification.id);
  }
  
  // Don't navigate automatically - let user choose via "View Details" button
  // navigateToRelatedContent(notification);
};

const handleViewDetails = (notification) => {
  // Navigate to related content when user explicitly clicks "View Details"
  navigateToRelatedContent(notification);
};

const navigateToRelatedContent = (notification) => {
  try {
    const { type, relatedEntityId, relatedEntityType } = notification;
    
    switch (type) {
      case 'APPOINTMENT':
        if (relatedEntityId) {
          router.push(`/app/appointments/${relatedEntityId}`);
        } else {
          router.push('/app/appointments');
        }
        break;
        
      case 'PAYMENT':
        if (relatedEntityId) {
          router.push(`/app/payments/${relatedEntityId}`);
        } else {
          router.push('/app/payments');
        }
        break;
        
      case 'PLAN_UPDATE':
        if (relatedEntityId) {
          router.push(`/app/plans/${relatedEntityId}`);
        } else {
          router.push('/app/my-plan');
        }
        break;
        
      case 'INVITATION':
        router.push('/app/account');
        break;
        
      case 'COMPANY':
        router.push('/app/company/profile');
        break;
        
      case 'MEDIC_ASSIGNMENT':
        router.push('/app/medic/my-patients');
        break;
        
      case 'FEEDBACK_REQUEST':
        // Navigate to user dashboard where they can leave feedback
        router.push('/app/user/dashboard');
        break;
        
      case 'FEEDBACK_RECEIVED':
        // Navigate to medic feedback page to view received feedback
        if (authStore.userRole === 'MEDIC') {
          router.push('/app/medic/feedback');
        } else if (authStore.userRole === 'COMPANY_ADMIN') {
          router.push('/app/company/feedback');
        } else {
          router.push('/app/user/dashboard');
        }
        break;
        
      case 'FEEDBACK_RESPONSE':
        // Navigate to user dashboard to view company response
        router.push('/app/user/dashboard');
        break;
        
      default:
        // For SYSTEM and GENERAL notifications, stay on notifications page
        toast.info('Notification details viewed');
        break;
    }
  } catch (error) {
    console.error('Navigation error:', error);
    toast.error('Unable to navigate to related content');
  }
};

const handleMarkAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId);
    toast.success('Notification marked as read');
    
    // Sync to ensure consistency
    await notificationStore.syncWithServer();
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    toast.error('Failed to mark notification as read');
  }
};

const handleDelete = async (notificationId) => {
  try {
    await notificationStore.deleteNotification(notificationId);
    toast.success('Notification deleted');
    
    // Refresh if we're on the last page and it becomes empty
    if (notifications.value.length === 1 && currentPage.value > 1) {
      currentPage.value = currentPage.value - 1;
    }
    
    await fetchNotifications();
  } catch (error) {
    console.error('Failed to delete notification:', error);
    toast.error('Failed to delete notification');
  }
};

const markAllAsRead = async () => {
  if (isMarkingAllRead.value) return;
  
  isMarkingAllRead.value = true;
  try {
    await notificationStore.markAllAsRead();
    toast.success('All notifications marked as read');
    await fetchNotifications();
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    toast.error('Failed to mark all notifications as read');
  } finally {
    isMarkingAllRead.value = false;
  }
};

const clearAllNotifications = async () => {
  if (isClearingAll.value) return;
  
  if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
    return;
  }
  
  isClearingAll.value = true;
  try {
    await notificationStore.clearAllNotifications();
    toast.success('All notifications cleared');
    currentPage.value = 1;
    await fetchNotifications();
  } catch (error) {
    console.error('Failed to clear all notifications:', error);
    toast.error('Failed to clear all notifications');
  } finally {
    isClearingAll.value = false;
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const clearFilters = () => {
  filters.value = {
    status: '',
    type: '',
    sort: 'createdAt,desc'
  };
  currentPage.value = 1;
};

// Watchers
watch([filters, currentPage], () => {
  fetchNotifications();
}, { deep: true });

// Lifecycle
onMounted(async () => {
  await fetchNotifications();
  // Ensure we have the latest unread count
  await notificationStore.syncWithServer();
});
</script>

<style scoped>
.notifications-page {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-8);
  gap: var(--space-4);
}

.header-content h1 {
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-content h1 i {
  color: var(--primary-500);
}

.page-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--text-lg);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
  flex-shrink: 0;
}

.notifications-controls {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.stats-section {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  min-width: 120px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
}

.stat-icon.unread {
  background: var(--primary-100);
  color: var(--primary-600);
}

.stat-icon.total {
  background: var(--neutral-100);
  color: var(--neutral-600);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filters-section {
  display: flex;
  gap: var(--space-4);
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 150px;
}

.filter-group label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.notifications-content {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.loading-state,
.empty-state {
  padding: var(--space-16);
  text-align: center;
  color: var(--text-muted);
}

.loading-state i {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
  color: var(--primary-500);
}

.empty-state {
  padding: var(--space-20);
}

.empty-icon {
  margin-bottom: var(--space-6);
}

.empty-icon i {
  font-size: 4rem;
  color: var(--neutral-300);
}

.empty-state h3 {
  margin: 0 0 var(--space-4) 0;
  color: var(--text-secondary);
  font-size: var(--text-xl);
}

.empty-state p {
  margin: 0 0 var(--space-6) 0;
  color: var(--text-muted);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.notifications-grid {
  display: flex;
  flex-direction: column;
}

.pagination-section {
  padding: var(--space-6);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.pagination-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.page-numbers {
  display: flex;
  gap: var(--space-1);
}

.page-btn,
.pagination-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.pagination-info {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-page {
    padding: var(--space-4);
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions .btn {
    flex: 1;
  }

  .stats-section {
    flex-direction: column;
    gap: var(--space-3);
  }

  .stat-card {
    justify-content: center;
  }

  .filters-section {
    flex-direction: column;
    gap: var(--space-4);
  }

  .filter-group {
    min-width: auto;
  }

  .pagination-nav {
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .page-numbers {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: var(--space-2);
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: var(--text-2xl);
  }

  .page-numbers {
    gap: 1px;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    font-size: var(--text-sm);
  }
}
</style> 