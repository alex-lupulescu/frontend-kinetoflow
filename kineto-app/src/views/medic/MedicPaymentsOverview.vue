<template>
    <div class="page-container">
        <div class="page-header">
            <h1>Payments Overview</h1>
            <p class="page-description">Summary of outstanding payments for your patients.</p>
        </div>

        <!-- Search Bar -->
        <div class="list-controls">
            <input type="text" v-model="searchTerm" placeholder="Search by patient name, email, or phone..." class="form-control search-input">
        </div>

        <div v-if="isLoading" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Loading payment summaries...
        </div>
        <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>

        <div v-if="!isLoading && !error && paymentSummaries.length === 0" class="no-data-message">
            No outstanding payments found for your patients, or no patients with plans.
        </div>
        <div v-if="!isLoading && !error && paymentSummaries.length > 0 && filteredPaymentSummaries.length === 0" class="no-data-message">
            No payment summaries match your search criteria.
        </div>

        <div v-if="!isLoading && !error && filteredPaymentSummaries.length > 0" class="summary-list">
            <div v-for="summary in filteredPaymentSummaries" :key="summary.patientId" class="card summary-card">
                <div class="summary-header">
                    <h3>{{ summary.patientName }}</h3>
                    <router-link :to="{ name: 'medic-patient-payments', params: { patientId: summary.patientId } }" class="btn btn-sm btn-primary">
                        View Details <i class="fas fa-arrow-right"></i>
                    </router-link>
                </div>
                <div class="patient-contact">
                    <small v-if="summary.patientEmail">Email: {{ summary.patientEmail }}</small>
                    <small v-if="summary.patientEmail && summary.patientPhoneNumber"> | </small>
                    <small v-if="summary.patientPhoneNumber">Phone: {{ summary.patientPhoneNumber }}</small>
                </div>
                <div class="summary-stats">
                    <div class="stat-item unpaid-plans">
                        <span class="stat-value">{{ summary.numberOfUnpaidPlans }}</span>
                        <span class="stat-label">Unpaid Plan(s)</span>
                    </div>
                    <div class="stat-item partially-paid-plans">
                        <span class="stat-value">{{ summary.numberOfPartiallyPaidPlans }}</span>
                        <span class="stat-label">Partially Paid Plan(s)</span>
                    </div>
                    <div class="stat-item total-due">
                        <span class="stat-value">{{ formatCurrency(summary.totalAmountDue) }}</span>
                        <span class="stat-label">Total Due</span>
                    </div>
                </div>
                <div class="last-update">
                    <small>Last plan activity: {{ formatDate(summary.lastPlanUpdateDate) || 'N/A' }}</small>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import PaymentService from '@/services/PaymentService';
import { useToast } from 'vue-toastification';

const toast = useToast();
const paymentSummaries = ref([]);
const isLoading = ref(true);
const error = ref(null);
const searchTerm = ref('');

const filteredPaymentSummaries = computed(() => {
    if (!searchTerm.value.trim()) {
        return paymentSummaries.value;
    }
    const lowerSearchTerm = searchTerm.value.toLowerCase();
    return paymentSummaries.value.filter(summary => {
        const nameMatch = summary.patientName?.toLowerCase().includes(lowerSearchTerm);
        const emailMatch = summary.patientEmail?.toLowerCase().includes(lowerSearchTerm);
        const phoneMatch = summary.patientPhoneNumber?.toLowerCase().includes(lowerSearchTerm);
        return nameMatch || emailMatch || phoneMatch;
    });
});

const fetchPaymentSummaries = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await PaymentService.getMedicPaymentSummary();
        paymentSummaries.value = response.data;
    } catch (e) {
        console.error("Error fetching payment summaries:", e);
        error.value = e.response?.data?.message || 'Failed to load payment summaries.';
        toast.error(error.value);
    } finally {
        isLoading.value = false;
    }
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

onMounted(() => {
    fetchPaymentSummaries();
});
</script>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-header h1 {
    margin-bottom: 0.25rem;
    color: var(--dark-color);
}
.page-description {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: var(--text-muted-color);
}

.card {
    background-color: #fff;
    padding: 1.5rem 2rem;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-light);
    margin-bottom: 1rem; /* Spacing between summary cards */
}

.summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #eee;
}

.summary-header h3 {
    margin: 0;
    color: var(--primary-color-dark);
    font-size: 1.3rem;
}

.patient-contact {
    font-size: 0.85rem;
    color: var(--text-muted-color);
    margin-bottom: 1rem;
}
.patient-contact small + small {
    margin-left: 0.3rem;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.stat-item {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: var(--border-radius);
    text-align: center;
}

.stat-item .stat-value {
    font-size: 1.75rem;
    font-weight: bold;
    display: block;
    margin-bottom: 0.25rem;
}

.stat-item .stat-label {
    font-size: 0.9rem;
    color: var(--text-muted-color);
}

/* Specific styling for different stats */
.stat-item.unpaid-plans .stat-value {
    color: var(--danger-color);
}
.stat-item.partially-paid-plans .stat-value {
    color: var(--warning-color);
}
.stat-item.total-due .stat-value {
    color: var(--info-color-dark);
}

.last-update {
    font-size: 0.8rem;
    color: #888;
    text-align: right;
    margin-top: 1rem;
}

.loading-indicator, .error-message, .no-data-message {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: var(--text-muted-color);
}

/* Search and List Controls */
.list-controls {
    margin-bottom: 1.5rem; /* Add some space below the search bar */
    display: flex;
    justify-content: flex-end; /* Aligns search bar to the right */
}
.search-input {
    max-width: 400px; /* Or any width you prefer */
    padding: 0.6rem 1rem; /* Adjusted padding for better feel */
}
</style> 