<template>
  <div class="page-container">
    <div class="page-header">
      <h1>My Plan Details</h1>
      <p>View the details of your assigned treatment plans.</p>
    </div>

    <section class="card list-section">
      <div v-if="isLoading" class="loading-indicator">
        <i class="fas fa-spinner fa-spin"></i> Loading plan details...
      </div>
      <div v-else-if="loadError" class="error-message">
        <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
      </div>
      <div v-else-if="!plans || plans.length === 0" class="no-data-message card">
        You do not have any plans assigned to you currently, or they are archived.
      </div>
      
      <div v-else class="plans-list">
        <div v-for="plan in plans" :key="plan.patientPlanId" class="card plan-card">
          <div class="plan-header">
            <h3>{{ plan.planName }} <span class="plan-type-badge">({{ plan.planType }})</span></h3>
            <span :class="['status-pill', plan.isActive ? 'status-active' : 'status-inactive']">
              {{ plan.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="plan-meta">
            <span>Assigned: {{ formatDateTime(plan.assignmentDate, 'date') }}</span>
            <span v-if="plan.expiryDate">Expires: {{ formatDateTime(plan.expiryDate, 'date') }}</span>
          </div>

          <div class="plan-financials" v-if="plan.totalPlanCost !== null">
            <p>Total Cost: {{ formatCurrency(plan.totalPlanCost) }}</p>
            <p>Paid: {{ formatCurrency(plan.paidAmount) }}</p>
            <p class="due-amount">Due: {{ formatCurrency(plan.dueAmount) }} 
                <span :class="getPaymentStatusClass(plan.planPaymentStatus)">({{ plan.planPaymentStatus.replace('_',' ') }})</span>
            </p>
          </div>

          <div v-if="plan.notes" class="plan-notes">
            <strong>Notes:</strong>
            <p>{{ plan.notes }}</p>
          </div>

          <h4>Service Items ({{ plan.serviceItems ? plan.serviceItems.length : 0 }})</h4>
          <ul v-if="plan.serviceItems && plan.serviceItems.length > 0" class="service-items-list">
            <li v-for="item in plan.serviceItems" :key="item.serviceItemId" class="service-item">
              <div class="item-name">
                <strong>{{ item.serviceName }}</strong> ({{ item.serviceDurationMinutes }} min)
                <span :class="['item-status-pill', item.isItemActive ? 'item-active' : 'item-inactive']">
                  {{ item.isItemActive ? 'Enabled' : 'Disabled' }}
                </span>
              </div>
              <div class="item-quantity">{{ item.remainingQuantity }} / {{ item.totalQuantity }} sessions remaining</div>
              <div class="progress-bar-container small-progress">
                  <div class="progress-bar" :style="{ width: calculateProgress(item.totalQuantity, item.remainingQuantity) + '%' }"></div>
              </div>
              <small v-if="item.pricePerUnit !== null" class="text-muted">Price/session: {{ formatCurrency(item.pricePerUnit) }}</small>
            </li>
          </ul>
          <p v-else class="no-items-message">This plan has no service items defined or all items are archived.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import UserService from '@/services/UserService';
import { useToast } from 'vue-toastification';

const toast = useToast();
const plans = ref([]);
const isLoading = ref(true);
const loadError = ref('');

const fetchUserPlans = async () => {
  isLoading.value = true;
  loadError.value = '';
  try {
    const response = await UserService.getAllMyPlans();
    plans.value = response.data;
    if (!plans.value || plans.value.length === 0) {
      // Optional: Toast if needed, but no-data-message handles it
      // toast.info("No active plans found.");
    }
  } catch (error) {
    console.error("Error fetching user plans:", error);
    loadError.value = error.response?.data?.message || 'Failed to load plan details.';
    toast.error(loadError.value);
  } finally {
    isLoading.value = false;
  }
};

const formatDateTime = (dateTimeString, part) => {
  if (!dateTimeString) return 'N/A';
  try {
    const date = new Date(dateTimeString);
    if (part === 'date') {
      return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    }
    return date.toLocaleString('en-GB');
  } catch (e) {
    return dateTimeString;
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const calculateProgress = (total, remaining) => {
  if (total === 0) return 0;
  const completed = total - remaining;
  return (completed / total) * 100;
};

const getPaymentStatusClass = (status) => {
  if (!status) return '';
  return `payment-status-${status.toLowerCase()}`;
};

onMounted(() => {
  fetchUserPlans(); 
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
}
.page-header p {
  color: var(--text-muted-color);
  font-size: 1.1rem;
  margin-top: 0;
}
.card {
  background-color: #fff;
  padding: 1.5rem 2rem;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
}

.plans-list { /* Container for multiple plan cards */
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.plan-card {
  /* Individual plan card styling from previous card class is fine */
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}
.plan-header h3 {
  margin: 0;
  color: var(--primary-color-dark);
  font-size: 1.3rem;
}
.plan-type-badge {
    font-size: 0.9rem;
    font-weight: normal;
    color: var(--text-muted-color)
}

.status-pill {
  padding: 0.3em 0.8em;
  border-radius: 50px; /* pill shape */
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}
.status-active { background-color: var(--success-color); }
.status-inactive { background-color: var(--muted-color); }

.plan-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1rem;
}

.plan-financials {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: var(--border-radius-small);
    margin-bottom: 1rem;
    font-size: 0.95rem;
}
.plan-financials p {
    margin: 0.3rem 0;
}
.due-amount strong {
    color: var(--danger-color);
}
.payment-status-unpaid { color: var(--danger-color); font-weight: bold; }
.payment-status-partially_paid { color: var(--warning-color-dark); font-weight: bold; }
.payment-status-paid { color: var(--success-color); font-weight: bold; }
.payment-status-overpaid { color: var(--info-color); font-weight: bold; }
.payment-status-not_applicable { color: var(--text-muted-color); }


.plan-notes {
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.plan-notes strong {
  display: block;
  margin-bottom: 0.25rem;
}
.plan-notes p {
  white-space: pre-wrap; /* Respect newlines in notes */
  background-color: #f9f9f9;
  padding: 0.5rem;
  border-radius: var(--border-radius-small);
  margin: 0;
}

.plan-card h4 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: var(--dark-color);
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.service-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-item {
  background-color: #fdfdfd;
  padding: 0.8rem 1rem;
  border: 1px solid #eef;
  border-radius: var(--border-radius);
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}
.service-item .item-name {
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-status-pill {
    padding: 0.2em 0.6em;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
}
.item-active { background-color: var(--success-color-light); color: var(--success-color-dark); border: 1px solid var(--success-color);}
.item-inactive { background-color: var(--muted-color-light);  color: var(--muted-color-dark); border: 1px solid var(--muted-color);}

.item-quantity {
  margin-bottom: 0.3rem;
  color: #444;
}

.progress-bar-container.small-progress {
  height: 8px;
  margin-bottom: 0.5rem;
}

.no-items-message, .loading-indicator, .error-message, .no-data-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #6c757d;
}
.error-message i { margin-right: 0.5rem; color: var(--danger-color); }

</style> 