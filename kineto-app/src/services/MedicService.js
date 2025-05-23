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
    }
    // Add methods for assigning plans, creating appointments later
};

export default MedicService;