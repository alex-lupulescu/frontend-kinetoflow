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

    cancelPatientInvitation(pendingUserId) {
        return apiClient.delete(`/medic/invites/${pendingUserId}/cancel`);
    },

    // --- General / Shared ---
    updateMyProfile(profileData) {
         return apiClient.put('/users/me/profile', profileData);
    }
};

export default UserService;