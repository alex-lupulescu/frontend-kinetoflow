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
    }

    // Add methods for assigning plans, creating appointments later
};

export default MedicService;