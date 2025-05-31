import apiClient from '@/services/api';

export default {
    /**
     * Get all holidays for the company
     */
    async getCompanyHolidays() {
        try {
            const response = await apiClient.get('/holidays');
            return response;
        } catch (error) {
            console.error('Error fetching company holidays:', error);
            throw error;
        }
    },

    /**
     * Get holidays within a date range (for calendar integration)
     */
    async getHolidaysInRange(startDate, endDate) {
        try {
            const response = await apiClient.get('/holidays/range', {
                params: {
                    startDate: startDate,
                    endDate: endDate
                }
            });
            return response;
        } catch (error) {
            console.error('Error fetching holidays in range:', error);
            throw error;
        }
    },

    /**
     * Create a new holiday (company admin only)
     */
    async createHoliday(holidayData) {
        try {
            const response = await apiClient.post('/holidays', holidayData);
            return response;
        } catch (error) {
            console.error('Error creating holiday:', error);
            throw error;
        }
    },

    /**
     * Update an existing holiday (company admin only)
     */
    async updateHoliday(holidayId, holidayData) {
        try {
            const response = await apiClient.put(`/holidays/${holidayId}`, holidayData);
            return response;
        } catch (error) {
            console.error('Error updating holiday:', error);
            throw error;
        }
    },

    /**
     * Delete a holiday (company admin only)
     */
    async deleteHoliday(holidayId) {
        try {
            const response = await apiClient.delete(`/holidays/${holidayId}`);
            return response;
        } catch (error) {
            console.error('Error deleting holiday:', error);
            throw error;
        }
    },

    /**
     * Get holidays for current year (company admin only)
     */
    async getCurrentYearHolidays() {
        try {
            const response = await apiClient.get('/holidays/current-year');
            return response;
        } catch (error) {
            console.error('Error fetching current year holidays:', error);
            throw error;
        }
    },

    /**
     * Get upcoming holidays for any user in the company
     */
    async getUpcomingHolidays() {
        try {
            const response = await apiClient.get('/holidays/upcoming');
            return response;
        } catch (error) {
            console.error('Error fetching upcoming holidays:', error);
            throw error;
        }
    },

    /**
     * Check if a specific date is a holiday
     */
    async isHoliday(date) {
        try {
            const response = await apiClient.get('/holidays/check', {
                params: { date: date }
            });
            return response;
        } catch (error) {
            console.error('Error checking if date is holiday:', error);
            throw error;
        }
    },

    /**
     * Generate recurring holidays for next year (company admin only)
     */
    async generateRecurringHolidays() {
        try {
            const response = await apiClient.post('/holidays/generate-recurring');
            return response;
        } catch (error) {
            console.error('Error generating recurring holidays:', error);
            throw error;
        }
    }
}; 