import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import NotificationService from '@/services/NotificationService';
import { useToast } from 'vue-toastification';

export const useNotificationStore = defineStore('notifications', () => {
    const toast = useToast();

    // --- State ---
    const notifications = ref([]);
    const unreadCount = ref(0);
    const isLoading = ref(false);
    const isLoadingCount = ref(false);
    const lastFetchTime = ref(null);

    // --- Getters ---
    const unreadNotifications = computed(() => 
        notifications.value.filter(notification => !notification.isRead)
    );

    const readNotifications = computed(() => 
        notifications.value.filter(notification => notification.isRead)
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
            console.log('Fetching recent notifications...');
            const response = await NotificationService.getRecentNotifications(limit);
            notifications.value = response.data || [];
            lastFetchTime.value = new Date();
            console.log(`Fetched ${notifications.value.length} notifications`);
        } catch (error) {
            console.error('Failed to fetch recent notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Fetch paginated notifications
     * @param {number} page - Page number
     * @param {number} size - Page size
     * @param {boolean} unreadOnly - Whether to fetch only unread notifications
     */
    async function fetchNotifications(page = 0, size = 10, unreadOnly = false) {
        if (isLoading.value) return;
        
        isLoading.value = true;
        try {
            console.log(`Fetching notifications (page: ${page}, size: ${size}, unreadOnly: ${unreadOnly})`);
            const response = await NotificationService.getNotifications(page, size, unreadOnly);
            
            if (page === 0) {
                // Replace notifications for first page
                notifications.value = response.data.content || [];
            } else {
                // Append notifications for subsequent pages
                notifications.value.push(...(response.data.content || []));
            }
            
            lastFetchTime.value = new Date();
            console.log(`Fetched ${response.data.content?.length || 0} notifications`);
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
            console.log(`Unread notification count: ${unreadCount.value}`);
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
            console.log(`Marking notification ${notificationId} as read`);
            await NotificationService.markAsRead(notificationId);
            
            // Update local state
            const notification = notifications.value.find(n => n.id === notificationId);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                unreadCount.value = Math.max(0, unreadCount.value - 1);
            }
            
            console.log(`Notification ${notificationId} marked as read`);
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
            console.log('Marking all notifications as read');
            const response = await NotificationService.markAllAsRead();
            
            // Update local state
            notifications.value.forEach(notification => {
                notification.isRead = true;
            });
            unreadCount.value = 0;
            
            console.log(`Marked ${response.data.updatedCount} notifications as read`);
            toast.success(`Marked ${response.data.updatedCount} notifications as read`);
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
            console.log(`Deleting notification ${notificationId}`);
            await NotificationService.deleteNotification(notificationId);
            
            // Update local state
            const notificationIndex = notifications.value.findIndex(n => n.id === notificationId);
            if (notificationIndex !== -1) {
                const notification = notifications.value[notificationIndex];
                if (!notification.isRead) {
                    unreadCount.value = Math.max(0, unreadCount.value - 1);
                }
                notifications.value.splice(notificationIndex, 1);
            }
            
            console.log(`Notification ${notificationId} deleted`);
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete notification');
            throw error;
        }
    }

    /**
     * Add a new notification to the store (for real-time updates)
     * @param {object} notification - The notification to add
     */
    function addNotification(notification) {
        console.log('Adding new notification:', notification);
        notifications.value.unshift(notification);
        if (!notification.isRead) {
            unreadCount.value += 1;
        }
    }

    /**
     * Clear all notifications from the store
     */
    function clearNotifications() {
        console.log('Clearing all notifications from store');
        notifications.value = [];
        unreadCount.value = 0;
        lastFetchTime.value = null;
    }

    /**
     * Refresh notifications and unread count
     */
    async function refreshNotifications() {
        console.log('Refreshing notifications...');
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

    // --- Return store interface ---
    return {
        // State
        notifications,
        unreadCount,
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
        addNotification,
        clearNotifications,
        refreshNotifications,
        needsRefresh,
        autoRefresh
    };
}); 