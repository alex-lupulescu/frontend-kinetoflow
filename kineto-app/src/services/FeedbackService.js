import apiClient from './api';

const FeedbackService = {
    // --- Patient (USER) endpoints ---
    
    /**
     * Creates new feedback for the patient's assigned medic
     */
    createFeedback(feedbackData) {
        return apiClient.post('/feedback/medic', feedbackData);
    },

    /**
     * Updates existing feedback for the patient's assigned medic
     */
    updateFeedback(feedbackData) {
        return apiClient.put('/feedback/medic', feedbackData);
    },

    /**
     * Gets existing feedback between patient and their medic
     */
    getMyFeedback() {
        return apiClient.get('/feedback/my-feedback');
    },

    // --- Medic endpoints ---

    /**
     * Gets feedback for the currently authenticated medic
     */
    getMyMedicFeedback() {
        return apiClient.get('/feedback/my-medic-feedback');
    },

    /**
     * Gets feedback statistics for the currently authenticated medic
     */
    getMyMedicStats() {
        return apiClient.get('/feedback/my-medic-stats');
    },

    /**
     * Gets feedback for a specific medic (accessible by medic themselves and company admins)
     */
    getMedicFeedback(medicId) {
        return apiClient.get(`/feedback/medic/${medicId}`);
    },

    /**
     * Gets feedback statistics for a specific medic
     */
    getMedicStats(medicId) {
        return apiClient.get(`/feedback/medic/${medicId}/stats`);
    },

    // --- Company Admin endpoints ---

    /**
     * Gets all feedback for the company
     */
    getCompanyFeedbacks() {
        return apiClient.get('/feedback/company');
    },

    /**
     * Gets feedback statistics for all medics in the company
     */
    getCompanyStats() {
        return apiClient.get('/feedback/company/stats');
    },

    /**
     * Updates feedback status (ACTIVE/HIDDEN)
     */
    updateFeedbackStatus(feedbackId, status) {
        return apiClient.patch(`/feedback/${feedbackId}/status`, { status });
    },

    /**
     * Creates a response to feedback
     */
    createFeedbackResponse(feedbackId, responseMessage) {
        return apiClient.post(`/feedback/${feedbackId}/response`, { responseMessage });
    },

    /**
     * Gets available feedback statuses
     */
    getFeedbackStatuses() {
        return apiClient.get('/feedback/statuses');
    }
};

export default FeedbackService; 