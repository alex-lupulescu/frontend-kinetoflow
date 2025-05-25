<template>
    <div class="modal-overlay" @click.self="closeModal">
        <div class="modal-content record-payment-modal-content">
            <button @click="closeModal" class="modal-close-button" title="Close">×</button>
            <h2>Record Payment for {{ planDetails?.originatingPackageName || 'Custom Plan' }} (Plan ID: {{ planDetails?.id }})</h2>
            <p v-if="planDetails?.patientName">Patient: {{ planDetails.patientName }}</p>
            
            <form @submit.prevent="submitPayment" class="modal-form">
                <div class="form-group">
                    <label for="paymentAmount" class="form-label">Amount *</label>
                    <input type="number" id="paymentAmount" v-model.number="paymentForm.amount" required step="0.01" placeholder="e.g., 50.00 or -20.00 for refund" :disabled="isSubmitting" class="form-control">
                </div>

                <div class="form-group">
                    <label for="paymentDate" class="form-label">Payment Date *</label>
                    <input type="datetime-local" id="paymentDate" v-model="paymentForm.paymentDate" required :disabled="isSubmitting" class="form-control">
                </div>

                <div class="form-group">
                    <label for="paymentStatus" class="form-label">Payment Status *</label>
                    <select id="paymentStatus" v-model="paymentForm.status" required :disabled="isSubmitting" class="form-control">
                        <option disabled value="">-- Select Status --</option>
                        <option v-for="status in paymentStatuses" :key="status.value" :value="status.value">{{ status.label }}</option>
                    </select>
                    <small class="text-muted">Use negative amount for Refunded or Partial Refund statuses.</small>
                </div>

                <div class="form-group">
                    <label for="paymentMethod" class="form-label">Payment Method (Optional)</label>
                    <input type="text" id="paymentMethod" v-model="paymentForm.paymentMethod" placeholder="e.g., Credit Card, Cash" :disabled="isSubmitting" class="form-control">
                </div>

                <div class="form-group">
                    <label for="transactionId" class="form-label">Transaction ID (Optional)</label>
                    <input type="text" id="transactionId" v-model="paymentForm.transactionId" placeholder="e.g., ch_123xyz" :disabled="isSubmitting" class="form-control">
                </div>

                <div class="form-group">
                    <label for="paymentNotes" class="form-label">Notes (Optional)</label>
                    <textarea id="paymentNotes" v-model="paymentForm.notes" rows="3" placeholder="Any notes about this payment..." :disabled="isSubmitting" class="form-control"></textarea>
                </div>

                <div v-if="submissionError" class="error-message modal-error">{{ submissionError }}</div>

                <div class="modal-actions">
                    <button type="button" @click="closeModal" class="btn btn-cancel" :disabled="isSubmitting">Cancel</button>
                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isFormValid">
                        <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
                        <span v-else>Save Payment</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import PaymentService from '@/services/PaymentService';
import { useToast } from 'vue-toastification';

const props = defineProps({
    planDetails: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'payment-saved']);

const toast = useToast();

const paymentForm = reactive({
    planId: null,
    amount: null,
    paymentDate: new Date().toISOString().slice(0, 16), // Default to now, formatted for datetime-local
    status: 'COMPLETED', // Default status
    paymentMethod: '',
    transactionId: '',
    notes: ''
});

const paymentStatuses = ref([
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded (Full or Partial)' },
    // { value: 'PARTIAL_REFUND', label: 'Partial Refund' } // Backend supports this, can be split out if needed by UI
]);

const isSubmitting = ref(false);
const submissionError = ref('');

const isFormValid = computed(() => {
    return paymentForm.amount !== null && paymentForm.amount !== undefined && 
           paymentForm.paymentDate && 
           paymentForm.status;
});

watch(() => props.planDetails, (newPlan) => {
    if (newPlan) {
        paymentForm.planId = newPlan.id;
        // Reset other fields or pre-fill if necessary, e.g., for editing a payment (not current scope)
        paymentForm.amount = null;
        paymentForm.paymentDate = new Date().toISOString().slice(0, 16);
        paymentForm.status = 'COMPLETED';
        paymentForm.paymentMethod = '';
        paymentForm.transactionId = '';
        paymentForm.notes = '';
        submissionError.value = '';
    }
}, { immediate: true });

const closeModal = () => {
    if (!isSubmitting.value) {
        emit('close');
    }
};

const submitPayment = async () => {
    if (!isFormValid.value) {
        submissionError.value = "Please fill in all required fields.";
        return;
    }
    submissionError.value = '';
    isSubmitting.value = true;

    const payload = {
        planId: paymentForm.planId,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate + ":00Z", // Ensure seconds and Z for UTC if not handled by browser
        status: paymentForm.status,
        paymentMethod: paymentForm.paymentMethod || null,
        transactionId: paymentForm.transactionId || null,
        notes: paymentForm.notes || null,
    };

    try {
        await PaymentService.recordPayment(payload);
        toast.success('Payment recorded successfully!');
        emit('payment-saved');
        closeModal();
    } catch (error) {
        console.error("Error recording payment:", error);
        submissionError.value = error.response?.data?.message || 'Failed to record payment. Please check details and try again.';
        toast.error(submissionError.value);
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    // Initialize planId when component mounts and planDetails is available
    if (props.planDetails) {
        paymentForm.planId = props.planDetails.id;
    }
});

</script>

<style scoped>
/* Using similar modal styles from MedicMyPatients / MedicPatientPayments for consistency */
.modal-overlay {
    position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6);
    display: flex; justify-content: center; align-items: center;
    z-index: 1050; padding: 1rem;
}
.modal-content {
    background-color: #fff; padding: 2rem 2.5rem;
    border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark);
    position: relative; width: 90%;
    max-width: 600px; /* Slightly wider for this form */
    max-height: 90vh; display: flex; flex-direction: column;
}
.record-payment-modal-content p {
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--text-muted-color);
}
.modal-close-button {
    position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem;
    font-weight: bold; color: #aaa; background: none; border: none;
    cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem;
}
.modal-close-button:hover { color: #777; }
.modal-content h2 {
    color: var(--dark-color); margin-top: 0; margin-bottom: 0.5rem; /* Reduced bottom margin */
    font-size: 1.5rem; text-align: center;
}
.modal-form {
    overflow-y: auto; padding-right: 5px; /* For scrollbar if content overflows */
    flex-grow: 1;
}
.modal-form .form-group {
    margin-bottom: 1.2rem; /* Slightly less margin for denser form */
}
.modal-form .form-label {
    display: block; margin-bottom: 0.5rem; font-weight: 600;
    color: var(--dark-color); font-size: 0.9rem;
}
.modal-form .form-control:disabled { 
    background-color: #e9ecef; 
    opacity: 0.7;
}
.modal-form textarea.form-control { min-height: 70px; }
.modal-actions {
    display: flex; justify-content: flex-end; gap: 1rem;
    margin-top: 1.5rem; padding-top: 1.5rem;
    border-top: 1px solid #eee;
    flex-shrink: 0;
}
.error-message.modal-error {
    margin-bottom: 1rem; /* Ensure space before actions if error shows */
    font-size: 0.9rem;
}
.text-muted {
    font-size: 0.85em;
    color: var(--text-muted-color);
    display: block;
    margin-top: 0.3rem;
}
</style> 