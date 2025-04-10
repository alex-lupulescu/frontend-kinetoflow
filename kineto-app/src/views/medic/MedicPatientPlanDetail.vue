<template>
    <div class="page-container">
      <!-- Header and Back Button -->
      <div class="page-header">
        <h1>Patient Plan Details</h1>
        <router-link to="/app/medic/my-patients" class="btn btn-secondary btn-sm">
          <i class="fas fa-arrow-left"></i> Back to Patient List
        </router-link>
      </div>
  
      <!-- Loading/Error for initial fetch -->
      <div v-if="isLoading" class="loading-indicator"> <i class="fas fa-spinner fa-spin"></i> Loading plan details... </div>
      <div v-if="loadError && !isLoading" class="error-message"> <i class="fas fa-exclamation-triangle"></i> {{ loadError }} </div>
  
      <!-- Plan Display - Loop through plans fetched -->
      <div v-if="!isLoading && plans.length > 0">
          <section v-for="(plan, planIndex) in plans" :key="plan.id" class="card plan-section" :class="{ 'inactive-plan': !plan.isActive }">
              <!-- Plan Header with Status and Actions -->
              <div class="plan-header">
                  <h2>
                      Plan #{{ plan.id }}
                      <span v-if="plan.originatingPackageName"> (Package: {{ plan.originatingPackageName }}) </span>
                      <!-- Status Badge -->
                      <span :class="['status-badge', plan.isActive ? 'status-active' : 'status-inactive']">
                          {{ plan.isActive ? 'Active' : 'Inactive' }}
                      </span>
                       <!-- Archived Indicator (if needed, though usually filtered) -->
                      <!-- <span v-if="plan.isArchived" class="status-badge status-archived">Archived</span> -->
                  </h2>
                  <div class="plan-meta">
                      <span>Assigned: {{ formatDate(plan.assignedDate) }}</span>
                      <span v-if="plan.expiryDate"> | Expires: {{ formatDate(plan.expiryDate) }}</span>
                      <span> | By: {{ plan.assignedByName || 'N/A' }}</span>
                  </div>
                  <!-- Plan Action Buttons -->
                  <div class="plan-actions">
                       <!-- Activate/Deactivate Plan Button -->
                       <button
                          type="button"
                          @click="handleTogglePlanStatus(plan, !plan.isActive)"
                          :class="['btn', 'btn-sm', plan.isActive ? 'btn-warning' : 'btn-success']"
                          :disabled="isUpdatingPlanStatus[plan.id]"
                          :title="plan.isActive ? 'Deactivate Plan' : 'Reactivate Plan'"
                        >
                          <span v-if="isUpdatingPlanStatus[plan.id]"><i class="fas fa-spinner fa-spin"></i></span>
                          <span v-else><i :class="['fas', plan.isActive ? 'fa-toggle-off' : 'fa-toggle-on']"></i> {{ plan.isActive ? 'Deactivate' : 'Reactivate' }}</span>
                        </button>
                       <!-- Archive Plan Button -->
                       <button
                          type="button"
                          v-if="plan.isActive"
                          @click="handleArchivePlan(plan, planIndex)"
                          class="btn btn-danger btn-sm"
                          :disabled="isUpdatingPlanStatus[plan.id]"
                          title="Archive Plan (Hides from view)"
                        >
                          <span v-if="isUpdatingPlanStatus[plan.id]"><i class="fas fa-spinner fa-spin"></i></span>
                          <span v-else><i class="fas fa-archive"></i> Archive</span>
                        </button>
                        <!-- Add Restore button later if a view for archived plans is created -->
                  </div>
              </div>
  
              <!-- Plan Notes -->
              <div v-if="plan.notes" class="plan-notes">
                  <strong>Notes:</strong> {{ plan.notes }}
              </div>
  
              <!-- Included Service Items Section -->
              <h3>Included Service Items</h3>
              <div v-if="!plan.serviceItems || activeItems(plan.serviceItems).length === 0" class="no-data-message small">
                  No active service items in this plan.
              </div>
              <table v-else class="data-table items-table">
                  <thead>
                      <tr>
                          <th>Service</th>
                          <th>Total</th>
                          <th>Rem.</th>
                          <th>Status</th>
                          <th>Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      <!-- Loop through FILTERED (non-archived) and SORTED items -->
                      <template v-for="(item, itemIndex) in sortedItems(plan.serviceItems)" :key="item.id">
                       <!-- Row for each item -->
                       <tr :class="{'inactive-item': !item.isItemActive}">
                          <td>{{ item.serviceName }}</td>
                          <td>
                              <span v-if="!isEditingQuantities[item.id]">{{ item.totalQuantity }}</span>
                              <input v-else type="number" v-model.number="editableQuantities[item.id].total" min="1" class="qty-input form-control">
                          </td>
                          <td>
                               <span v-if="!isEditingQuantities[item.id]">{{ item.remainingQuantity }}</span>
                               <input v-else type="number" v-model.number="editableQuantities[item.id].remaining" :max="editableQuantities[item.id]?.total ?? 0" min="0" class="qty-input form-control">
                          </td>
                          <td>
                             <span :class="['status-badge', item.isItemActive ? 'status-active' : 'status-inactive']"> {{ item.isItemActive ? 'Active' : 'Inactive' }} </span>
                             <!-- Optional: Show Archived badge if needed -->
                             <!-- <span v-if="item.isArchived" class="status-badge status-archived">Archived</span> -->
                          </td>
                          <td class="action-cell">
                              <!-- Edit Qty Button -->
                              <button type="button" v-if="!isEditingQuantities[item.id] && item.isItemActive && plan.isActive" @click="startEditQuantities(item)" class="btn btn-secondary btn-sm" title="Correct Quantities"> <i class="fas fa-pencil-alt"></i> </button>
                              <!-- Save/Cancel Qty Buttons -->
                              <template v-if="isEditingQuantities[item.id]">
                                  <button type="button" @click="handleSaveQuantities(item.id, planIndex, itemIndex)" class="btn btn-success btn-sm" :disabled="isSavingQuantities[item.id]" title="Save Qty"> <i class="fas fa-save"></i> </button>
                                  <button type="button" @click="cancelEditQuantities(item.id)" class="btn btn-cancel btn-sm" :disabled="isSavingQuantities[item.id]" title="Cancel Edit"> <i class="fas fa-times"></i> </button>
                              </template>
                               <!-- Activate/Deactivate Item Button -->
                               <button type="button" v-if="item.isItemActive && plan.isActive" @click="handleToggleItemStatus(item, false)" class="btn btn-warning btn-sm" :disabled="isUpdatingItemStatus[item.id] || isEditingQuantities[item.id]" title="Deactivate Item"> <span v-if="isUpdatingItemStatus[item.id]"><i class="fas fa-spinner fa-spin"></i></span> <span v-else><i class="fas fa-toggle-off"></i></span> </button>
                               <button type="button" v-else-if="!item.isItemActive && plan.isActive" @click="handleToggleItemStatus(item, true)" class="btn btn-success btn-sm" :disabled="isUpdatingItemStatus[item.id] || isEditingQuantities[item.id]" title="Reactivate Item"> <span v-if="isUpdatingItemStatus[item.id]"><i class="fas fa-spinner fa-spin"></i></span> <span v-else><i class="fas fa-toggle-on"></i></span> </button>
                               <!-- Archive Item Button -->
                               <button type="button" v-if="item.isItemActive && plan.isActive" @click="handleArchiveItem(item, planIndex, itemIndex)" class="btn btn-danger btn-sm" :disabled="isUpdatingItemStatus[item.id] || isEditingQuantities[item.id]" title="Archive Item"> <span v-if="isUpdatingItemStatus[item.id]"><i class="fas fa-spinner fa-spin"></i></span> <span v-else><i class="fas fa-archive"></i></span> </button>
                               <!-- Optional Restore Item Button -->
                               <!-- <button v-else-if="!item.isItemActive && plan.isActive && item.isArchived" ...> Restore Item </button> -->
                          </td>
                       </tr>
                       <!-- Error Row for Qty Edit -->
                       <tr v-if="isEditingQuantities[item.id] && quantityErrors[item.id]" class="error-row"> <td colspan="5"> <div class="error-message small-error"><i class="fas fa-exclamation-circle"></i> {{ quantityErrors[item.id] }}</div> </td> </tr>
                      </template>
                   </tbody>
              </table>
          </section>
      </div>
       <!-- No Plans Found Message -->
      <div v-if="!isLoading && plans.length === 0 && !loadError" class="no-data-message">
          No active plans found for this patient.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useRoute, useRouter, RouterLink } from 'vue-router';
  import PatientPlanService from '@/services/PatientPlanService';
  import { useToast } from 'vue-toastification';
  
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const patientId = computed(() => { const id = parseInt(route.params.patientId, 10); return isNaN(id) ? null : id; });
  
  // --- State ---
  const plans = ref([]); // Holds NON-ARCHIVED plans fetched by default
  const isLoading = ref(true);
  const loadError = ref('');
  const isUpdatingPlanStatus = reactive({}); // For activate/deactivate/archive PLAN
  const isUpdatingItemStatus = reactive({}); // For activate/deactivate/archive ITEM
  const isEditingQuantities = reactive({});
  const editableQuantities = reactive({});
  const isSavingQuantities = reactive({});
  const quantityErrors = reactive({});
  
  // --- Methods ---
  const formatDate = (dateString) => { if (!dateString) return 'N/A'; try { const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }; return new Intl.DateTimeFormat(undefined, options).format(new Date(dateString)); } catch (e) { return dateString; } };
  
  const fetchPatientPlans = async () => {
      if (!patientId.value) { loadError.value = "Invalid Patient ID."; isLoading.value = false; return; }
      isLoading.value = true; loadError.value = ''; plans.value = [];
      try {
          // Fetches non-archived plans by default from backend
          const response = await PatientPlanService.getPlansForPatient(patientId.value);
          plans.value = response.data;
          // Clear editing states
          Object.keys(isEditingQuantities).forEach(key => delete isEditingQuantities[key]);
          Object.keys(editableQuantities).forEach(key => delete editableQuantities[key]);
          Object.keys(quantityErrors).forEach(key => delete quantityErrors[key]);
      } catch (error) { console.error("Error fetching plans:", error); const message = error.response?.data?.message || 'Failed to load plans.'; loadError.value = message; toast.error(message); }
      finally { isLoading.value = false; }
  };
  
  // Filters out items marked as archived for display
  const activeItems = (items) => {
      if (!items) return [];
      return items.filter(item => !item.isArchived); // Check the isArchived flag from DTO
  };
  
  // Sorts the VISIBLE (non-archived) items, showing active first
  const sortedItems = (items) => {
       if (!items) return [];
       const displayItems = activeItems(items); // Filter out archived before sorting
       return [...displayItems].sort((a, b) => { if (a.isItemActive === b.isItemActive) { return (a.serviceName || '').localeCompare(b.serviceName || ''); } return a.isItemActive ? -1 : 1; });
  };
  
  const startEditQuantities = (item) => { const parentPlan = plans.value.find(p => p.serviceItems?.some(i => i.id === item.id)); if (!parentPlan?.isActive || !item.isItemActive) { toast.warning("Cannot edit quantities for inactive/archived plans or items."); return; } editableQuantities[item.id] = { total: item.totalQuantity, remaining: item.remainingQuantity }; quantityErrors[item.id] = ''; isEditingQuantities[item.id] = true; };
  const cancelEditQuantities = (itemId) => { delete editableQuantities[itemId]; delete isEditingQuantities[itemId]; delete quantityErrors[itemId]; };
  
  const handleSaveQuantities = async (itemId, planIndex, itemIndex) => {
      const edited = editableQuantities[itemId]; quantityErrors[itemId] = '';
      // Simple validation
      if (edited.remaining > edited.total) { quantityErrors[itemId] = "Remaining <= Total."; toast.error(quantityErrors[itemId]); return; }
      if (edited.total < 1) { quantityErrors[itemId] = "Total >= 1."; toast.error(quantityErrors[itemId]); return; }
      if (edited.remaining < 0) { quantityErrors[itemId] = "Remaining >= 0."; toast.error(quantityErrors[itemId]); return; }
  
      isSavingQuantities[itemId] = true;
      try {
          const updateData = { totalQuantity: edited.total, remainingQuantity: edited.remaining };
          const response = await PatientPlanService.updatePlanItemQuantities(itemId, updateData);
          // Find the correct item index in the possibly filtered/sorted display could be complex.
          // It's safer to update the source data directly if possible, or refetch.
          // Let's try finding in the original plan data.
          const plan = plans.value[planIndex];
          const originalItemIndex = plan?.serviceItems?.findIndex(i => i.id === itemId);
  
          if (originalItemIndex !== -1) {
               plan.serviceItems[originalItemIndex].totalQuantity = response.data.totalQuantity;
               plan.serviceItems[originalItemIndex].remainingQuantity = response.data.remainingQuantity;
               toast.success("Quantities updated.");
          } else {
               toast.warning("Item not found locally after update. Refetching...");
               await fetchPatientPlans(); // Refetch if local update fails
          }
          cancelEditQuantities(itemId);
      } catch (error) { console.error(`Error saving quantities ${itemId}:`, error); const message = error.response?.data?.message || 'Failed save.'; quantityErrors[itemId] = message; toast.error(message); }
      finally { delete isSavingQuantities[itemId]; }
  };
  
  // Plan Status Toggle (Activate/Deactivate using PATCH)
  const handleTogglePlanStatus = async (plan, desiredNewStatus) => {
      const action = desiredNewStatus ? "reactivate" : "deactivate";
      const confirmMessage = `Are you sure you want to ${action} Plan #${plan.id}? ${desiredNewStatus ? '(Checks service status, reactivates valid items.)' : '(Deactivates plan and active items.)'}`;
      if (!confirm(confirmMessage)) return;
  
      isUpdatingPlanStatus[plan.id] = true;
      try {
          // Calls PATCH /api/medic/patient-plans/{planId}/status
          await PatientPlanService.updatePlanStatus(plan.id, desiredNewStatus);
          toast.success(`Plan ${action} request processed.`);
  
          // Update local state directly for immediate feedback
          const planInState = plans.value.find(p => p.id === plan.id);
          if (planInState) {
              planInState.isActive = desiredNewStatus;
              // Also update item state locally based on backend logic expectation
              if (!desiredNewStatus && planInState.serviceItems) { // Deactivating plan
                   planInState.serviceItems.forEach(item => { if (item.isItemActive) item.isItemActive = false; });
              } else if (desiredNewStatus && planInState.serviceItems) { // Reactivating plan
                   // Need to know service status - local update is hard, REFETCH is safer
                   toast.info("Refreshing plan details...");
                   await fetchPatientPlans(); // Refetch after successful reactivation
                   return; // Exit early as refetch handles state
              }
          } else { await fetchPatientPlans(); } // Refetch if plan not found locally
  
      } catch (error) {
          console.error(`Error ${action}ing plan ${plan.id}:`, error);
          toast.error(error.response?.data?.message || `Failed to ${action} plan.`);
      } finally {
          // Use conditional delete to prevent errors if refetch removed the plan
          if (plan && isUpdatingPlanStatus[plan.id]) {
              delete isUpdatingPlanStatus[plan.id];
          }
      }
  };
  
  // Item Status Toggle (Activate/Deactivate using PATCH)
  const handleToggleItemStatus = async (item, desiredNewStatus) => {
      const action = desiredNewStatus ? "reactivate" : "deactivate";
      const parentPlan = plans.value.find(p => p.serviceItems?.some(i => i.id === item.id));
      if (!parentPlan?.isActive && desiredNewStatus) { toast.error("Cannot activate item: Parent plan inactive."); return; }
      if (!confirm(`Are you sure you want to ${action} item "${item.serviceName}"?`)) return;
  
      isUpdatingItemStatus[item.id] = true;
      try {
          // Calls PATCH /api/medic/patient-plan-items/{planItemId}/status
          await PatientPlanService.updatePlanItemStatus(item.id, desiredNewStatus);
  
          // Update local state directly (safer for simple toggle)
          item.isItemActive = desiredNewStatus;
          toast.success(`Item "${item.serviceName}" ${action}d successfully.`);
  
      } catch (error) {
           console.error(`Error ${action}ing item ${item.id}:`, error);
           toast.error(error.response?.data?.message || `Failed to ${action} item.`);
           // Optional: refetch on error?
           // await fetchPatientPlans();
      } finally {
           if (isUpdatingItemStatus[item.id]) {
               delete isUpdatingItemStatus[item.id];
           }
      }
  };
  
  // Plan Archive (Uses DELETE endpoint -> Soft Delete)
  const handleArchivePlan = async (plan, planIndex) => {
      if (!confirm(`ARCHIVE Plan #${plan.id}? It will be hidden from this view.`)) return;
      isUpdatingPlanStatus[plan.id] = true; // Reuse loading state
      try {
          await PatientPlanService.archivePatientPlan(plan.id); // DELETE call
          toast.success(`Plan #${plan.id} archived successfully.`);
          // Remove from the list locally immediately
          plans.value.splice(planIndex, 1);
      } catch (error) { console.error(`Error archiving plan ${plan.id}:`, error); toast.error(error.response?.data?.message || `Failed to archive plan.`); }
      finally { if (isUpdatingPlanStatus[plan.id]) { delete isUpdatingPlanStatus[plan.id]; } }
  };
  
  // Item Archive (Uses DELETE endpoint -> Soft Delete)
  const handleArchiveItem = async (item, planIndex, itemIndex) => {
      // Find the correct index in the *original* data array before potential sorting/filtering for display
      const originalItemIndex = plans.value[planIndex]?.serviceItems?.findIndex(i => i.id === item.id);
      if (originalItemIndex === undefined || originalItemIndex === -1) {
          toast.error("Could not find item reference locally.");
          return;
      }
  
      if (!confirm(`ARCHIVE item "${item.serviceName}"? It will be hidden.`)) return;
      isUpdatingItemStatus[item.id] = true; // Reuse loading state
      try {
          await PatientPlanService.archivePatientPlanItem(item.id); // DELETE call
          toast.success(`Item "${item.serviceName}" archived successfully.`);
          // Remove from the list locally immediately using original index
          if (plans.value[planIndex]?.serviceItems) {
              plans.value[planIndex].serviceItems.splice(originalItemIndex, 1);
          }
      } catch (error) { console.error(`Error archiving item ${item.id}:`, error); toast.error(error.response?.data?.message || `Failed to archive item.`); }
      finally { if (isUpdatingItemStatus[item.id]) { delete isUpdatingItemStatus[item.id]; } }
  };
  
  onMounted(fetchPatientPlans);
  </script>
  
  <style scoped>
      /* General & Layout */
      .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
      .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem; }
      .page-header h1 { margin-bottom: 0; }
      h1 { color: var(--dark-color); }
      .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); margin-bottom: 2rem; }
      .plan-section.inactive-plan { border-left: 5px solid #6c757d; opacity: 0.75; background-color: #f8f9fa; }
  
      /* Plan Header */
      .plan-header { border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;}
      .plan-header h2 { margin: 0; font-size: 1.4rem; display: flex; align-items: center; flex-wrap: wrap; gap: 0.8rem; color: var(--dark-color);}
      .plan-header h2 .status-badge { font-size: 0.8em; vertical-align: middle;}
      .plan-meta { font-size: 0.9em; color: #6c757d; margin-top: 0.2rem; flex-basis: 100%;}
      .plan-actions { margin-left: auto; display: flex; gap: 0.5rem; align-items: center;}
  
      .plan-notes { background-color: #f8f9fa; border-left: 3px solid var(--secondary-color); padding: 0.8rem 1rem; margin-bottom: 1.5rem; border-radius: 4px; font-size: 0.95em; color: #495057; }
      .plan-notes strong { color: var(--dark-color); }
      .card h3 { color: var(--dark-color); margin-bottom: 1rem; font-size: 1.2rem;}
  
      /* Items Table */
      .items-table { width: 100%; border-collapse: collapse; }
      .items-table th, .items-table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
      .items-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; }
      .items-table tbody tr:hover { background-color: #f1f3f5; }
      .items-table td.action-cell { text-align: right; white-space: nowrap; padding-right: 0.5rem; }
      .items-table td.action-cell .btn { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
      .items-table td.action-cell .btn + .btn { margin-left: 0.3rem; }
      .inactive-item td { color: #6c757d; font-style: italic; }
      .inactive-item .btn:not(.btn-success) { opacity: 0.6; /* Visually indicate disabled */ }
  
      /* Quantity Inputs */
      .qty-input.form-control { width: 70px; text-align: center; padding: 0.4rem 0.5rem; font-size: 0.9rem; height: auto; }
  
      /* Status Badge */
      .status-badge { padding: 0.3em 0.6em; font-size: 0.8rem; font-weight: 600; border-radius: var(--border-radius); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
      .status-badge.status-active { background-color: #d4edda; color: #155724; }
      .status-badge.status-inactive { background-color: #adb5bd; color: #495057; } /* Grey for inactive */
  
      /* Error row in table */
      .error-row td { padding: 0.5rem 1rem; border-bottom: 1px solid #f5c6cb; background-color: #f8d7da1a; }
      .error-message.small-error { font-size: 0.85em; padding: 0.4rem 0.8rem; margin-bottom: 0; gap: 0.3rem; border: none; background: none; color: #dc3545; justify-content: flex-end; display: block; text-align: right;}
      .error-message.small-error i { font-size: 1em; margin-right: 0.2rem;}
  
      /* Loading/Error/NoData */
      .loading-indicator { text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
      .loading-indicator i { font-size: 1.5rem; }
      .error-message { margin-bottom: 1rem; font-size: 0.95rem; }
      .no-data-message { text-align: center; padding: 2rem; color: #6c757d; font-style: italic; margin-top: 1rem; }
      .no-data-message.small { padding: 1rem; font-size: 0.9em; }
      .fa-spinner { animation: fa-spin 1.5s linear infinite; }
      @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  
      /* Rely on global button & form-control styles */
  </style>