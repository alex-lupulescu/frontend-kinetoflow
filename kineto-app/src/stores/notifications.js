import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import NotificationService from '@/services/NotificationService';
import { useToast } from 'vue-toastification';

export const useNotificationStore = defineStore('notifications', () => {
    const toast = useToast();

    // --- State ---
    const notifications = ref([]);
    const unreadCount = ref(0);
    const totalCount = ref(0);
    const isLoading = ref(false);
    const isLoadingCount = ref(false);
    const lastFetchTime = ref(null);

    // --- Getters ---
    const unreadNotifications = computed(() => 
        notifications.value.filter(notification => !notification.read)
    );

    const readNotifications = computed(() => 
        notifications.value.filter(notification => notification.read)
    );

    const hasUnreadNotifications = computed(() => unreadCount.value > 0);

    // --- Actions ---

    /**
     * Fetch recent notifications for dropdown/dashboard
     * @param {number} limit - Maximum number of notifications to fetch
     */
    async function fetchRecentNotifications(limit = 10) {
        if (isLoading.value) return;
        
        isLoading.value = true;
        try {
            const response = await NotificationService.getRecentNotifications(limit);
            notifications.value = response.data || [];
            lastFetchTime.value = new Date();
        } catch (error) {
            console.error('Failed to fetch recent notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Fetch paginated notifications with advanced filtering
     * @param {object} params - Query parameters for filtering and pagination
     */
    async function fetchNotifications(params = {}) {
        if (isLoading.value) return;
        
        isLoading.value = true;
        try {
            const {
                page = 0,
                size = 20,
                sort = 'createdAt,desc',
                isRead,
                type
            } = params;

            const response = await NotificationService.getNotifications({
                page,
                size,
                sort,
                isRead,
                type
            });
            
            // Always replace notifications for the notifications page
            notifications.value = response.data.content || [];
            totalCount.value = response.data.totalElements || 0;
            
            lastFetchTime.value = new Date();
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Fetch unread notification count
     */
    async function fetchUnreadCount() {
        if (isLoadingCount.value) return;
        
        isLoadingCount.value = true;
        try {
            const response = await NotificationService.getUnreadCount();
            unreadCount.value = response.data.unreadCount || 0;
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
            // Don't show toast for count errors as they're called frequently
        } finally {
            isLoadingCount.value = false;
        }
    }

    /**
     * Mark a notification as read
     * @param {number} notificationId - The ID of the notification to mark as read
     */
    async function markAsRead(notificationId) {
        try {
            // Find the notification before making the API call
            const notification = notifications.value.find(n => n.id === notificationId);
            const wasUnread = notification && !notification.read;
            
            // Make API call
            const response = await NotificationService.markAsRead(notificationId);
            
            // Update local state only if the notification was actually unread
            if (notification && wasUnread) {
                notification.read = true;
                unreadCount.value = Math.max(0, unreadCount.value - 1);
            } else if (notification) {
                // Notification was already read
            } else {
                console.warn(`Notification ${notificationId} not found in local state`);
                // Refresh unread count from server to ensure consistency
                await fetchUnreadCount();
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            toast.error('Failed to mark notification as read');
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    async function markAllAsRead() {
        try {
            const response = await NotificationService.markAllAsRead();
            
            // Update local state
            notifications.value.forEach(notification => {
                notification.read = true;
            });
            unreadCount.value = 0;
            
            // Ensure consistency by refreshing unread count
            await fetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
            throw error;
        }
    }

    /**
     * Delete a notification
     * @param {number} notificationId - The ID of the notification to delete
     */
    async function deleteNotification(notificationId) {
        try {
            await NotificationService.deleteNotification(notificationId);
            
            // Update local state
            const notificationIndex = notifications.value.findIndex(n => n.id === notificationId);
            if (notificationIndex !== -1) {
                const notification = notifications.value[notificationIndex];
                if (!notification.read) {
                    unreadCount.value = Math.max(0, unreadCount.value - 1);
                }
                notifications.value.splice(notificationIndex, 1);
                totalCount.value = Math.max(0, totalCount.value - 1);
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
            throw error;
        }
    }

    /**
     * Clear all notifications
     */
    async function clearAllNotifications() {
        try {
            await NotificationService.clearAllNotifications();
            
            // Update local state
            notifications.value = [];
            unreadCount.value = 0;
            totalCount.value = 0;
        } catch (error) {
            console.error('Failed to clear all notifications:', error);
            toast.error('Failed to clear all notifications');
            throw error;
        }
    }

    /**
     * Add a new notification to the store (for real-time updates)
     * @param {object} notification - The notification to add
     */
    function addNotification(notification) {
        notifications.value.unshift(notification);
        if (!notification.read) {
            unreadCount.value += 1;
        }
        totalCount.value += 1;
    }

    /**
     * Clear all notifications from the store
     */
    function clearNotifications() {
        notifications.value = [];
        unreadCount.value = 0;
        totalCount.value = 0;
        lastFetchTime.value = null;
    }

    /**
     * Refresh notifications and unread count
     */
    async function refreshNotifications() {
        await Promise.all([
            fetchRecentNotifications(),
            fetchUnreadCount()
        ]);
    }

    /**
     * Check if notifications need to be refreshed (based on time)
     * @param {number} maxAgeMinutes - Maximum age in minutes before refresh is needed
     */
    function needsRefresh(maxAgeMinutes = 5) {
        if (!lastFetchTime.value) return true;
        
        const now = new Date();
        const diffMinutes = (now - lastFetchTime.value) / (1000 * 60);
        return diffMinutes > maxAgeMinutes;
    }

    /**
     * Auto-refresh notifications if needed
     */
    async function autoRefresh() {
        if (needsRefresh()) {
            await refreshNotifications();
        } else {
            // Just refresh the count if notifications are recent
            await fetchUnreadCount();
        }
    }

    /**
     * Synchronize local state with server state
     */
    async function syncWithServer() {
        try {
            await Promise.all([
                fetchUnreadCount(),
                // Optionally refresh current notifications if we're on the notifications page
                // This could be called conditionally based on current route
            ]);
        } catch (error) {
            console.error('Failed to synchronize with server:', error);
        }
    }

    // --- Return store interface ---
    return {
        // State
        notifications,
        unreadCount,
        totalCount,
        isLoading,
        isLoadingCount,
        lastFetchTime,

        // Getters
        unreadNotifications,
        readNotifications,
        hasUnreadNotifications,

        // Actions
        fetchRecentNotifications,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        clearNotifications,
        refreshNotifications,
        needsRefresh,
        autoRefresh,
        syncWithServer
    };
}); 