// src/services/UserService.js (Complete File)
import apiClient from './api';

const UserService = {
    // --- Company Admin specific ---
    getCompanyMedics() {
        return apiClient.get('/company-admin/medics');
    },
    getCompanyPatients() {
        return apiClient.get('/company-admin/patients');
    },
    updateUserStatus(userId, isActive) {
        return apiClient.patch(`/company-admin/users/${userId}/status`, { isActive });
    },
    assignMedicToPatient(patientId, medicId) {
        return apiClient.patch(`/company-admin/patients/${patientId}/assign-medic`, { medicId });
    },

    // --- Medic specific ---
    getAssignedPatients() { // NEW METHOD for logged-in medic
        return apiClient.get('/medic/my-patients');
    },

    updatePatientDetails(patientId, patientData) {
        return apiClient.put(`/medic/patients/${patientId}/details`, patientData);
    },

    cancelPatientInvitation(pendingUserId) {
        return apiClient.delete(`/medic/invites/${pendingUserId}/cancel`);
    },

    // --- General / Shared ---
    updateMyProfile(profileData) {
         return apiClient.put('/user/me/profile', profileData);
    },

    // --- User (Patient) specific ---
    getUpcomingAppointmentsDashboard(limit = 3) { // Added for patient dashboard
        return apiClient.get(`/user/dashboard/upcoming-appointments?limit=${limit}`);
    },
    getCurrentPlanDashboard() { // Added for patient dashboard
        return apiClient.get('/user/dashboard/current-plan');
    },
    getAllMyAppointments() { // Added for patient's "My Appointments" page
        return apiClient.get('/user/my-appointments');
    },
    getAllMyPlans() { // Added for patient's "My Plans" page
        return apiClient.get('/user/my-plans');
    },
    getMyPlanDetails(planId) { // Added for fetching full details for a single plan
        return apiClient.get(`/user/my-plans/${planId}`);
    }
};

export default UserService;