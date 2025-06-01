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

    // --- Drag and Drop Update Methods ---

    /**
     * Update appointment time (for drag and drop)
     */
    async updateAppointmentTime(appointmentId, timeData) {
        try {
            const response = await apiClient.patch(`/medic/appointments/${appointmentId}/time`, timeData);
            return response.data;
        } catch (error) {
            console.error('Error updating appointment time:', error);
            throw error;
        }
    },

    /**
     * Update time block (for drag and drop)
     */
    async updateTimeBlock(timeBlockId, blockData) {
        try {
            const response = await apiClient.patch(`/medic/time-blocks/${timeBlockId}`, blockData);
            return response.data;
        } catch (error) {
            console.error('Error updating time block:', error);
            throw error;
        }
    },

    /**
     * Update vacation day (for drag and drop)
     */
    async updateVacationDay(vacationId, vacationData) {
        try {
            const response = await apiClient.patch(`/medic/vacation-days/${vacationId}`, vacationData);
            return response.data;
        } catch (error) {
            console.error('Error updating vacation day:', error);
            throw error;
        }
    },

    /**
     * Update extra work day (for drag and drop)
     */
    async updateExtraWorkDay(extraWorkId, extraWorkData) {
        try {
            const response = await apiClient.patch(`/medic/extra-work-days/${extraWorkId}`, extraWorkData);
            return response.data;
        } catch (error) {
            console.error('Error updating extra work day:', error);
            throw error;
        }
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

    /**
     * Get patient plans with payment status (for appointment booking)
     */
    async getPatientPlansWithPayments(patientId) {
        try {
            const response = await apiClient.get(`/medic/patients/${patientId}/plans-with-payments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching patient plans with payments:', error);
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
    },

    // --- Dashboard Data Methods ---

    /**
     * Get all patients assigned to the current medic
     */
    async getMyPatients() {
        try {
            const response = await apiClient.get('/medic/my-patients');
            return response;
        } catch (error) {
            console.error('Error fetching my patients:', error);
            throw error;
        }
    },

    /**
     * Get today's appointments for the current medic
     */
    async getTodaysAppointments() {
        try {
            const response = await apiClient.get('/medic/appointments/today');
            return response;
        } catch (error) {
            console.error('Error fetching today\'s appointments:', error);
            throw error;
        }
    },

    /**
     * Get feedback summary for the current medic
     */
    async getMyFeedbackSummary() {
        try {
            const response = await apiClient.get('/medic/feedback-summary');
            return response;
        } catch (error) {
            console.error('Error fetching feedback summary:', error);
            throw error;
        }
    },

    /**
     * Get today's schedule for the current medic (appointments with patient and service details)
     */
    async getTodaysSchedule() {
        try {
            const response = await apiClient.get('/medic/schedule/today');
            return response;
        } catch (error) {
            console.error('Error fetching today\'s schedule:', error);
            // Fallback to empty data if endpoint doesn't exist yet
            return { data: [] };
        }
    },

    /**
     * Get appointment details by ID
     */
    async getAppointmentDetails(appointmentId) {
        try {
            const response = await apiClient.get(`/appointments/${appointmentId}`);
            return response;
        } catch (error) {
            console.error('Error fetching appointment details:', error);
            throw error;
        }
    },

    /**
     * Get recent activities for the medic dashboard
     */
    async getRecentActivities() {
        try {
            const response = await apiClient.get('/medic/recent-activities');
            return response;
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            throw error;
        }
    }
};

export default MedicService;