<template>
    <div class="modal-overlay" @click.self="closeModal">
        <div class="modal-content record-payment-modal-content">
            <button @click="closeModal" class="modal-close-button" title="Close">×</button>
            <h2>Record Payment for {{ planDetails?.originatingPackageName || 'Custom Plan' }} (Plan ID: {{ planDetails?.id }})</h2>
            <p v-if="planDetails?.patientName">Patient: {{ planDetails.patientName }}</p>
            
            <!-- Payment Amount Summary -->
            <div class="payment-summary">
                <div class="summary-row">
                    <span class="summary-label">Amount Due:</span>
                    <span class="summary-amount original-amount">{{ formatCurrency(planDetails?.dueAmount || 0) }}</span>
                </div>
                <div v-if="selectedVoucher" class="summary-row discount-row" :class="{ 'success': !voucherError && calculatedDiscount > 0, 'error': voucherError }">
                    <span class="summary-label">
                        Voucher Discount ({{ selectedVoucher.code }})
                        <i v-if="!voucherError && calculatedDiscount > 0" class="fas fa-check-circle" style="color: #28a745; margin-left: 0.5rem;"></i>
                        <i v-if="voucherError" class="fas fa-exclamation-triangle" style="color: #dc3545; margin-left: 0.5rem;"></i>
                    </span>
                    <span class="summary-amount discount-amount">
                        <span v-if="!voucherError && calculatedDiscount > 0">-{{ formatCurrency(calculatedDiscount) }}</span>
                        <span v-else>{{ formatCurrency(0) }} (Error)</span>
                    </span>
                </div>
                <div class="summary-row final-row">
                    <span class="summary-label">Amount to Pay:</span>
                    <span class="summary-amount final-amount">{{ formatCurrency(finalAmountToPay) }}</span>
                </div>
            </div>
            
            <form @submit.prevent="submitPayment" class="modal-form">
                <!-- Voucher Selection -->
                <div class="form-group voucher-section">
                    <label for="voucherSelect" class="form-label">
                        <i class="fas fa-ticket-alt"></i>
                        Apply Voucher (Optional)
                    </label>
                    <div class="voucher-controls">
                        <select 
                            id="voucherSelect" 
                            v-model="selectedVoucherId" 
                            @change="onVoucherChange"
                            :disabled="isSubmitting || loadingVouchers"
                            class="form-control voucher-select"
                        >
                            <option value="">-- No Voucher --</option>
                            <option v-for="voucher in availableVouchers" :key="voucher.id" :value="voucher.id">
                                {{ voucher.code }} - {{ voucher.name }} ({{ formatDiscountValue(voucher) }})
                            </option>
                        </select>
                        <button 
                            type="button" 
                            @click="refreshVouchers"
                            :disabled="loadingVouchers"
                            class="btn btn-refresh"
                            title="Refresh vouchers"
                        >
                            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingVouchers }"></i>
                        </button>
                    </div>
                    <div v-if="voucherError" class="error-message voucher-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ voucherError }}
                    </div>
                    <div v-else-if="selectedVoucher && calculatedDiscount > 0" class="voucher-info success">
                        <small class="voucher-details">
                            <i class="fas fa-check-circle"></i>
                            {{ selectedVoucher.description || `${formatDiscountValue(selectedVoucher)} discount` }}
                            <span v-if="selectedVoucher.minimumOrderValue"> 
                                (Min. order: {{ formatCurrency(selectedVoucher.minimumOrderValue) }})
                            </span>
                        </small>
                    </div>
                    <div v-else-if="selectedVoucher" class="voucher-info error">
                        <small class="voucher-details">
                            <i class="fas fa-times-circle"></i>
                            Voucher selected but not validated yet
                        </small>
                    </div>
                </div>

                <div class="form-group">
                    <label for="paymentAmount" class="form-label">Amount *</label>
                    <input 
                        type="number" 
                        id="paymentAmount" 
                        v-model.number="paymentForm.amount" 
                        required 
                        step="0.01" 
                        :placeholder="`Suggested: ${finalAmountToPay.toFixed(2)}`"
                        :disabled="isSubmitting" 
                        class="form-control"
                    >
                    <small class="text-muted">You can modify this amount if needed (e.g., for partial payments or refunds)</small>
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
import VoucherService from '@/services/VoucherService';

const props = defineProps({
    planDetails: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'payment-saved']);

const toast = useToast();

// Reactive data
const isDev = ref(import.meta.env.DEV || false); // For development logging

const paymentForm = reactive({
    planId: null,
    amount: null,
    paymentDate: new Date().toISOString().slice(0, 16),
    status: 'COMPLETED',
    paymentMethod: '',
    transactionId: '',
    notes: ''
});

const paymentStatuses = ref([
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded (Full or Partial)' },
]);

const isSubmitting = ref(false);
const submissionError = ref('');

// Voucher reactive properties
const selectedVoucherId = ref('');
const selectedVoucher = ref(null);
const availableVouchers = ref([]);
const loadingVouchers = ref(false);
const voucherError = ref('');
const calculatedDiscount = ref(0);

// Computed properties
const finalAmountToPay = computed(() => {
    const originalAmount = props.planDetails?.dueAmount || 0;
    const discountToApply = (!voucherError.value && calculatedDiscount.value > 0) ? calculatedDiscount.value : 0;
    const finalAmount = Math.max(0, originalAmount - discountToApply);
    
    if (isDev.value && selectedVoucher.value) {
        console.log('Final amount calculation:', {
            originalAmount,
            calculatedDiscount: calculatedDiscount.value,
            voucherError: voucherError.value,
            discountToApply,
            finalAmount
        });
    }
    
    return finalAmount;
});

const isFormValid = computed(() => {
    return paymentForm.amount !== null && paymentForm.amount !== undefined && 
           paymentForm.paymentDate && 
           paymentForm.status;
});

const voucherStatus = computed(() => {
    if (!selectedVoucher.value) return 'none';
    if (voucherError.value) return 'error';
    if (calculatedDiscount.value > 0) return 'applied';
    return 'selected';
});

// Utility methods
const formatCurrency = (value) => {
    if (typeof value !== 'number') return '0.00 RON';
    return `${value.toFixed(2)} RON`;
};

const formatDiscountValue = (voucher) => {
    return VoucherService.formatDiscountValue(voucher);
};

// Voucher methods
const loadAvailableVouchers = async () => {
    try {
        loadingVouchers.value = true;
        voucherError.value = '';
        const response = await VoucherService.getAvailableVouchersForMedic();
        availableVouchers.value = response || [];
    } catch (error) {
        console.error("Error loading vouchers:", error);
        voucherError.value = error.response?.data?.message || 'Failed to load vouchers';
        availableVouchers.value = [];
    } finally {
        loadingVouchers.value = false;
    }
};

const onVoucherChange = async () => {
    voucherError.value = '';
    selectedVoucher.value = null;
    calculatedDiscount.value = 0;
    
    if (selectedVoucherId.value) {
        const voucher = availableVouchers.value.find(v => v.id == selectedVoucherId.value);
        if (voucher) {
            try {
                if (isDev.value) console.log('Validating voucher:', voucher.code, 'for amount:', props.planDetails?.dueAmount, 'patient:', props.planDetails?.patientId);
                
                // Validate voucher with the current plan amount and patient
                const validationResponse = await VoucherService.validateVoucherForMedic(
                    voucher.code, 
                    props.planDetails?.dueAmount || 0, 
                    props.planDetails?.patientId
                );
                
                if (isDev.value) console.log('Validation response:', validationResponse);
                
                if (validationResponse && validationResponse.success) {
                    selectedVoucher.value = voucher;
                    
                    // Use the returned discount amount or calculate manually as fallback
                    if (validationResponse.discountAmount !== undefined && validationResponse.discountAmount !== null) {
                        calculatedDiscount.value = validationResponse.discountAmount;
                    } else {
                        // Manual calculation as fallback
                        calculatedDiscount.value = calculateDiscountAmount(voucher, props.planDetails?.dueAmount || 0);
                    }
                    
                    if (isDev.value) console.log('Applied discount:', calculatedDiscount.value);
                    
                    // Auto-populate the payment amount with the discounted amount
                    paymentForm.amount = finalAmountToPay.value;
                    
                    // Clear any previous errors
                    voucherError.value = '';
                    
                    // Don't show toast here, just update the UI state
                    // Toast will be shown when payment is actually saved
                } else {
                    // Don't reset the selection, just show the error
                    const errorMessage = validationResponse?.message || validationResponse?.error || 'Voucher is not valid for this payment';
                    voucherError.value = errorMessage;
                    if (isDev.value) console.log('Voucher validation failed:', errorMessage);
                    
                    // Keep the voucher selected but with error state
                    selectedVoucher.value = voucher;
                    calculatedDiscount.value = 0;
                }
            } catch (error) {
                console.error("Error validating voucher:", error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to validate voucher';
                voucherError.value = errorMessage;
                
                // Keep the voucher selected but with error state
                selectedVoucher.value = voucher;
                calculatedDiscount.value = 0;
            }
        }
    } else {
        // Reset to original amount when no voucher selected
        paymentForm.amount = props.planDetails?.dueAmount || 0;
    }
};

// Manual discount calculation as fallback
const calculateDiscountAmount = (voucher, orderAmount) => {
    if (!voucher || !voucher.discountValue || !orderAmount) return 0;
    
    // Ensure we have numbers
    const discountValue = parseFloat(voucher.discountValue);
    const amount = parseFloat(orderAmount);
    
    if (voucher.discountType === 'PERCENTAGE') {
        return (amount * discountValue) / 100;
    } else if (voucher.discountType === 'FIXED_AMOUNT') {
        return Math.min(discountValue, amount);
    }
    
    if (isDev.value) {
        console.log('Unknown discount type:', voucher.discountType);
    }
    
    return 0;
};

const refreshVouchers = async () => {
    await loadAvailableVouchers();
};

// Modal methods
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
        paymentDate: paymentForm.paymentDate + ":00Z",
        status: paymentForm.status,
        paymentMethod: paymentForm.paymentMethod || null,
        transactionId: paymentForm.transactionId || null,
        notes: paymentForm.notes || null,
    };

    // Add voucher information if a voucher was applied successfully
    if (selectedVoucher.value && !voucherError.value && calculatedDiscount.value > 0) {
        payload.voucherCode = selectedVoucher.value.code;
        payload.voucherId = selectedVoucher.value.id;
        payload.discountAmount = calculatedDiscount.value;
        payload.originalAmount = props.planDetails?.dueAmount || 0;
        payload.hasVoucher = true;
        payload.effectivePaymentAmount = parseFloat(paymentForm.amount) + calculatedDiscount.value;
        
        // Add voucher details to notes if not already present
        const voucherNote = `Voucher applied: ${selectedVoucher.value.code} (${formatCurrency(calculatedDiscount.value)} discount)`;
        if (payload.notes) {
            payload.notes += `\n${voucherNote}`;
        } else {
            payload.notes = voucherNote;
        }
        
        if (isDev.value) console.log('Including voucher in payment:', {
            voucherCode: payload.voucherCode,
            discountAmount: payload.discountAmount,
            actualPayment: payload.amount,
            effectivePayment: payload.effectivePaymentAmount
        });
    } else {
        payload.hasVoucher = false;
        payload.effectivePaymentAmount = parseFloat(paymentForm.amount);
    }

    try {
        if (isDev.value) console.log('Submitting payment with payload:', payload);
        await PaymentService.recordPayment(payload);
        toast.success('Payment recorded successfully!');
        
        // If voucher was used successfully, notify about voucher application
        if (selectedVoucher.value && !voucherError.value && calculatedDiscount.value > 0) {
            toast.info(`Voucher ${selectedVoucher.value.code} applied with ${formatCurrency(calculatedDiscount.value)} discount`);
        }
        
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

// Watchers
watch(() => props.planDetails, (newPlan) => {
    if (newPlan) {
        paymentForm.planId = newPlan.id;
        // Reset form fields
        paymentForm.amount = newPlan.dueAmount || 0;
        paymentForm.paymentDate = new Date().toISOString().slice(0, 16);
        paymentForm.status = 'COMPLETED';
        paymentForm.paymentMethod = '';
        paymentForm.transactionId = '';
        paymentForm.notes = '';
        submissionError.value = '';
        
        // Reset voucher selection
        selectedVoucherId.value = '';
        selectedVoucher.value = null;
        calculatedDiscount.value = 0;
        voucherError.value = '';
    }
}, { immediate: true });

// Lifecycle
onMounted(() => {
    // Initialize planId when component mounts and planDetails is available
    if (props.planDetails) {
        paymentForm.planId = props.planDetails.id;
        paymentForm.amount = props.planDetails.dueAmount || 0;
    }
    
    // Load available vouchers
    loadAvailableVouchers();
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
    max-width: 650px; /* Slightly wider for voucher functionality */
    max-height: 90vh; display: flex; flex-direction: column;
}
.record-payment-modal-content p {
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--text-muted-color);
}

/* Payment Summary Styles */
.payment-summary {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.summary-row:last-child {
    margin-bottom: 0;
}

.summary-label {
    font-weight: 500;
    color: #495057;
}

.summary-amount {
    font-weight: 600;
    font-size: 1.1em;
}

.original-amount {
    color: #6c757d;
}

.discount-row {
    border-top: 1px solid #dee2e6;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
}

.discount-row.success {
    color: #28a745;
}

.discount-row.error {
    color: #dc3545;
}

.discount-amount {
    color: #28a745;
}

.final-row {
    border-top: 2px solid #007bff;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
    font-size: 1.1em;
}

.final-amount {
    color: #007bff;
    font-size: 1.2em;
}

/* Voucher Section Styles */
.voucher-section {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
}

.voucher-section .form-label {
    color: #495057;
    font-weight: 600;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.voucher-controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.voucher-select {
    flex: 1;
}

.btn-refresh {
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-refresh:hover:not(:disabled) {
    background: #5a6268;
}

.btn-refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.voucher-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
}

.voucher-info {
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
}

.voucher-info.success {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.voucher-info.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.voucher-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
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