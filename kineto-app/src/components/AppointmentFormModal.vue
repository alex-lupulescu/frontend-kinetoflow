// src/components/AppointmentFormModal.vue (Complete File with Fix)

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content appointment-modal-content">
        <button @click="closeModal" class="modal-close-button" title="Close">×</button>
        <h2>{{ editingAppointment ? 'Edit Appointment' : 'Create New Appointment' }}</h2>

        <!-- Display Time Slot -->
        <p class="time-slot-info" v-if="startTime && endTime">
            <i class="far fa-clock"></i>
            <!-- Use the newly defined function here -->
            {{ formatModalDateTimeRange(startTime, endTime) }}
            ({{ calculateDuration(startTime, endTime) }} min)
        </p>

        <form @submit.prevent="handleSubmit" class="modal-form">
             <!-- Patient Selection -->
             <div class="form-group" v-if="!editingAppointment"> {/* Allow pre-filled patient, disable selection when editing for now */}
                <label for="apptPatient" class="form-label">Patient *</label>
                
                <SearchableDropdown
                  v-model="editableAppointment.patientId"
                  :options="formattedPatientOptions"
                  :disabled="isLoadingPatients || isSubmitting"
                  :loading="isLoadingPatients"
                  placeholder="Select a patient..."
                  search-placeholder="Search patients..."
                  loading-text="Loading patients..."
                  no-options-text="No active patients assigned"
                  icon="fas fa-user"
                  label-key="name"
                  value-key="id"
                  subtext-key="contact"
                  meta-key="status"
                  :required="!editingAppointment"
                  :error-message="!editingAppointment && !editableAppointment.patientId ? 'Please select a patient' : ''"
                />
                
             </div>
             <div v-else-if="editingAppointment && appointmentData" class="form-group">
                <label class="form-label">Patient:</label>
                <p><strong>{{ appointmentData.extendedProps?.patientName || 'N/A' }}</strong></p>
                 <input type="hidden" v-model="editableAppointment.patientId"> {/* Keep ID for submission */}
             </div>


             <!-- Service / Plan Item Selection -->
             <div class="form-group">
                <label for="apptService" class="form-label">Service / Plan Item *</label>
                
                <SearchableDropdown
                  v-model="selectedServiceOrPlanItemId"
                  :options="formattedServiceOptions"
                  :disabled="isLoadingServices || isLoadingPatientPlans || isSubmitting || !editableAppointment.patientId"
                  :loading="isLoadingServices || isLoadingPatientPlans"
                  placeholder="Select service or plan item..."
                  search-placeholder="Search services..."
                  loading-text="Loading options..."
                  no-options-text="No services available"
                  icon="fas fa-tools"
                  label-key="name"
                  value-key="uniqueId"
                  subtext-key="details"
                  meta-key="price"
                  icon-key="icon"
                  :required="true"
                  :error-message="!selectedServiceOrPlanItemId ? 'Please select a service' : ''"
                />
                
                <div v-if="!editableAppointment.patientId && !editingAppointment" class="text-muted small mt-1"> Please select a patient first. </div>
             </div>

             <!-- Notes -->
             <div class="form-group">
                 <label for="apptNotes" class="form-label">Notes (Optional)</label>
                 <textarea id="apptNotes" v-model="editableAppointment.notes" rows="3" placeholder="Appointment specific notes..." class="form-control" :disabled="isSubmitting"></textarea>
             </div>

             <!-- Error Display -->
            <div v-if="formError" class="error-message modal-error">{{ formError }}</div>

             <!-- Actions -->
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-cancel" :disabled="isSubmitting">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isFormValid || isLoadingServices || isLoadingPatientPlans">
                <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> {{ editingAppointment ? 'Saving...' : 'Booking...' }}</span>
                <span v-else>{{ editingAppointment ? 'Save Changes' : 'Book Appointment' }}</span>
              </button>
            </div>
        </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import UserService from '@/services/UserService';
import MedicService from '@/services/MedicService';
import PatientPlanService from '@/services/PatientPlanService';
import SearchableDropdown from '@/components/SearchableDropdown.vue';

// --- Props and Emits ---
const props = defineProps({
  startTime: { type: [Date, String], required: true }, // Allow string initially
  endTime: { type: [Date, String], required: true },   // Allow string initially
  appointmentData: { type: Object, default: null }     // For editing
});
const emit = defineEmits(['close', 'save']);
const toast = useToast();

// --- State ---
const editableAppointment = reactive({ patientId: null, serviceId: null, patientPlanServiceItemId: null, notes: '' });
const selectedServiceOrPlanItemId = ref(null);
const availablePatients = ref([]);
const availableServices = ref([]);
const patientPlansWithPayments = ref([]);
const isLoadingPatients = ref(false);
const isLoadingServices = ref(false);
const isLoadingPatientPlans = ref(false);
const isSubmitting = ref(false);
const formError = ref('');

// --- Computed ---
const editingAppointment = computed(() => !!props.appointmentData);
const isFormValid = computed(() => editableAppointment.patientId && selectedServiceOrPlanItemId.value);

// Computed properties for SearchableDropdown options
const formattedPatientOptions = computed(() => {
    return availablePatients.value.map(patient => ({
        id: patient.id,
        name: patient.name,
        contact: patient.email || patient.phoneNumber || 'No contact info',
        status: patient.isActive ? 'Active' : 'Inactive',
        icon: 'fas fa-user'
    }));
});

const formattedServiceOptions = computed(() => {
    const options = [];
    
    // Add plan items first (from patient's plans with payment info)
    patientPlansWithPayments.value.forEach(item => {
        const paymentStatus = item.isPaid ? 'PAID' : 'UNPAID';
        const paymentIcon = item.isPaid ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        const paymentColor = item.isPaid ? '#28a745' : '#ffc107';
        
        options.push({
            uniqueId: `planitem-${item.id}`,
            name: `${item.serviceName} (Plan)`,
            details: `${item.remainingQuantity}/${item.totalQuantity} sessions remaining`,
            price: '', // Plan items typically don't show individual price
            icon: paymentIcon,
            type: 'planItem',
            id: item.id,
            serviceId: item.serviceId,
            remainingQuantity: item.remainingQuantity,
            totalQuantity: item.totalQuantity,
            // Payment information
            isPaid: item.isPaid,
            paymentStatus: paymentStatus,
            paymentStatusText: item.isPaid ? 'Paid' : 'Unpaid',
            paymentIcon: paymentIcon,
            paymentColor: paymentColor,
            planPaymentStatus: item.planPaymentStatus,
            dueAmount: item.dueAmount
        });
    });
    
    // Add standard services
    availableServices.value.forEach(service => {
        options.push({
            uniqueId: `service-${service.id}`,
            name: service.name,
            details: `${service.durationMinutes} minutes`,
            price: service.price ? formatCurrency(service.price) : '',
            icon: 'fas fa-tools',
            type: 'service',
            id: service.id,
            serviceId: service.id,
            // Standard services are always "pay-per-session"
            isPaid: false,
            paymentStatus: 'PAY_PER_SESSION',
            paymentStatusText: 'Pay per session',
            paymentIcon: 'fas fa-credit-card',
            paymentColor: '#6c757d'
        });
    });
    
    return options;
});

// --- Methods ---
const closeModal = () => { emit('close'); };
const formatCurrency = (value) => { if (value === null || value === undefined) return ''; return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); };
const calculateDuration = (start, end) => { if (!start || !end) return 0; return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)); };

// ==== ADD THIS FUNCTION ====
const formatModalDateTimeRange = (start, end) => {
    if (!start || !end) return 'N/A';
     const optionsDate = { timeZone: 'Europe/Bucharest', dateStyle: 'short'}; // Date only
     const optionsTime = { timeZone: 'Europe/Bucharest', timeStyle: 'short'}; // Time only
     try {
         const startDate = new Date(start); // Ensure Date objects
         const endDate = new Date(end);
         // Check if start and end are on the same day
         if (startDate.toDateString() === endDate.toDateString()) {
             return `${startDate.toLocaleDateString(undefined, optionsDate)}, ${startDate.toLocaleTimeString(undefined, optionsTime)} - ${endDate.toLocaleTimeString(undefined, optionsTime)}`;
         } else {
             // If spans multiple days, show both dates
             return `${startDate.toLocaleString(undefined, optionsDate)} ${startDate.toLocaleTimeString(undefined, optionsTime)} - ${endDate.toLocaleString(undefined, optionsDate)} ${endDate.toLocaleTimeString(undefined, optionsTime)}`;
         }
     }
     catch(e) { console.error("Date formatting error:", e); return 'Invalid Date Range'; }
};
// ==== END ADDED FUNCTION ====

const fetchPatients = async () => { isLoadingPatients.value = true; availablePatients.value = []; try { const r = await UserService.getAssignedPatients(); availablePatients.value = r.data; } catch(e) { toast.error("Failed to load patients."); } finally { isLoadingPatients.value = false; } };
const fetchServices = async () => { isLoadingServices.value = true; availableServices.value = []; try { const r = await MedicService.getActiveCompanyServices(); availableServices.value = r.data; } catch(e) { toast.error("Failed to load services."); } finally { isLoadingServices.value = false; } };

const fetchPatientPlanItems = async (pId) => { 
    if (!pId) { 
        patientPlansWithPayments.value = []; 
        return; 
    } 
    
    isLoadingPatientPlans.value = true; 
    patientPlansWithPayments.value = []; 
    
    try { 
        const response = await MedicService.getPatientPlansWithPayments(pId);
        
        // Process the plans with payment info
        let items = [];
        response.forEach(plan => {
            if (plan.isActive && !plan.isArchived && plan.serviceItems) {
                plan.serviceItems.forEach(item => {
                    if (item.isItemActive && !item.isArchived && item.remainingQuantity > 0) {
                        items.push({
                            id: `item-${item.id}`,
                            planId: plan.id,
                            serviceId: item.serviceId,
                            serviceName: item.serviceName,
                            remainingQuantity: item.remainingQuantity,
                            totalQuantity: item.totalQuantity,
                            pricePerUnit: item.pricePerUnit,
                            // Payment status information
                            planPaymentStatus: plan.planPaymentStatus,
                            paidAmount: plan.paidAmount,
                            totalPlanCost: plan.totalPlanCost,
                            dueAmount: plan.dueAmount,
                            isPaid: plan.planPaymentStatus === 'PAID' || plan.dueAmount === 0
                        });
                    }
                });
            }
        });
        
        patientPlansWithPayments.value = items;
    } catch(e) { 
        console.error("Error fetching patient plans with payments:", e); 
        toast.error("Could not load plan items with payment info."); 
        patientPlansWithPayments.value = []; 
    } finally { 
        isLoadingPatientPlans.value = false; 
    } 
};

// --- Watchers ---
watch(() => editableAppointment.patientId, (newPatientId) => { 
    selectedServiceOrPlanItemId.value = null; 
    editableAppointment.serviceId = null; 
    editableAppointment.patientPlanServiceItemId = null; 
    fetchPatientPlanItems(newPatientId); 
});

watch(selectedServiceOrPlanItemId, (newSelectionId) => { 
    if (!newSelectionId) {
        editableAppointment.serviceId = null;
        editableAppointment.patientPlanServiceItemId = null;
        return;
    }
    
    // Find the selected option from formatted options
    const selectedOption = formattedServiceOptions.value.find(opt => opt.uniqueId === newSelectionId);
    if (selectedOption) {
        editableAppointment.serviceId = selectedOption.serviceId;
        editableAppointment.patientPlanServiceItemId = selectedOption.type === 'planItem' ? 
            parseInt(selectedOption.id.toString().replace('item-',''), 10) : null;
    }
});

// --- Initialize ---
const initializeForm = () => {
    if (editingAppointment.value) {
        console.log("Init Edit:", props.appointmentData);
        const existingEvent = props.appointmentData;
        const existingProps = existingEvent.extendedProps || {};
        editableAppointment.patientId = existingProps.patientId;
        editableAppointment.serviceId = existingProps.serviceId;
        editableAppointment.patientPlanServiceItemId = existingProps.patientPlanServiceItemId;
        editableAppointment.notes = existingProps.notes || '';
        
        // Set initial dropdown selection based on existing data
        if(existingProps.patientPlanServiceItemId) { 
            selectedServiceOrPlanItemId.value = `planitem-item-${existingProps.patientPlanServiceItemId}`;
        }
        else if (existingProps.serviceId) { 
            selectedServiceOrPlanItemId.value = `service-${existingProps.serviceId}`;
        }
        else { 
            selectedServiceOrPlanItemId.value = null; 
        }
        
        if (editableAppointment.patientId) { 
            fetchPatientPlanItems(editableAppointment.patientId); 
        }
    } else {
         Object.assign(editableAppointment, { patientId: null, serviceId: null, patientPlanServiceItemId: null, notes: '' });
         selectedServiceOrPlanItemId.value = null;
    }
};

// --- Submit ---
const handleSubmit = async () => {
    formError.value = ''; if (!isFormValid.value) { formError.value = "Patient & Service required."; return; } isSubmitting.value = true;
    try {
        if (!props.startTime || !props.endTime) throw new Error("Time missing.");
        const appointmentPayload = { patientId: editableAppointment.patientId, serviceId: editableAppointment.serviceId, scheduledStartTime: new Date(props.startTime).toISOString(), scheduledEndTime: new Date(props.endTime).toISOString(), notes: editableAppointment.notes, patientPlanServiceItemId: editableAppointment.patientPlanServiceItemId };
        console.log("Submitting Appt:", appointmentPayload);
        if (editingAppointment.value) { console.warn("Update NYI."); toast.info("Update NYI"); /* await MedicService.updateAppointment(props.appointmentData.id_from_event, appointmentPayload); */ }
        else { await MedicService.createAppointment(appointmentPayload); toast.success("Booked!"); }
        emit('save'); closeModal();
    } catch (error) { console.error("Error saving appt:", error); formError.value = error.response?.data?.message || "Failed."; toast.error(formError.value); }
    finally { isSubmitting.value = false; }
};

// --- Lifecycle ---
onMounted(() => {
    initializeForm(); // Keep this to set initial values based on props

    // --- FIX: Call the correct fetch functions ---
    fetchPatients(); // Call fetchPatients directly if needed when creating
    fetchServices(); // Call fetchServices directly
    // fetchDataForModal(); // REMOVE THIS LINE
    // --- END FIX ---

    // Fetch plan items only if editing and patient known, or wait for selection change
    if(editingAppointment.value && editableAppointment.patientId) {
        fetchPatientPlanItems(editableAppointment.patientId);
    }
});
</script>

<style scoped>
    /* Styles remain the same */
    .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 1rem; }
    .modal-content { background-color: #fff; padding: 2rem 2.5rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark); position: relative; width: 90%; max-width: 600px; max-height: 90vh; display: flex; flex-direction: column; }
    .modal-close-button { position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem; font-weight: bold; color: #aaa; background: none; border: none; cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem; }
    .modal-close-button:hover { color: #777; }
    .modal-content h2 { color: var(--dark-color); margin-top: 0; margin-bottom: 0.5rem; font-size: 1.4rem; text-align: center; flex-shrink: 0; }
    .time-slot-info { text-align: center; font-weight: 600; color: var(--dark-color); background-color: #e9ecef; padding: 0.5rem; border-radius: var(--border-radius); margin-bottom: 1.5rem; flex-shrink: 0;}
    .time-slot-info i { margin-right: 0.5rem; color: var(--primary-color-start); }
    .modal-form { overflow-y: auto; padding-right: 5px; flex-grow: 1; }
    .modal-form .form-group { margin-bottom: 1.5rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; flex-shrink: 0; }
    .modal-error { margin-top: 1rem; margin-bottom: 0; font-size: 0.9em; color: #dc3545; } /* Style for form error */

    .form-label { display: block; margin-bottom: 0.6rem; font-weight: 600; font-size: 0.95rem; color: var(--dark-color); }
    .form-control { display: block; width: 100%; padding: 0.7rem 1rem; font-size: 1rem; font-weight: 400; line-height: 1.5; color: var(--text-color); background-color: #fff; background-clip: padding-box; border: 1px solid #ced4da; appearance: none; border-radius: var(--border-radius); transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out; }
    .form-control:focus { border-color: var(--primary-color-start); outline: 0; box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-start-rgb),.25); }
    .form-control:disabled, .form-control[readonly] { background-color: #e9ecef; opacity: 1; cursor: not-allowed; }
    select.form-control { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 16px 12px; padding-right: 3rem; }
    textarea.form-control { resize: vertical; min-height: 80px; }
    select#apptService optgroup { font-style: italic; font-weight: bold; color: #555; background-color: #f0f0f0; padding-top: 5px; padding-bottom: 3px; }
    select#apptService option:disabled { color: #adb5bd; font-style: italic; }
    .loading-inline { font-style: italic; color: #6c757d; padding: 0.5rem 0; font-size: 0.9em;}
    .text-muted { color: #6c757d; }
    .small { font-size: 0.85em; }
    .mt-1 { margin-top: 0.25rem; }
    .fa-spinner { animation: fa-spin 1.5s linear infinite; }
    @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>