// src/services/MedicService.js
import apiClient from './api';

const MedicService = {
    // Fetches active services for the medic's company
    getActiveCompanyServices() {
        return apiClient.get('/medic/company-services');
    },

    // Fetches active packages for the medic's company
    getActiveCompanyPackages() {
        return apiClient.get('/medic/company-packages');
    },

    // Fetches calendar events for the medic
    getCalendarEvents(startDate, endDate) {
        // Format dates to ISO string suitable for backend @DateTimeFormat
        const params = {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        };
        return apiClient.get('/medic/calendar/events', { params });
    },

    getPendingPatientInvites() {
        return apiClient.get('/medic/my-pending-invites');
    },
    
    createTimeBlock(blockData) {
        // blockData: { startTime, endTime, reason? } (Dates should be ISO strings)
        return apiClient.post('/medic/time-blocks', blockData);
    },

    createAppointment(appointmentData) {
        // appointmentData: { patientId, serviceId, scheduledStartTime, scheduledEndTime, notes?, patientPlanServiceItemId? }
        // Dates should be ISO strings
        return apiClient.post('/medic/appointments', appointmentData);
    },
    
    deleteTimeBlock(timeBlockId) {
        // timeBlockId is the numeric ID part (e.g., 45 from "block-45")
        return apiClient.delete(`/medic/time-blocks/${timeBlockId}`);
    },

    cancelAppointment(appointmentId, cancellationData) {
        // cancellationData: { newStatus: 'CANCELLED_BY_MEDIC' or 'CANCELLED_BY_PATIENT', cancellationReason?: '...' }
        return apiClient.patch(`/medic/appointments/${appointmentId}/cancel`, cancellationData);
    },

    /**
     * Mark appointment as completed (triggers feedback request)
     */
    async markAppointmentCompleted(appointmentId) {
        try {
            const response = await apiClient.patch(`/medic/appointments/${appointmentId}/complete`);
            return response.data;
        } catch (error) {
            console.error('Error marking appointment completed:', error);
            throw error;
        }
    },

    deleteAppointment(appointmentId) {
        return apiClient.delete(`/medic/appointments/${appointmentId}`);
    },

    // --- Medic Working Hours ---
    getMyWorkingHours() {
        return apiClient.get('/medic/working-hours');
    },

    setMyWorkingHours(workingHoursData) {
        // The backend expects a list of MedicWorkingHoursDto
        return apiClient.post('/medic/working-hours', workingHoursData);
    },

    // --- Vacation Days Management ---

    /**
     * Get all vacation days for the current medic
     */
    async getVacationDays() {
        try {
            const response = await apiClient.get('/medic/vacation-days');
            return response.data;
        } catch (error) {
            console.error('Error fetching vacation days:', error);
            throw error;
        }
    },

    /**
     * Add a new vacation period
     */
    async addVacationPeriod(vacationData) {
        try {
            const response = await apiClient.post('/medic/vacation-days', vacationData);
            return response.data;
        } catch (error) {
            console.error('Error adding vacation period:', error);
            throw error;
        }
    },

    /**
     * Delete a vacation period
     */
    async deleteVacationPeriod(vacationId) {
        try {
            const response = await apiClient.delete(`/medic/vacation-days/${vacationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting vacation period:', error);
            throw error;
        }
    },

    // --- Extra Work Days Management ---

    /**
     * Get all extra work days for the current medic
     */
    async getExtraWorkDays() {
        try {
            const response = await apiClient.get('/medic/extra-work-days');
            return response.data;
        } catch (error) {
            console.error('Error fetching extra work days:', error);
            throw error;
        }
    },

    /**
     * Add a new extra work day
     */
    async addExtraWorkDay(extraWorkData) {
        try {
            const response = await apiClient.post('/medic/extra-work-days', extraWorkData);
            return response.data;
        } catch (error) {
            console.error('Error adding extra work day:', error);
            throw error;
        }
    },

    /**
     * Delete an extra work day
     */
    async deleteExtraWorkDay(extraWorkId) {
        try {
            const response = await apiClient.delete(`/medic/extra-work-days/${extraWorkId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting extra work day:', error);
            throw error;
        }
    }
};

export default MedicService;