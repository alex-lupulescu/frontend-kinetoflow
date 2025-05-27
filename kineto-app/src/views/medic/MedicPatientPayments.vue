<template>
    <div class="page-container">
        <div class="page-header">
            <h1>Patient Payments: {{ patient?.name || 'Loading...' }}</h1>
            <button @click="goBack" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i> Back to Patient List
            </button>
        </div>

        <div v-if="isLoading" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Loading payment information...
        </div>
        <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-if="!isLoading && !error && plansWithPayments.length === 0" class="no-data-message">
            This patient has no assigned plans.
        </div>

        <!-- Overall Due Amount Section -->
        <div v-if="!isLoading && !error && plansWithPayments.length > 0" class="card total-due-card">
            <h3>Total Amount Due: 
                <span :class="{ 'text-danger': totalOverallDueAmount > 0, 'text-success': totalOverallDueAmount <= 0 }">
                    {{ formatCurrency(totalOverallDueAmount) }}
                </span>
            </h3>
            <p v-if="totalOverallDueAmount <= 0" class="text-muted small">All outstanding balances are settled.</p>
        </div>

        <div v-if="!isLoading && !error && plansWithPayments.length > 0">
            <section v-for="plan in plansWithPayments" :key="plan.id" class="card plan-payment-card">
                <div class="plan-header">
                    <h2>{{ plan.originatingPackageName || 'Custom Plan' }} (ID: {{ plan.id }})</h2>
                    <span :class="getPlanStatusClass(plan.planPaymentStatus)">
                        {{ formatPlanPaymentStatus(plan.planPaymentStatus) }}
                    </span>
                </div>
                <p>Assigned: {{ formatDate(plan.assignedDate) }}</p>
                
                <div class="financial-summary">
                    <div>Total Cost: <strong>{{ formatCurrency(plan.totalPlanCost) }}</strong></div>
                    <div>Amount Paid: <strong>{{ formatCurrency(plan.paidAmount) }}</strong></div>
                    <div :class="{ 'text-danger': plan.dueAmount > 0, 'text-success': plan.dueAmount <= 0 }">
                        Amount Due: <strong>{{ formatCurrency(plan.dueAmount) }}</strong>
                    </div>
                </div>

                <div class="plan-actions">
                    <button @click="openRecordPaymentModal(plan)" class="btn btn-primary btn-sm">
                        <i class="fas fa-dollar-sign"></i> Record Payment
                    </button>
                    <button @click="togglePaymentHistory(plan.id)" class="btn btn-info btn-sm">
                        <i :class="expandedPlanPayments[plan.id] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i> 
                        {{ expandedPlanPayments[plan.id] ? 'Hide' : 'View' }} Payments ({{ plan.payments?.length || 0 }})
                    </button>
                </div>

                <div v-if="expandedPlanPayments[plan.id] && plan.payments && plan.payments.length > 0" class="payment-history">
                    <h4>Payment History</h4>
                    <ul class="payment-list">
                        <li v-for="payment in plan.payments" :key="payment.id" class="payment-item">
                            <div>Date: <strong>{{ formatDate(payment.paymentDate) }}</strong></div>
                            <div>Amount: <strong>{{ formatCurrency(payment.amount) }}</strong> ({{ payment.status }})</div>
                            <div v-if="payment.paymentMethod">Method: {{ payment.paymentMethod }}</div>
                            <div v-if="payment.transactionId">Transaction ID: {{ payment.transactionId }}</div>
                            <div v-if="payment.notes">Notes: {{ payment.notes }}</div>
                            <small>Recorded by: {{ payment.recordedByUserName }} on {{ formatDate(payment.createdAt) }}</small>
                        </li>
                    </ul>
                </div>
                 <div v-if="expandedPlanPayments[plan.id] && (!plan.payments || plan.payments.length === 0)" class="no-data-message small-text">
                    No payments recorded for this plan yet.
                </div>
            </section>
        </div>

        <!-- Record Payment Modal (Placeholder for now) -->
        <RecordPaymentModal 
            v-if="showRecordPayment"
            :plan-details="planToRecordPaymentFor"
            @close="closeRecordPaymentModal"
            @payment-saved="handlePaymentSuccessfullySaved"
        />

    </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PaymentService from '@/services/PaymentService';
import UserService from '@/services/UserService'; // To fetch patient details for header
import RecordPaymentModal from '@/components/medic/RecordPaymentModal.vue'; // <-- Import the modal
import { useToast } from 'vue-toastification';

const props = defineProps({
    patientId: {
        type: [String, Number],
        required: true
    }
});

const router = useRouter();
const route = useRoute();
const toast = useToast();

const patient = ref(null);
const plansWithPayments = ref([]);
const isLoading = ref(true);
const error = ref(null);

const showRecordPayment = ref(false);
const planToRecordPaymentFor = ref(null);
const expandedPlanPayments = reactive({}); // To toggle payment history visibility for each plan

// Computed property for total overall due amount
const totalOverallDueAmount = computed(() => {
    return plansWithPayments.value.reduce((total, plan) => {
        if (plan.dueAmount && plan.dueAmount > 0) {
            return total + plan.dueAmount;
        }
        return total;
    }, 0);
});

const fetchPatientDetails = async () => {
    try {
        // We need an endpoint to get a single patient's summary by ID, 
        // or adapt an existing one if it exists and is suitable.
        // For now, assuming UserService might have or need a getUserSummary(id) method.
        // This is a temporary placeholder call:
        // const response = await UserService.getPatientSummaryById(props.patientId);
        // patient.value = response.data;
        // If such an endpoint doesn't exist, we might fetch all patients and filter,
        // but that's inefficient. The best is a dedicated endpoint.
        // For now, let's assume the plan DTOs will return patientName.
        // If not, the header will just show patient ID.
        // Update: PatientPlanWithPaymentsDto includes patientName, so direct fetch might not be needed here for name.
    } catch (e) {
        console.error("Error fetching patient details for header:", e);
        // Non-critical for core functionality of this page if plan DTOs have patient name
    }
};

const fetchPlansWithPayments = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await PaymentService.getPatientPlansWithPaymentStatus(props.patientId);
        plansWithPayments.value = response.data;
        if (plansWithPayments.value.length > 0 && !patient.value) {
             // Set patient from the first plan if not already fetched
            patient.value = { name: plansWithPayments.value[0].patientName, id: plansWithPayments.value[0].patientId };
        }
    } catch (e) {
        console.error("Error fetching plans with payments:", e);
        error.value = e.response?.data?.message || 'Failed to load payment information.';
        toast.error(error.value);
    } finally {
        isLoading.value = false;
    }
};

const openRecordPaymentModal = (plan) => {
    planToRecordPaymentFor.value = plan;
    showRecordPayment.value = true;
    // TODO: Initialize form fields for RecordPaymentModal.vue here
};

const closeRecordPaymentModal = () => {
    showRecordPayment.value = false;
    planToRecordPaymentFor.value = null;
    // TODO: Reset form fields // This is handled within the modal itself now
};

const handleSavePayment = async () => {
    // TODO: Implement actual save logic using PaymentService.recordPayment
    toast.info("Save payment functionality not yet implemented.");
    // On success: closeRecordPaymentModal(); await fetchPlansWithPayments(); 
};

const handlePaymentSuccessfullySaved = async () => {
    closeRecordPaymentModal();
    await fetchPlansWithPayments(); // Refresh the list
    // Potentially show a toast message here if not handled by the modal itself, though modal does it.
};

const togglePaymentHistory = (planId) => {
    expandedPlanPayments[planId] = !expandedPlanPayments[planId];
};

const formatDate = (dateString) => { 
    if (!dateString) return 'N/A'; 
    try { 
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }; 
        return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString)); 
    } catch (e) { return dateString; } 
};

const formatCurrency = (value) => { 
    if (value === null || value === undefined) return 'N/A'; 
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); 
};

const formatPlanPaymentStatus = (status) => {
    if (!status) return 'N/A';
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()); // e.g., Partially Paid
};

const getPlanStatusClass = (status) => {
    if (!status) return 'status-badge';
    switch (status) {
        case 'PAID': return 'status-badge status-paid';
        case 'PARTIALLY_PAID': return 'status-badge status-partially-paid';
        case 'UNPAID': return 'status-badge status-unpaid';
        case 'OVERPAID': return 'status-badge status-overpaid';
        case 'NOT_APPLICABLE': return 'status-badge status-na';
        default: return 'status-badge';
    }
};

const goBack = () => {
    // router.back(); // simple back
    // Or, go to a specific patient list page if that's more consistent UX
    router.push({ name: 'medic-patients' }); 
};

onMounted(async () => {
    // await fetchPatientDetails(); // Patient name is included in PatientPlanWithPaymentsDto, so this might not be strictly necessary if DTO is rich.
    await fetchPlansWithPayments();
});

</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.page-header h1 {
    margin-bottom: 0;
    color: var(--dark-color);
}

.card {
    background-color: #fff;
    padding: 1.5rem 2rem;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-light);
    margin-bottom: 1.5rem; /* Spacing between plan cards */
}

.plan-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.8rem;
}

.plan-header h2 {
    color: var(--dark-color);
    font-size: 1.3rem;
    margin: 0;
}

.financial-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: var(--border-radius);
}

.financial-summary > div {
    font-size: 0.95rem;
}

.text-danger strong {
    color: var(--danger-color);
}
.text-success strong {
    color: var(--success-color);
}

.plan-actions {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.loading-indicator, .error-message, .no-data-message {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: var(--text-muted-color);
}
.no-data-message.small-text {
    padding: 0.5rem;
    font-size: 0.9rem;
    font-style: italic;
}

/* Payment History */
.payment-history {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #ddd;
}
.payment-history h4 {
    font-size: 1.1rem;
    color: var(--dark-color);
    margin-bottom: 0.8rem;
}
.payment-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.payment-item {
    background-color: #fdfdfd;
    padding: 0.8rem 1rem;
    border: 1px solid #eee;
    border-radius: var(--border-radius-small);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}
.payment-item div {
    margin-bottom: 0.2rem;
}
.payment-item small {
    display: block;
    margin-top: 0.3rem;
    color: var(--text-muted-color);
    font-size: 0.8rem;
}

/* Status Badges */
.status-badge {
    padding: 0.3em 0.7em;
    border-radius: var(--border-radius-round);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #fff;
    white-space: nowrap;
}
.status-paid { background-color: var(--success-color); }
.status-partially-paid { background-color: var(--warning-color); color: var(--dark-color);}
.status-unpaid { background-color: var(--danger-color); }
.status-overpaid { background-color: var(--info-color); }
.status-na { background-color: var(--grey-color); color: var(--dark-color); }

/* Modal Styles (copied and adapted from MedicMyPatients for consistency) */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 1rem; }
.modal-content { background-color: #fff; padding: 2rem 2.5rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark); position: relative; width: 90%; max-width: 550px; /* Adjusted for payment form */ max-height: 90vh; display: flex; flex-direction: column; }
.modal-close-button { position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem; font-weight: bold; color: #aaa; background: none; border: none; cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem; }
.modal-close-button:hover { color: #777; }
.modal-content h2 { color: var(--dark-color); margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem; text-align: center; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; }

.total-due-card {
    background-color: var(--light-color-alt, #e9ecef); /* Slightly different background */
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

.total-due-card h3 {
    color: var(--dark-color);
    margin-top: 0;
    margin-bottom: 0.25rem;
    font-size: 1.4rem;
}

.total-due-card p {
    margin-top: 0.25rem;
}

</style> 