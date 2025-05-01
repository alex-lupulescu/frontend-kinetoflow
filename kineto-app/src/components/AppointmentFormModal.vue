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
                 <select id="apptPatient" v-model="editableAppointment.patientId" class="form-control" required :disabled="isLoadingPatients || isSubmitting">
                     <option :value="null" disabled>-- Select Patient --</option>
                     <option v-for="patient in availablePatients" :key="patient.id" :value="patient.id"> {{ patient.name }} (ID: {{ patient.id }}) </option>
                 </select>
                 <div v-if="isLoadingPatients" class="loading-inline small"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
                 <div v-if="!isLoadingPatients && availablePatients.length === 0" class="text-muted small mt-1">No active patients assigned.</div>
             </div>
             <div v-else-if="editingAppointment && appointmentData" class="form-group">
                <label class="form-label">Patient:</label>
                <p><strong>{{ appointmentData.extendedProps?.patientName || 'N/A' }}</strong></p>
                 <input type="hidden" v-model="editableAppointment.patientId"> {/* Keep ID for submission */}
             </div>


             <!-- Service / Plan Item Selection -->
             <div class="form-group">
                <label for="apptService" class="form-label">Service / Plan Item *</label>
                <select id="apptService" v-model="selectedServiceOrPlanItem" class="form-control" required :disabled="isLoadingServices || isLoadingPatientPlans || isSubmitting || !editableAppointment.patientId">
                    <option :value="null" disabled>-- Select Service or Plan Item --</option>
                    <optgroup label="From Patient Plan (Remaining Sessions)" v-if="patientPlanItems.length > 0">
                        <option v-for="item in patientPlanItems" :key="`planitem-${item.id}`" :value="{ type: 'planItem', id: item.id, serviceId: item.serviceId }"> {{ item.serviceName }} ({{ item.remainingQuantity }}/{{ item.totalQuantity }} left) </option>
                    </optgroup>
                     <optgroup label="Standard Company Services">
                        <option v-for="service in availableServices" :key="`service-${service.id}`" :value="{ type: 'service', id: service.id, serviceId: service.id }"> {{ service.name }} ({{ service.durationMinutes }} min) {{ service.price ? ' - ' + formatCurrency(service.price) : ''}} </option>
                        <option v-if="availableServices.length === 0" disabled>No active services found</option>
                    </optgroup>
                 </select>
                <div v-if="isLoadingServices || isLoadingPatientPlans" class="loading-inline small"><i class="fas fa-spinner fa-spin"></i> Loading options...</div>
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
const selectedServiceOrPlanItem = ref(null);
const availablePatients = ref([]);
const availableServices = ref([]);
const patientPlanItems = ref([]);
const isLoadingPatients = ref(false);
const isLoadingServices = ref(false);
const isLoadingPatientPlans = ref(false);
const isSubmitting = ref(false);
const formError = ref('');

// --- Computed ---
const editingAppointment = computed(() => !!props.appointmentData);
const isFormValid = computed(() => editableAppointment.patientId && selectedServiceOrPlanItem.value?.serviceId);

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
const fetchPatientPlanItems = async (pId) => { if (!pId) { patientPlanItems.value = []; return; } isLoadingPatientPlans.value = true; patientPlanItems.value = []; try { const r = await PatientPlanService.getPlansForPatient(pId); let items = []; r.data.forEach(p => { if (p.isActive && !p.isArchived && p.serviceItems) { p.serviceItems.forEach(i => { if (i.isItemActive && !i.isArchived && i.remainingQuantity > 0) items.push({id: `item-${i.id}`, pId: p.id, sId: i.serviceId, sName: i.serviceName, rem: i.remainingQuantity, tot: i.totalQuantity}); });}}); patientPlanItems.value = items.map(i=>({...i, id:i.id, serviceId:i.sId, serviceName: i.sName, remainingQuantity:i.rem, totalQuantity:i.tot})); } catch(e) { console.error("Err fetch plans:", e); toast.error("Could not load plan items."); patientPlanItems.value = []; } finally { isLoadingPatientPlans.value = false; } };

// --- Watchers ---
watch(() => editableAppointment.patientId, (newPatientId) => { selectedServiceOrPlanItem.value = null; editableAppointment.serviceId = null; editableAppointment.patientPlanServiceItemId = null; fetchPatientPlanItems(newPatientId); });
watch(selectedServiceOrPlanItem, (newSelection) => { editableAppointment.serviceId = newSelection?.serviceId || null; editableAppointment.patientPlanServiceItemId = newSelection?.type === 'planItem' ? parseInt(newSelection.id.replace('item-',''), 10) : null; });

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
        // Set initial dropdown selection
        if(existingProps.patientPlanServiceItemId) { selectedServiceOrPlanItem.value = {type: 'planItem', id: `item-${existingProps.patientPlanServiceItemId}`, serviceId: existingProps.serviceId}; }
        else if (existingProps.serviceId) { selectedServiceOrPlanItem.value = {type: 'service', id: `service-${existingProps.serviceId}`, serviceId: existingProps.serviceId}; }
        else { selectedServiceOrPlanItem.value = null; }
        if (editableAppointment.patientId) { fetchPatientPlanItems(editableAppointment.patientId); } // Fetch plans if patient known
    } else {
         Object.assign(editableAppointment, { patientId: null, serviceId: null, patientPlanServiceItemId: null, notes: '' });
         selectedServiceOrPlanItem.value = null;
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