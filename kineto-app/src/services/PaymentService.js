import apiClient from './api';

const PaymentService = {
    recordPayment(paymentData) {
        return apiClient.post('/medic/payments', paymentData);
    },

    getPaymentsForPlan(planId) {
        return apiClient.get(`/medic/patient-plans/${planId}/payments`);
    },

    getPatientPlansWithPaymentStatus(patientId) {
        return apiClient.get(`/medic/patients/${patientId}/plans-with-payments`);
    },

    getMedicPaymentSummary() {
        return apiClient.get('/medic/payments/summary');
    }
};

export default PaymentService; 