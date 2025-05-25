// src/views/medic/MedicMyPatients.vue (Complete File)

<template>
  <div class="page-container">
    <div class="page-header">
        <h1>My Patients</h1>
        <!-- Invite Patient Button -->
        <button @click="openInvitePatientModal" class="btn btn-primary">
            <i class="fas fa-user-plus"></i> Invite New Patient
        </button>
    </div>
    <!-- Removed redundant <p> tag here -->

    <!-- Active Patients List -->
    <section class="card list-section">
        <h2>My Patients</h2>
        <p>List of all patients (active and inactive) currently assigned to you.</p>

        <!-- Search Bar for Assigned Patients -->
        <div class="list-controls">
            <input type="text" v-model="assignedPatientsSearchTerm" placeholder="Search by name, email, phone..." class="form-control search-input">
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoadingAssignedPatients" class="loading-indicator">
             <i class="fas fa-spinner fa-spin"></i> Loading patients...
        </div>
        <!-- Loading Error Message -->
        <div v-if="loadAssignedPatientsError" class="error-message table-error">
            <i class="fas fa-exclamation-triangle"></i> {{ loadAssignedPatientsError }}
        </div>

        <!-- Patient List Table: Show only if NOT loading AND there ARE patients -->
        <table v-if="!isLoadingAssignedPatients && filteredAndPaginatedAssignedPatients.length > 0" class="data-table patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredAndPaginatedAssignedPatients" :key="'assigned-'+patient.id" :class="{ 'inactive-row': !patient.isActive }">
                <td>{{ patient.id }}</td>
                <td>{{ patient.name }}</td>
                <td>{{ patient.email || 'N/A' }}</td>
                <td>{{ patient.phoneNumber || 'N/A' }}</td>
                <td>
                    <span :class="patient.isActive ? 'status-active' : 'status-inactive'">
                        {{ patient.isActive ? 'Active' : 'Inactive' }}
                    </span>
                </td>
                <td>
                   <!-- View Plan Button (Future) -->
                   <button @click="viewPatientPlan(patient.id)" class="btn btn-info btn-sm" title="View Plan Details">
                      <i class="fas fa-eye"></i> Plan
                   </button>
                   <!-- Assign Plan Button -->
                   <button @click="openAssignPlanModal(patient)" class="btn btn-primary btn-sm" title="Assign New Plan/Package">
                      <i class="fas fa-plus-circle"></i> Assign Plan
                   </button>
                   <!-- Edit Patient Button -->
                   <button @click="openEditPatientModal(patient)" class="btn btn-warning btn-sm" title="Edit Patient Details">
                       <i class="fas fa-edit"></i> Edit
                   </button>
                  <!-- Schedule Button (Future) -->
                  <button @click="scheduleAppointment(patient.id)" class="btn btn-secondary btn-sm" title="Schedule Appointment">
                     <i class="fas fa-calendar-plus"></i> Schedule
                  </button>
                </td>
              </tr>
            </tbody>
        </table>

        <!-- Pagination for Assigned Patients -->
        <div v-if="!isLoadingAssignedPatients && allAssignedPatients.length > 0 && totalAssignedPatientPages > 1" class="pagination-controls">
            <button @click="goToAssignedPatientsPage(assignedPatientsCurrentPage - 1)" :disabled="assignedPatientsCurrentPage === 1" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span>Page {{ assignedPatientsCurrentPage }} of {{ totalAssignedPatientPages }}</span>
            <button @click="goToAssignedPatientsPage(assignedPatientsCurrentPage + 1)" :disabled="assignedPatientsCurrentPage === totalAssignedPatientPages" class="btn btn-sm btn-outline-secondary">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <!-- No Data Message: Show only if NOT loading, NO error, AND NO patients after filtering/initial load -->
        <p v-if="!isLoadingAssignedPatients && !loadAssignedPatientsError && allAssignedPatients.length === 0" class="no-data-message">
             You currently have no patients assigned.
        </p>
        <p v-if="!isLoadingAssignedPatients && !loadAssignedPatientsError && allAssignedPatients.length > 0 && filteredAndPaginatedAssignedPatients.length === 0" class="no-data-message">
            No patients found matching your search criteria.
        </p>
    </section>

    <!-- Pending Invitations List -->
     <section class="card list-section">
        <h2>Pending Invitations</h2>
        <p>Patients you have invited who haven't activated their account yet.</p>

        <!-- Search Bar for Pending Invites -->
        <div class="list-controls">
            <input type="text" v-model="pendingInvitesSearchTerm" placeholder="Search by name, email, phone..." class="form-control search-input">
        </div>

         <!-- Loading Indicator -->
         <div v-if="isLoadingPending" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Loading pending invites...
         </div>
          <!-- Loading Error Message -->
         <div v-if="loadPendingError" class="error-message table-error">
            <i class="fas fa-exclamation-triangle"></i> {{ loadPendingError }}
         </div>
         <!-- Pending Invites Table: Show if not loading AND there are invites -->
         <table v-if="!isLoadingPending && filteredAndPaginatedPendingInvites.length > 0" class="data-table pending-table">
             <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Invited On (Approx)</th>
                    <th>Actions</th>
                </tr>
             </thead>
             <tbody>
               <tr v-for="invitee in filteredAndPaginatedPendingInvites" :key="'pending-'+invitee.id">
                 <td>{{ invitee.name }}</td>
                 <td>{{ invitee.email || 'N/A' }}</td>
                 <td>{{ invitee.phoneNumber || 'N/A' }}</td>
                 <td>{{ formatDate(invitee.updatedAt) }}</td>
                 <td>
                   <!-- Resend Button -->
                   <button @click="handleResendInvite(invitee)" class="btn btn-success btn-sm" title="Resend Invitation" :disabled="isResending[invitee.id] || isCancelling[invitee.id]">
                      <span v-if="isResending[invitee.id]"><i class="fas fa-spinner fa-spin"></i></span>
                      <span v-else><i class="fas fa-paper-plane"></i> Resend</span>
                   </button>
                    <!-- Cancel Button -->
                   <button @click="handleCancelInvite(invitee)" class="btn btn-danger btn-sm" title="Cancel Invitation" :disabled="isResending[invitee.id] || isCancelling[invitee.id]">
                       <span v-if="isCancelling[invitee.id]"><i class="fas fa-spinner fa-spin"></i></span>
                       <span v-else><i class="fas fa-user-times"></i> Cancel</span>
                   </button>
                 </td>
               </tr>
             </tbody>
           </table>

            <!-- Pagination for Pending Invites -->
            <div v-if="!isLoadingPending && allPendingInvites.length > 0 && totalPendingInvitePages > 1" class="pagination-controls">
                <button @click="goToPendingInvitesPage(pendingInvitesCurrentPage - 1)" :disabled="pendingInvitesCurrentPage === 1" class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-chevron-left"></i> Prev
                </button>
                <span>Page {{ pendingInvitesCurrentPage }} of {{ totalPendingInvitePages }}</span>
                <button @click="goToPendingInvitesPage(pendingInvitesCurrentPage + 1)" :disabled="pendingInvitesCurrentPage === totalPendingInvitePages" class="btn btn-sm btn-outline-secondary">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>

            <!-- No Pending Message: Show if not loading, no error, AND NO pending invites after filtering/initial load -->
            <p v-if="!isLoadingPending && !loadPendingError && allPendingInvites.length === 0" class="no-data-message">
                No pending patient invitations found.
            </p>
            <p v-if="!isLoadingPending && !loadPendingError && allPendingInvites.length > 0 && filteredAndPaginatedPendingInvites.length === 0" class="no-data-message">
                No pending invitations found matching your search criteria.
            </p>
      </section>


    <!-- Edit Patient Modal -->
    <div v-if="showEditPatientModal" class="modal-overlay" @click.self="closeEditPatientModal">
        <div class="modal-content">
            <button @click="closeEditPatientModal" class="modal-close-button" title="Close">×</button>
            <h2>Edit Patient: {{ patientToEditData?.name }}</h2>
            <form @submit.prevent="handleUpdatePatientDetails" class="modal-form">
                <div class="form-group">
                    <label for="editPatientName" class="form-label">Patient Name *</label>
                    <input type="text" id="editPatientName" v-model="editPatientForm.name" required placeholder="Enter patient's full name" :disabled="isUpdatingPatient" class="form-control">
                </div>
                <div class="form-group">
                    <label for="editPatientPhone" class="form-label">Patient Phone *</label>
                    <input type="tel" id="editPatientPhone" v-model="editPatientForm.phone" required placeholder="Enter patient's phone number" :disabled="isUpdatingPatient" class="form-control">
                </div>
                <div class="form-group">
                    <label for="editPatientEmail" class="form-label">Patient Email</label>
                    <input type="email" id="editPatientEmail" v-model="editPatientForm.email" placeholder="Enter patient's email (optional)" :disabled="isUpdatingPatient" class="form-control">
                    <small v-if="patientToEditData?.isActive && !patientToEditData?.email" class="text-muted">Adding an email here will not activate the patient. You may need to resend an invitation if they were offline.</small>
                    <small v-else-if="patientToEditData?.isActive && patientToEditData?.email" class="text-muted">Active patients must have an email.</small>
                </div>
                <div v-if="editPatientError" class="error-message modal-error">{{ editPatientError }}</div>
                <div class="modal-actions">
                    <button type="button" @click="closeEditPatientModal" class="btn btn-cancel" :disabled="isUpdatingPatient">Cancel</button>
                    <button type="submit" class="btn btn-primary" :disabled="isUpdatingPatient || !editPatientForm.name || !editPatientForm.phone">
                        <span v-if="isUpdatingPatient"><i class="fas fa-spinner fa-spin"></i> Updating...</span>
                        <span v-else>Save Changes</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Assign Plan Modal -->
    <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
        <div class="modal-content assign-modal-content">
            <button @click="closeAssignModal" class="modal-close-button" title="Close">×</button>
            <h2>Assign Plan to {{ patientToAssign?.name }}</h2>
            <form @submit.prevent="handleAssignPlan" class="modal-form">

                 <!-- Assignment Type Radio -->
                 <div class="form-group">
                    <label class="form-label">Assignment Type:</label>
                    <div class="radio-toggle-group">
                        <label class="radio-toggle-label" :class="{ active: assignmentType === 'package' }">
                            <input type="radio" name="assignmentType" value="package" v-model="assignmentType" :disabled="isAssigning">
                            <i class="fas fa-box-open"></i> Assign Package
                        </label>
                        <label class="radio-toggle-label" :class="{ active: assignmentType === 'custom' }">
                            <input type="radio" name="assignmentType" value="custom" v-model="assignmentType" :disabled="isAssigning">
                            <i class="fas fa-bars"></i> Custom Services
                        </label>
                    </div>
                 </div>

                 <!-- Package Selection -->
                <div v-if="assignmentType === 'package'" class="form-group">
                    <label for="assignPackageSelect" class="form-label">Select Package *</label>
                     <div v-if="isLoadingPackages" class="loading-inline small">Loading packages...</div>
                     <div v-if="loadPackagesError" class="error-message small">{{ loadPackagesError }}</div>
                    <select id="assignPackageSelect" v-model="selectedPackageId" class="form-control" required :disabled="isAssigning || isLoadingPackages || availablePackages.length === 0">
                        <option :value="null" disabled>-- Select an active package --</option>
                        <option v-for="pkg in availablePackages" :key="pkg.id" :value="pkg.id"> {{ pkg.name }} {{ pkg.totalPrice ? '(' + formatCurrency(pkg.totalPrice) + ')' : '' }} </option>
                    </select>
                     <div v-if="!isLoadingPackages && availablePackages.length === 0" class="text-muted small mt-1"> No active packages found. </div>
                </div>

                <!-- Custom Service Selection -->
                <div v-if="assignmentType === 'custom'" class="form-group service-items-group">
                   <label class="form-label">Select Services & Quantities *</label>
                    <div v-if="isLoadingServices" class="loading-inline small">Loading services...</div>
                    <div v-if="loadServicesError" class="error-message small">{{ loadServicesError }}</div>
                    <div v-if="!isLoadingServices && availableServices.length === 0" class="text-muted small mt-1"> No active services available. </div>
                    <div v-if="!isLoadingServices && availableServices.length > 0">
                        <div v-for="(item, index) in customServiceItems" :key="item.formKey" class="service-item-row">
                           <select v-model="item.serviceId" required :disabled="isAssigning" class="item-select form-control">
                             <option disabled :value="null">-- Select Service --</option>
                             <option v-for="service in availableServices" :key="service.id" :value="service.id"> {{ service.name }} ({{ service.durationMinutes }} min) </option>
                           </select>
                           <input type="number" v-model.number="item.quantity" min="1" required placeholder="Qty" class="item-quantity form-control" :disabled="isAssigning">
                           <button type="button" @click="removeCustomItem(index)" class="btn btn-danger btn-sm btn-remove" title="Remove Item" :disabled="isAssigning"> <i class="fas fa-trash"></i> </button>
                        </div>
                        <button type="button" @click="addCustomItem" class="btn btn-secondary btn-sm add-item-btn" :disabled="isAssigning || availableServices.length === 0"> <i class="fas fa-plus"></i> Add Service </button>
                        <div v-if="customItemsError" class="error-message form-error small">{{ customItemsError }}</div>
                    </div>
                </div>

                 <!-- Common Fields -->
                 <div class="form-group">
                     <label for="assignNotes" class="form-label">Notes (Optional)</label>
                     <textarea id="assignNotes" v-model="planNotes" rows="3" placeholder="Any specific notes for this plan..." :disabled="isAssigning" class="form-control"></textarea>
                 </div>

                 <!-- Errors and Actions -->
                <div v-if="assignError" class="error-message modal-error">{{ assignError }}</div>
                <div class="modal-actions">
                    <button type="button" @click="closeAssignModal" class="btn btn-cancel" :disabled="isAssigning">Cancel</button>
                    <button type="submit" class="btn btn-primary" :disabled="isAssigning || isLoadingPackages || isLoadingServices || !isAssignmentValid">
                        <span v-if="isAssigning"><i class="fas fa-spinner fa-spin"></i> Assigning...</span> <span v-else>Assign Plan</span>
                    </button>
                </div>
            </form>
        </div>
     </div>

     <!-- Invite Patient Modal -->
      <div v-if="showInviteModal" class="modal-overlay" @click.self="closeInvitePatientModal">
            <div class="modal-content">
                 <button @click="closeInvitePatientModal" class="modal-close-button" title="Close">×</button>
                 <h2>Invite New Patient</h2>
                 <p>An email invitation will be sent to the patient to set up their account. If no email is provided, the patient will be added as an offline account.</p>
                 <form @submit.prevent="handleSendPatientInvitation" class="modal-form">
                      <div class="form-group">
                         <label for="invitePatientName" class="form-label">Patient Name *</label>
                         <input type="text" id="invitePatientName" v-model="invitePatientName" required placeholder="Enter patient's full name" :disabled="isInvitingPatient" class="form-control">
                     </div>
                     <div class="form-group">
                        <label for="invitePatientPhone" class="form-label">Patient Phone *</label>
                        <input type="tel" id="invitePatientPhone" v-model="invitePatientPhone" required placeholder="Enter patient's phone number" :disabled="isInvitingPatient" class="form-control">
                    </div>
                    <div class="form-group">
                         <label for="invitePatientEmail" class="form-label">Patient Email (Optional)</label>
                         <input type="email" id="invitePatientEmail" v-model="invitePatientEmail" placeholder="Enter patient's email address" :disabled="isInvitingPatient" class="form-control">
                     </div>
                      <div v-if="invitePatientError" class="error-message modal-error">{{ invitePatientError }}</div>
                      <div class="modal-actions">
                          <button type="button" @click="closeInvitePatientModal" class="btn btn-cancel" :disabled="isInvitingPatient">Cancel</button>
                          <button type="submit" class="btn btn-primary" :disabled="isInvitingPatient || !invitePatientName || !invitePatientPhone">
                              <span v-if="isInvitingPatient"><i class="fas fa-spinner fa-spin"></i> Sending...</span> <span v-else>Send Invitation / Add Patient</span>
                          </button>
                      </div>
                 </form>
            </div>
       </div>

  </div>
</template>

<script setup>
// --- SCRIPT REMAINS EXACTLY THE SAME AS PREVIOUS VERSION ---
import { ref, reactive, onMounted, computed, watch } from 'vue';
import UserService from '@/services/UserService';
import MedicService from '@/services/MedicService';
import PatientPlanService from '@/services/PatientPlanService';
import InvitationService from '@/services/InvitationService';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();

// Original State for data fetched directly from API
const allAssignedPatients = ref([]); // Stores the full list from API
const allPendingInvites = ref([]); // Stores the full list from API

// State for "My Patients" (now derived or directly used for full list)
// const assignedPatients = ref([]); // This will be replaced by a computed property
const isLoadingAssignedPatients = ref(true);
const loadAssignedPatientsError = ref('');

// State for "Pending Invitations" (now derived or directly used for full list)
// const pendingInvites = ref([]); // This will be replaced by a computed property
const isLoadingPending = ref(true);
const loadPendingError = ref('');
const isResending = reactive({});
const isCancelling = reactive({});

// Search and Pagination State for "My Patients"
const assignedPatientsSearchTerm = ref('');
const assignedPatientsCurrentPage = ref(1);
const assignedPatientsPerPage = ref(10); // Or any default value you prefer

// Search and Pagination State for "Pending Invitations"
const pendingInvitesSearchTerm = ref('');
const pendingInvitesCurrentPage = ref(1);
const pendingInvitesPerPage = ref(10); // Or any default value

// State for Modals (remains the same)
const showAssignModal = ref(false); const patientToAssign = ref(null); const assignmentType = ref('package'); const availablePackages = ref([]); const availableServices = ref([]); const selectedPackageId = ref(null); const customServiceItems = ref([]); const planNotes = ref(''); const isAssigning = ref(false); const assignError = ref(''); const isLoadingPackages = ref(false); const loadPackagesError = ref(''); const isLoadingServices = ref(false); const loadServicesError = ref(''); const customItemsError = ref('');
const showInviteModal = ref(false); const invitePatientEmail = ref(''); const isInvitingPatient = ref(false); const invitePatientError = ref('');
const invitePatientName = ref('');
const invitePatientPhone = ref('');

// Edit Patient Modal State
const showEditPatientModal = ref(false);
const patientToEditData = ref(null); // Stores the original patient data for the modal title and logic
const editPatientForm = reactive({
    id: null,
    name: '',
    email: '',
    phone: ''
});
const isUpdatingPatient = ref(false);
const editPatientError = ref('');

// Computed properties for "My Patients" list (Search and Pagination)
const filteredAndPaginatedAssignedPatients = computed(() => {
    let patients = allAssignedPatients.value;
    if (assignedPatientsSearchTerm.value.trim() !== '') {
        const searchTerm = assignedPatientsSearchTerm.value.toLowerCase();
        patients = patients.filter(p =>
            (p.name?.toLowerCase().includes(searchTerm)) ||
            (p.email?.toLowerCase().includes(searchTerm)) ||
            (p.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    const start = (assignedPatientsCurrentPage.value - 1) * assignedPatientsPerPage.value;
    const end = start + assignedPatientsPerPage.value;
    return patients.slice(start, end);
});

const totalAssignedPatientPages = computed(() => {
    let totalPatients = allAssignedPatients.value;
    if (assignedPatientsSearchTerm.value.trim() !== '') {
        const searchTerm = assignedPatientsSearchTerm.value.toLowerCase();
        totalPatients = totalPatients.filter(p =>
            (p.name?.toLowerCase().includes(searchTerm)) ||
            (p.email?.toLowerCase().includes(searchTerm)) ||
            (p.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    return Math.ceil(totalPatients.length / assignedPatientsPerPage.value);
});

// Computed properties for "Pending Invitations" list (Search and Pagination)
const filteredAndPaginatedPendingInvites = computed(() => {
    let invites = allPendingInvites.value;
    if (pendingInvitesSearchTerm.value.trim() !== '') {
        const searchTerm = pendingInvitesSearchTerm.value.toLowerCase();
        invites = invites.filter(i =>
            (i.name?.toLowerCase().includes(searchTerm)) ||
            (i.email?.toLowerCase().includes(searchTerm)) ||
            (i.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    const start = (pendingInvitesCurrentPage.value - 1) * pendingInvitesPerPage.value;
    const end = start + pendingInvitesPerPage.value;
    return invites.slice(start, end);
});

const totalPendingInvitePages = computed(() => {
    let totalInvites = allPendingInvites.value;
    if (pendingInvitesSearchTerm.value.trim() !== '') {
        const searchTerm = pendingInvitesSearchTerm.value.toLowerCase();
        totalInvites = totalInvites.filter(i =>
            (i.name?.toLowerCase().includes(searchTerm)) ||
            (i.email?.toLowerCase().includes(searchTerm)) ||
            (i.phoneNumber?.toLowerCase().includes(searchTerm))
        );
    }
    return Math.ceil(totalInvites.length / pendingInvitesPerPage.value);
});

// Generic computed for assignment modal (remains the same)
const isAssignmentValid = computed(() => { if (assignmentType.value === 'package') { return !!selectedPackageId.value; } else if (assignmentType.value === 'custom') { if (customServiceItems.value.length === 0) return false; const allItemsValid = customServiceItems.value.every(item => item.serviceId && item.quantity >= 1); const noDuplicates = new Set(customServiceItems.value.map(i => i.serviceId)).size === customServiceItems.value.length; return allItemsValid && noDuplicates; } return false; });

// Methods...
const formatDate = (dateString) => { if (!dateString) return 'N/A'; try { const options = { year: 'numeric', month: 'short', day: 'numeric' }; return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString)); } catch (e) { return dateString; } };
const formatCurrency = (value) => { if (value === null || value === undefined) return 'N/A'; return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); };
const fetchAllAssignedPatients = async () => {
    isLoadingAssignedPatients.value = true;
    loadAssignedPatientsError.value = '';
    // assignedPatients.value = []; // Clear derived list indirectly by clearing source
    allAssignedPatients.value = []; // Clear the source list
    assignedPatientsCurrentPage.value = 1; // Reset to first page
    try {
        const response = await UserService.getAssignedPatients();
        allAssignedPatients.value = response.data; // Store full list
    } catch (error) {
        console.error("Error fetching assigned patients:", error);
        const message = error.response?.data?.message || 'Failed to load patients.';
        loadAssignedPatientsError.value = message;
        toast.error(message);
    } finally {
        isLoadingAssignedPatients.value = false;
    }
};
const fetchAssignedPendingInvites = async () => {
    isLoadingPending.value = true;
    loadPendingError.value = '';
    // pendingInvites.value = []; // Clear derived list indirectly by clearing source
    allPendingInvites.value = []; // Clear the source list
    pendingInvitesCurrentPage.value = 1; // Reset to first page
    isResending.clear?.(); // Assuming isResending is a Map or similar; if not, adjust
    isCancelling.clear?.(); // Assuming isCancelling is a Map or similar; if not, adjust
    try {
        const response = await MedicService.getPendingPatientInvites();
        allPendingInvites.value = response.data; // Store full list
    } catch (error) {
        console.error("Error fetching pending invites:", error);
        const message = error.response?.data?.message || 'Failed to load pending invitations.';
        loadPendingError.value = message;
        toast.error(message);
    } finally {
        isLoadingPending.value = false;
    }
};
const fetchPackagesForModal = async () => { isLoadingPackages.value = true; loadPackagesError.value = ''; availablePackages.value = []; try { const response = await MedicService.getActiveCompanyPackages(); availablePackages.value = response.data; } catch (error) { console.error("Error fetching packages:", error); loadPackagesError.value = "Could not load packages."; toast.error(loadPackagesError.value); } finally { isLoadingPackages.value = false; } };
const fetchServicesForModal = async () => { isLoadingServices.value = true; loadServicesError.value = ''; availableServices.value = []; try { const response = await MedicService.getActiveCompanyServices(); availableServices.value = response.data; } catch (error) { console.error("Error fetching services:", error); loadServicesError.value = "Could not load services."; toast.error(loadServicesError.value); } finally { isLoadingServices.value = false; } };
const openAssignPlanModal = async (patient) => { patientToAssign.value = patient; assignmentType.value = 'package'; selectedPackageId.value = null; customServiceItems.value = []; planNotes.value = ''; assignError.value = ''; customItemsError.value = ''; isAssigning.value = false; showAssignModal.value = true; await Promise.all([fetchPackagesForModal(), fetchServicesForModal()]); };
const closeAssignModal = () => { showAssignModal.value = false; patientToAssign.value = null; };
const addCustomItem = () => { customServiceItems.value.push({ formKey: `new-${Date.now()}-${Math.random()}`, serviceId: null, quantity: 1 }); validateCustomItems(); };
const removeCustomItem = (index) => { customServiceItems.value.splice(index, 1); validateCustomItems(); };
const validateCustomItems = () => { customItemsError.value = ''; if (assignmentType.value !== 'custom') return; const selectedIds = new Set(); let hasInvalidItem = false; if(customServiceItems.value.length === 0) { customItemsError.value = "Add at least one service."; hasInvalidItem = true; } else { for (const item of customServiceItems.value) { if (!item.serviceId || item.quantity < 1) { hasInvalidItem = true; } if (item.serviceId) { if (selectedIds.has(item.serviceId)) { customItemsError.value = "Each service only once."; hasInvalidItem = true; break; } selectedIds.add(item.serviceId); } } if(hasInvalidItem && !customItemsError.value) { customItemsError.value = "Select service & quantity >= 1."; } } };
watch(customServiceItems, validateCustomItems, { deep: true });
watch(assignmentType, (newValue) => { selectedPackageId.value = null; customServiceItems.value = []; customItemsError.value = ''; assignError.value = ''; if(newValue === 'custom') { addCustomItem(); } });
const handleAssignPlan = async () => { assignError.value = ''; validateCustomItems(); if (!isAssignmentValid.value || customItemsError.value) { assignError.value = "Please correct errors."; toast.error(assignError.value); return; } isAssigning.value = true; try { let planData = { notes: planNotes.value }; if (assignmentType.value === 'package') { planData.packageId = selectedPackageId.value; } else { planData.serviceItems = customServiceItems.value.map(item => ({ serviceId: item.serviceId, quantity: item.quantity })); } await PatientPlanService.assignPlanToPatient(patientToAssign.value.id, planData); toast.success(`Plan assigned to ${patientToAssign.value.name}!`); closeAssignModal(); } catch (error) { console.error("Error assigning plan:", error); const message = error.response?.data?.message || 'Failed to assign plan.'; assignError.value = message; toast.error(message); } finally { isAssigning.value = false; } };
const viewPatientPlan = (patientId) => {
    console.log("Navigate to view/manage plan for patient ID:", patientId);
    // Use the named route defined in the router
    router.push({ name: 'medic-patient-plan-detail', params: { patientId: patientId } });
    // toast.info(`View plan for Patient ${patientId} not implemented yet.`); // Remove toast
};const scheduleAppointment = (patientId) => {
    // toast.info(`Scheduling ${patientId} NYI.`);
    router.push({ name: 'medic-calendar' }); // Navigate to the medic's calendar page
    // Optionally, you could pass patientId as a query or param if the calendar page can use it:
    // router.push({ name: 'medic-calendar', query: { patientId: patientId } });
};const openInvitePatientModal = () => {
    invitePatientName.value = ''; // Reset new field
    invitePatientPhone.value = ''; // Reset new field
    invitePatientEmail.value = '';
    invitePatientError.value = '';
    isInvitingPatient.value = false;
    showInviteModal.value = true;
};
const closeInvitePatientModal = () => { showInviteModal.value = false; };
const handleSendPatientInvitation = async () => {
    isInvitingPatient.value = true;
    invitePatientError.value = '';

    if (!invitePatientName.value || !invitePatientPhone.value) {
        invitePatientError.value = 'Patient name and phone number are required.';
        toast.error(invitePatientError.value);
        isInvitingPatient.value = false;
        return;
    }

    // Validate email if provided
    if (invitePatientEmail.value && !/.+@.+\..+/.test(invitePatientEmail.value)) {
        invitePatientError.value = 'Please enter a valid email address or leave it blank.';
        toast.error(invitePatientError.value);
        isInvitingPatient.value = false;
        return;
    }

    try {
        const invitationPayload = {
            name: invitePatientName.value,
            phone: invitePatientPhone.value,
            role: 'USER', // Assuming role is always 'USER' for patients
        };
        if (invitePatientEmail.value) {
            invitationPayload.email = invitePatientEmail.value;
        }

        await InvitationService.sendInvitation(invitationPayload);

        if (invitePatientEmail.value) {
            toast.success(`Invitation sent to ${invitePatientEmail.value}!`);
        } else {
            toast.success(`${invitePatientName.value} added as an offline patient.`);
        }
        closeInvitePatientModal();
        // Refresh relevant lists
        await fetchAssignedPendingInvites(); // Refreshes allPendingInvites and resets its pagination
        await fetchAllAssignedPatients(); // Refreshes allAssignedPatients and resets its pagination

    } catch (error) {
        const message = error.response?.data?.message || 'Failed to add patient or send invitation.';
        invitePatientError.value = message;
        toast.error(message);
    } finally {
        isInvitingPatient.value = false;
    }
};
const handleResendInvite = async (invitee) => {
    if (!invitee.email) { // Check if email exists for the invitee
        toast.info("This patient does not have an email address to resend the invitation to. Please add an email first.");
        return;
    }
    if (isResending[invitee.id]) return;
    isResending[invitee.id] = true;
    try {
        // The payload for resend should ideally just be the identifier (email or id)
        // Assuming InvitationService.sendInvitation can handle a resend if email exists
        // Or a dedicated resend endpoint might be better.
        // For now, we reuse sendInvitation with email and role.
        await InvitationService.sendInvitation({
            name: invitee.name,
            phone: invitee.phoneNumber,
            email: invitee.email,
            role: 'USER'
        });
        toast.success(`Invitation resent to ${invitee.email}.`);
        // Potentially refresh pending invites if status/token might change on backend after resend
        await fetchAssignedPendingInvites();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to resend invitation.');
    } finally {
        delete isResending[invitee.id];
    }
};
const handleCancelInvite = async (invitee) => {
    if (isCancelling[invitee.id] || !confirm(`Cancel invitation for ${invitee.name || invitee.email}?`)) return;
    isCancelling[invitee.id] = true;
    try {
        await UserService.cancelPatientInvitation(invitee.id);
        toast.success(`Invitation for ${invitee.name || invitee.email} cancelled.`);
        // Instead of filtering pendingInvites.value directly, re-fetch the full list.
        // pendingInvites.value = pendingInvites.value.filter(p => p.id !== invitee.id);
        await fetchAssignedPendingInvites(); // This will update allPendingInvites and reset pagination.
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel.');
    } finally {
        delete isCancelling[invitee.id];
    }
};

// --- Edit Patient Modal Methods ---
const openEditPatientModal = (patient) => {
    patientToEditData.value = { ...patient }; // Clone patient data
    editPatientForm.id = patient.id;
    editPatientForm.name = patient.name;
    editPatientForm.email = patient.email || ''; // Handle null email
    editPatientForm.phone = patient.phoneNumber || ''; // Handle null phone
    editPatientError.value = '';
    isUpdatingPatient.value = false;
    showEditPatientModal.value = true;
};

const closeEditPatientModal = () => {
    showEditPatientModal.value = false;
    patientToEditData.value = null;
    // Reset form if needed, though openEditPatientModal re-initializes it
    editPatientForm.id = null;
    editPatientForm.name = '';
    editPatientForm.email = '';
    editPatientForm.phone = '';
};

const handleUpdatePatientDetails = async () => {
    if (!editPatientForm.name || !editPatientForm.phone) {
        editPatientError.value = 'Patient name and phone number are required.';
        toast.error(editPatientError.value);
        return;
    }
    // Basic email validation if email is not empty
    if (editPatientForm.email && !/.+@.+\..+/.test(editPatientForm.email)) {
        editPatientError.value = 'Please enter a valid email address or leave it blank if patient is inactive and has no email.';
        toast.error(editPatientError.value);
        return;
    }

    isUpdatingPatient.value = true;
    editPatientError.value = '';

    try {
        const payload = {
            name: editPatientForm.name,
            email: editPatientForm.email || null, // Send null if empty, backend handles logic
            phone: editPatientForm.phone
        };
        const updatedPatient = await UserService.updatePatientDetails(editPatientForm.id, payload);

        // Update the local list by re-fetching. This is simpler than manually updating.
        // const index = assignedPatients.value.findIndex(p => p.id === editPatientForm.id);
        // if (index !== -1) {
        //     assignedPatients.value[index] = { ...assignedPatients.value[index], ...updatedPatient.data };
        // }
        //  // Also check and update in pendingInvites if the ID matches, though less likely to be edited from there
        // const pendingIndex = pendingInvites.value.findIndex(p => p.id === editPatientForm.id);
        // if (pendingIndex !== -1) {
        //     pendingInvites.value[pendingIndex] = { ...pendingInvites.value[pendingIndex], ...updatedPatient.data };
        // }
        await fetchAllAssignedPatients(); // Refreshes the main list
        await fetchAssignedPendingInvites(); // Also refresh pending, in case status change affected it

        toast.success('Patient details updated successfully!');
        closeEditPatientModal();
    } catch (error) {
        console.error("Error updating patient details:", error);
        const message = error.response?.data?.message || 'Failed to update patient details.';
        editPatientError.value = message;
        toast.error(message);
    } finally {
        isUpdatingPatient.value = false;
    }
};

// Pagination methods for "My Patients"
const goToAssignedPatientsPage = (page) => {
    if (page >= 1 && page <= totalAssignedPatientPages.value) {
        assignedPatientsCurrentPage.value = page;
    }
};

// Pagination methods for "Pending Invitations"
const goToPendingInvitesPage = (page) => {
    if (page >= 1 && page <= totalPendingInvitePages.value) {
        pendingInvitesCurrentPage.value = page;
    }
};

onMounted(async () => {
    await Promise.all([
        fetchAllAssignedPatients(), // Renamed call
        fetchAssignedPendingInvites()
    ]);
});

</script>

<style scoped>
    /* --- Styles To Keep (Layout & Unique Elements) --- */

    /* General Page & Card Layout */
    .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem; }
    .page-header h1 { margin-bottom: 0; }
    h1 { color: var(--dark-color); }
    h1 + p { color: var(--text-color); margin-bottom: 1.5rem; font-size: 1.1rem; margin-top: 0;}
    .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); margin-bottom: 2rem; }
    .card h2 { color: var(--dark-color); margin-bottom: 0.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
    .card h2 + p { margin-top: 0.8rem; margin-bottom: 1.5rem; font-size: 1rem; color: #6c757d; }
    .list-section { overflow-x: auto; }

    /* Search and List Controls */
    .list-controls {
        margin-bottom: 1rem;
        display: flex;
        justify-content: flex-end; /* Aligns search bar to the right */
    }
    .search-input {
        max-width: 300px; /* Or any width you prefer */
    }

    /* Table Layout */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
    .data-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .data-table tbody tr:hover { background-color: #f1f3f5; }
    .data-table td:last-child { text-align: right; white-space: nowrap; }
    .data-table td:last-child .btn + .btn { margin-left: 0.5rem; }

    /* Modal Layout Styles */
    .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; padding: 1rem; }
    .modal-content { background-color: #fff; padding: 2rem 2.5rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark); position: relative; width: 90%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; }
    .assign-modal-content { max-width: 650px; }
    .modal-close-button { position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem; font-weight: bold; color: #aaa; background: none; border: none; cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem; }
    .modal-close-button:hover { color: #777; }
    .modal-content h2 { color: var(--dark-color); margin-top: 0; margin-bottom: 1rem; font-size: 1.5rem; text-align: center; flex-shrink: 0; }
    .modal-content > p { text-align: center; color: var(--text-color); margin-bottom: 1.5rem; font-size: 1rem; flex-shrink: 0; }
    .modal-form { overflow-y: auto; padding-right: 5px; flex-grow: 1; }
    .modal-form .form-group { margin-bottom: 1.5rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; flex-shrink: 0; }
    .modal-error { margin-top: 1rem; margin-bottom: 0; } /* Keep layout style */

    /* Form Elements within Modal (Layout & Unique Styles) */
    .modal-form .form-label { display: block; margin-bottom: 0.6rem; font-weight: 600; color: var(--dark-color); font-size: 0.95rem; }
    /* Let global .form-control define appearance */
    .modal-form .form-control:disabled { /* Keep disabled appearance override if needed */ }
    .modal-form textarea.form-control { min-height: 80px; }

    /* --- Custom Radio Toggle --- */
    .radio-toggle-group { display: flex; border: 1px solid #dee2e6; border-radius: var(--border-radius); overflow: hidden; }
    .radio-toggle-label { flex: 1; padding: 0.7rem 1rem; text-align: center; cursor: pointer; background-color: var(--white-color); color: var(--text-color); transition: all 0.2s ease; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-right: 1px solid #dee2e6; }
    .radio-toggle-label:last-child { border-right: none; }
    .radio-toggle-label input[type="radio"] { display: none; }
    .radio-toggle-label i { margin-right: 0.2rem; }
    .radio-toggle-label.active { background-image: var(--gradient-main); color: var(--white-color); font-weight: 600; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
    .radio-toggle-label:not(.active):hover { background-color: #f8f9fa; }
    .radio-toggle-label input[type="radio"]:disabled ~ * { cursor: not-allowed; opacity: 0.6; }

    /* Custom Service Item Row Layout */
    .service-items-group > .form-label { margin-bottom: 1rem; display: block; }
    .service-item-row { display: flex; gap: 0.8rem; align-items: center; margin-bottom: 0.8rem; }
    .service-item-row .item-select { flex-grow: 1; min-width: 150px; }
    .item-quantity { width: 70px; text-align: center; flex-shrink: 0; }
    .btn-remove { line-height: 1; flex-shrink: 0; } /* Position only */
    .add-item-btn { margin-top: 0.5rem; } /* Position only */
    .loading-inline { font-style: italic; color: #6c757d; padding: 0.5rem 0; }
    .text-muted { color: #6c757d; }
    .small { font-size: 0.85em; }
    .mt-1 { margin-top: 0.25rem; }

    /* Loading/Error/NoData Styles (Layout/Positioning) */
    .loading-indicator { text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
    .loading-indicator i { font-size: 1.5rem; }
    .error-message { margin-bottom: 1rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; /* Rely on global for colors/bg */ }
    .error-message.table-error { justify-content: center; margin-top: 1rem; }
    .error-message.modal-error { /* Position adjustment if needed */ }
    .error-message.form-error { /* Position adjustment if needed */ }
    .no-data-message { text-align: center; padding: 2rem; color: #6c757d; font-style: italic; margin-top: 1rem; }
    /* Assume spinner animation and global button styles are defined elsewhere */

    .inactive-row {
        background-color: #f8f9fa; /* Light grey for inactive rows */
        opacity: 0.7;
    }
    .inactive-row:hover {
        opacity: 1;
    }
    .status-active {
        color: var(--success-color);
        font-weight: bold;
    }
    .status-inactive {
        color: var(--muted-color); /* Ensure --muted-color is defined in your global styles */
        font-style: italic;
    }

    /* Pagination Controls */
    .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.8rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
    .pagination-controls span {
        font-size: 0.9rem;
        color: var(--text-color);
    }
</style>