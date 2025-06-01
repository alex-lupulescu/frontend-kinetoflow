import apiClient from './api';

const CompanyAdminService = {
    // --- Vacation Day Approval Management ---
    
    /**
     * Get pending vacation requests for approval
     */
    async getPendingVacationRequests() {
        try {
            const response = await apiClient.get('/company-admin/vacation-requests/pending');
            return response.data;
        } catch (error) {
            console.error('Error fetching pending vacation requests:', error);
            throw error;
        }
    },

    /**
     * Get vacation requests by status
     */
    async getVacationRequestsByStatus(status = null) {
        try {
            const params = status ? { status } : {};
            const response = await apiClient.get('/company-admin/vacation-requests', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching vacation requests:', error);
            throw error;
        }
    },

    /**
     * Approve or reject a vacation request
     */
    async processVacationApproval(vacationId, approvalData) {
        try {
            const response = await apiClient.put(`/company-admin/vacation-requests/${vacationId}/approval`, approvalData);
            return response.data;
        } catch (error) {
            console.error('Error processing vacation approval:', error);
            throw error;
        }
    },

    // --- Extra Work Day Approval Management ---
    
    /**
     * Get pending extra work requests for approval
     */
    async getPendingExtraWorkRequests() {
        try {
            const response = await apiClient.get('/company-admin/extra-work-requests/pending');
            return response.data;
        } catch (error) {
            console.error('Error fetching pending extra work requests:', error);
            throw error;
        }
    },

    /**
     * Get extra work requests by status
     */
    async getExtraWorkRequestsByStatus(status = null) {
        try {
            const params = status ? { status } : {};
            const response = await apiClient.get('/company-admin/extra-work-requests', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching extra work requests:', error);
            throw error;
        }
    },

    /**
     * Approve or reject an extra work request
     */
    async processExtraWorkApproval(extraWorkId, approvalData) {
        try {
            const response = await apiClient.put(`/company-admin/extra-work-requests/${extraWorkId}/approval`, approvalData);
            return response.data;
        } catch (error) {
            console.error('Error processing extra work approval:', error);
            throw error;
        }
    },

    // --- User Management ---
    
    /**
     * Get all medics for the company
     */
    async getMedics() {
        try {
            const response = await apiClient.get('/company-admin/medics');
            return response.data;
        } catch (error) {
            console.error('Error fetching medics:', error);
            throw error;
        }
    },

    /**
     * Get all patients for the company
     */
    async getPatients() {
        try {
            const response = await apiClient.get('/company-admin/patients');
            return response.data;
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    /**
     * Assign a medic to a patient
     */
    async assignMedicToPatient(patientId, medicId) {
        try {
            const response = await apiClient.patch(`/company-admin/patients/${patientId}/assign-medic`, { medicId });
            return response.data;
        } catch (error) {
            console.error('Error assigning medic to patient:', error);
            throw error;
        }
    },

    /**
     * Update user status (activate/deactivate)
     */
    async updateUserStatus(userId, isActive) {
        try {
            const response = await apiClient.patch(`/company-admin/users/${userId}/status`, { isActive });
            return response.data;
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    },

    // --- Reports Management ---

    /**
     * Generate medic activity report
     */
    async getMedicActivityReport(startDate = null, endDate = null) {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/company-admin/reports/medics-activity', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching medic activity report:', error);
            throw error;
        }
    },

    /**
     * Generate services utilization report
     */
    async getServicesUtilizationReport(startDate = null, endDate = null) {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/company-admin/reports/services-utilization', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching services utilization report:', error);
            throw error;
        }
    },

    /**
     * Generate patients activity report
     */
    async getPatientsActivityReport(startDate = null, endDate = null) {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/company-admin/reports/patients-activity', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching patients activity report:', error);
            throw error;
        }
    },

    /**
     * Generate financial overview report
     */
    async getFinancialOverviewReport(startDate = null, endDate = null) {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await apiClient.get('/company-admin/reports/financial-overview', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching financial overview report:', error);
            throw error;
        }
    },

    /**
     * Generate comprehensive company summary report
     */
    async getCompanySummaryReport(startDate = null, endDate = null) {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await apiClient.get('/company-admin/reports/company-summary', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching company summary report:', error);
            throw error;
        }
    },

    async getPaymentsReport(startDate = null, endDate = null) {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await apiClient.get('/company-admin/reports/payments', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching payments report:', error);
            throw error;
        }
    }
};

export default CompanyAdminService; 