import api from './api';

class EventDetailsService {
  /**
   * Fetch event details based on notification type and related entity ID
   * @param {string} type - Notification type (APPOINTMENT, PAYMENT, etc.)
   * @param {number} relatedEntityId - ID of the related entity
   * @returns {Promise} API response with event details
   */
  async getEventDetails(type, relatedEntityId) {
    if (!relatedEntityId) {
      throw new Error('Related entity ID is required');
    }

    const endpoint = this.getEndpointForType(type);
    if (!endpoint) {
      throw new Error(`No endpoint available for notification type: ${type}`);
    }

    try {
      const response = await api.get(`${endpoint}/${relatedEntityId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch ${type} details:`, error);
      throw error;
    }
  }

  /**
   * Get the appropriate API endpoint based on notification type
   * @param {string} type - Notification type
   * @returns {string} API endpoint
   */
  getEndpointForType(type) {
    const endpointMap = {
      'APPOINTMENT': '/appointments',
      'PAYMENT': '/payments',
      'PLAN_UPDATE': '/treatment-plans',
      'COMPANY': '/companies',
      'MEDIC_ASSIGNMENT': '/medic-assignments',
      'INVITATION': '/invitations/user'
    };

    return endpointMap[type] || null;
  }

  /**
   * Check if a notification type supports detailed event fetching
   * @param {string} type - Notification type
   * @returns {boolean} Whether the type supports event details
   */
  supportsEventDetails(type) {
    return ['APPOINTMENT', 'PAYMENT', 'PLAN_UPDATE', 'COMPANY', 'MEDIC_ASSIGNMENT', 'INVITATION'].includes(type);
  }
}

export default new EventDetailsService(); 