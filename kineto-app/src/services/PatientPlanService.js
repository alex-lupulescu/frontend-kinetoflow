// src/services/PatientPlanService.js (Complete File - Simplified)
import apiClient from './api';

const PatientPlanService = {
    assignPlanToPatient(patientId, planData) {
        return apiClient.post(`/medic/patients/${patientId}/plans`, planData);
    },
    getPlansForPatient(patientId) {
        return apiClient.get(`/medic/patients/${patientId}/plans`);
    },
    getMyActivePlans() {
        return apiClient.get('/patient/my-plans'); // Assumes endpoint exists
    },
    updatePlanItemQuantities(planItemId, quantityData) {
        // quantityData: { totalQuantity, remainingQuantity }
        return apiClient.put(`/medic/patient-plan-items/${planItemId}/quantities`, quantityData);
    },

    // --- Status Update Methods (using PATCH) ---
    updatePlanStatus(planId, isActive) { // Handles both Activate & Deactivate
        return apiClient.patch(`/medic/patient-plans/${planId}/status`, { isActive });
    },
    updatePlanItemStatus(planItemId, isItemActive) { // Handles both Activate & Deactivate
        return apiClient.patch(`/medic/patient-plan-items/${planItemId}/status`, { isItemActive });
    },

    // --- Archive Methods (using DELETE) --- ADDED BACK
    archivePatientPlan(planId) {
        return apiClient.delete(`/medic/patient-plans/${planId}`);
    },
    archivePatientPlanItem(planItemId) {
        return apiClient.delete(`/medic/patient-plan-items/${planItemId}`);
    },

    // --- Restore methods call the update methods ---
    restorePatientPlan(planId) {
        return this.updatePlanStatus(planId, true); // Use PATCH isActive:true
    },
    restorePatientPlanItem(planItemId) {
        return this.updatePlanItemStatus(planItemId, true); // Use PATCH isItemActive:true
    }
};

export default PatientPlanService;