import apiClient from './api';

/**
 * Service for handling notification-related API calls.
 */
class NotificationService {
    
    /**
     * Get paginated notifications for the current user with advanced filtering.
     * @param {object} params - Query parameters
     * @param {number} params.page - Page number (0-based)
     * @param {number} params.size - Page size
     * @param {string} params.sort - Sort criteria (e.g., 'createdAt,desc')
     * @param {boolean} params.isRead - Filter by read status
     * @param {string} params.type - Filter by notification type
     * @returns {Promise} API response with paginated notifications
     */
    async getNotifications(params = {}) {
        const {
            page = 0,
            size = 20,
            sort = 'createdAt,desc',
            isRead,
            type
        } = params;

        const queryParams = { page, size, sort };
        
        // Only add filters if they have values
        if (isRead !== undefined) {
            queryParams.isRead = isRead;
        }
        if (type) {
            queryParams.type = type;
        }

        return apiClient.get('/notifications', {
            params: queryParams
        });
    }

    /**
     * Get recent notifications for dropdown/dashboard.
     * @param {number} limit - Maximum number of notifications to return
     * @returns {Promise} API response with recent notifications
     */
    async getRecentNotifications(limit = 5) {
        return apiClient.get('/notifications/recent', {
            params: { limit }
        });
    }

    /**
     * Get the count of unread notifications.
     * @returns {Promise} API response with unread count
     */
    async getUnreadCount() {
        return apiClient.get('/notifications/unread-count');
    }

    /**
     * Mark a specific notification as read.
     * @param {number} notificationId - The ID of the notification to mark as read
     * @returns {Promise} API response with updated notification
     */
    async markAsRead(notificationId) {
        return apiClient.put(`/notifications/${notificationId}/read`);
    }

    /**
     * Mark all notifications as read.
     * @returns {Promise} API response with update count
     */
    async markAllAsRead() {
        return apiClient.put('/notifications/mark-all-read');
    }

    /**
     * Delete a specific notification.
     * @param {number} notificationId - The ID of the notification to delete
     * @returns {Promise} API response
     */
    async deleteNotification(notificationId) {
        return apiClient.delete(`/notifications/${notificationId}`);
    }

    /**
     * Clear all notifications for the current user.
     * @returns {Promise} API response
     */
    async clearAllNotifications() {
        return apiClient.delete('/notifications/clear-all');
    }

    /**
     * Get notifications by type.
     * @param {string} type - The notification type
     * @returns {Promise} API response with notifications of specified type
     */
    async getNotificationsByType(type) {
        return apiClient.get(`/notifications/by-type/${type}`);
    }

    /**
     * Create a new notification (admin only).
     * @param {object} notificationData - The notification data
     * @returns {Promise} API response with created notification
     */
    async createNotification(notificationData) {
        return apiClient.post('/notifications', notificationData);
    }
}

export default new NotificationService(); 