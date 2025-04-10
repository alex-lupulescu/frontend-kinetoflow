<template>
    <div class="page-container">
      <h1>Patient Management</h1>
      <!-- Maybe add invite form later if admin invites patients -->
  
      <section class="card user-list-section">
        <h2>Patients List</h2>
         <div v-if="isLoading" class="loading-indicator">
              <i class="fas fa-spinner fa-spin"></i> Loading patients...
         </div>
         <div v-if="loadError" class="error-message table-error">
              <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
         </div>
  
        <table v-if="!isLoading && patients.length > 0" class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Assigned Medic</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patient in patients" :key="patient.id">
              <td>{{ patient.id }}</td>
              <td>{{ patient.name }}</td>
              <td>{{ patient.email }}</td>
              <td>
                <span :class="['status-badge', patient.isActive ? 'status-active' : 'status-pending']">
                  {{ patient.isActive ? 'Active' : 'Pending Invite' }}
                </span>
              </td>
              <td>
                <!-- Display assigned medic or 'Unassigned' -->
                 <span v-if="patient.assignedMedicName">{{ patient.assignedMedicName }} (ID: {{ patient.assignedMedicId }})</span>
                 <span v-else class="text-muted">Unassigned</span>
              </td>
              <td>
                <button @click="openAssignModal(patient)" class="btn btn-info btn-sm" title="Assign/Unassign Medic">
                  <i class="fas fa-user-tag"></i> Assign Medic
                </button>
                <!-- Deactivate button (similar to medics page) -->
                 <button
                  @click="handleUpdateStatus(patient, !patient.isActive)"
                  :class="['btn', 'btn-sm', patient.isActive ? 'btn-warning' : 'btn-success']"
                  :disabled="isUpdatingStatus[patient.id]"
                  :title="patient.isActive ? 'Deactivate Patient' : 'Activate Patient (if invite accepted)'"
                >
                  <span v-if="isUpdatingStatus[patient.id]"><i class="fas fa-spinner fa-spin"></i></span>
                  <span v-else>
                    <i :class="['fas', patient.isActive ? 'fa-user-slash' : 'fa-user-check']"></i>
                     {{ patient.isActive ? 'Deactivate' : 'Activate' }}
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
         <p v-if="!isLoading && patients.length === 0 && !loadError" class="no-data-message">
             No patients found for your company. Medics can usually invite patients.
         </p>
      </section>
  
      <!-- Assign Medic Modal -->
      <div v-if="showAssignModal" class="modal-overlay" @click.self="closeAssignModal">
          <div class="modal-content">
              <button @click="closeAssignModal" class="modal-close-button" title="Close">×</button>
              <h2>Assign Medic for {{ patientToAssign?.name }}</h2>
              <form @submit.prevent="handleAssignMedic" class="modal-form">
                  <div class="form-group">
                      <label for="assignMedicSelect">Select Medic</label>
                      <select id="assignMedicSelect" v-model="selectedMedicId" class="form-control" :disabled="isAssigning">
                          <option :value="null">-- Unassign --</option>
                          <!-- Populate with available active medics -->
                          <option v-for="medic in availableMedics" :key="medic.id" :value="medic.id">
                              {{ medic.name }} (ID: {{ medic.id }})
                          </option>
                      </select>
                      <div v-if="!isLoadingMedics && availableMedics.length === 0" class="text-muted small mt-2">
                          No active medics available in your company.
                      </div>
                       <div v-if="isLoadingMedics" class="text-muted small mt-2">
                          Loading medics...
                      </div>
                  </div>
                  <div v-if="assignError" class="error-message modal-error">{{ assignError }}</div>
                  <div class="modal-actions">
                      <button type="button" @click="closeAssignModal" class="btn btn-cancel" :disabled="isAssigning">Cancel</button>
                      <button type="submit" class="btn btn-primary" :disabled="isAssigning || isLoadingMedics">
                          <span v-if="isAssigning"><i class="fas fa-spinner fa-spin"></i> Assigning...</span>
                          <span v-else>Assign Medic</span>
                      </button>
                  </div>
              </form>
          </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import UserService from '@/services/UserService';
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  
  // Patient List State
  const patients = ref([]);
  const isLoading = ref(true);
  const loadError = ref('');
  
  // Assign Modal State
  const showAssignModal = ref(false);
  const patientToAssign = ref(null);
  const availableMedics = ref([]); // List of active medics to choose from
  const selectedMedicId = ref(null); // Holds the ID of the medic selected in the dropdown
  const isAssigning = ref(false);
  const assignError = ref('');
  const isLoadingMedics = ref(false); // Separate loading for medics dropdown
  
  // Update Status State
  const isUpdatingStatus = reactive({});
  
  // --- Methods ---
  
  const fetchPatients = async () => {
    isLoading.value = true;
    loadError.value = '';
    patients.value = [];
    isUpdatingStatus.clear?.();
    try {
      const response = await UserService.getCompanyPatients();
      patients.value = response.data;
    } catch (error) {
      console.error("Error fetching patients:", error);
      const message = error.response?.data?.message || 'Failed to load patients.';
      loadError.value = message;
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  };
  
  const fetchAvailableMedics = async () => {
      isLoadingMedics.value = true;
      availableMedics.value = [];
      try {
          // Reuse the getCompanyMedics service call
          const response = await UserService.getCompanyMedics();
          // Filter for active medics only for assignment
          availableMedics.value = response.data.filter(medic => medic.isActive);
      } catch(error) {
           console.error("Error fetching available medics:", error);
           // Optionally show an error in the modal or a toast
           assignError.value = "Could not load available medics."; // Show error in modal
           toast.error("Could not load available medics for assignment.");
      } finally {
           isLoadingMedics.value = false;
      }
  };
  
  const openAssignModal = async (patient) => {
      patientToAssign.value = patient;
      selectedMedicId.value = patient.assignedMedicId || null; // Pre-select current medic or null
      assignError.value = '';
      isAssigning.value = false;
      showAssignModal.value = true;
      // Fetch available medics when modal opens
      await fetchAvailableMedics();
  };
  
  const closeAssignModal = () => {
      showAssignModal.value = false;
      patientToAssign.value = null;
      availableMedics.value = []; // Clear medics list
  };
  
  const handleAssignMedic = async () => {
      isAssigning.value = true;
      assignError.value = '';
      try {
          const response = await UserService.assignMedicToPatient(patientToAssign.value.id, selectedMedicId.value);
           // Update the local patient list with the new assignment details
           const index = patients.value.findIndex(p => p.id === patientToAssign.value.id);
           if (index !== -1) {
               // Make sure the response data matches UserSummaryDto structure
               patients.value[index].assignedMedicId = response.data.assignedMedicId;
               patients.value[index].assignedMedicName = response.data.assignedMedicName;
           }
  
          toast.success(`Medic assignment updated for ${patientToAssign.value.name}.`);
          closeAssignModal();
      } catch (error) {
          console.error("Error assigning medic:", error);
          const message = error.response?.data?.message || 'Failed to assign medic.';
          assignError.value = message; // Show error in modal
          toast.error(message);
      } finally {
          isAssigning.value = false;
      }
  };
  
  // Re-use handleUpdateStatus from Medics page (or create shared composable)
   const handleUpdateStatus = async (patient, newStatus) => {
    isUpdatingStatus[patient.id] = true;
    try {
      const updatedUser = await UserService.updateUserStatus(patient.id, newStatus);
      const index = patients.value.findIndex(p => p.id === patient.id);
      if (index !== -1) {
        patients.value[index] = updatedUser.data;
      }
      toast.success(`Patient ${patient.name} status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
    } catch (error) {
       console.error(`Error updating status for patient ${patient.id}:`, error);
       const message = error.response?.data?.message || 'Failed to update patient status.';
       toast.error(message);
    } finally {
       isUpdatingStatus[patient.id] = false;
    }
  };
  
  
  // Fetch data on mount
  onMounted(fetchPatients);
  </script>
  
  <style scoped>
  /* Reuse styles from AppAdminCompanies & CompanyAdminMedics or define globally */
  .page-container { display: flex; flex-direction: column; gap: 2rem; }
  h1 { color: var(--dark-color); margin-bottom: 1.5rem; } /* Increased margin */
  .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
  .card h2 { color: var(--dark-color); margin-bottom: 1.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
  
  /* Table Styles */
  .user-list-section { overflow-x: auto; }
  .user-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .user-table th, .user-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
  .user-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .user-table tbody tr:hover { background-color: #f1f3f5; }
  .user-table td:last-child { text-align: right; white-space: nowrap; } /* Actions column */
  .user-table .btn { margin-left: 0.5rem; }
  .text-muted { color: #6c757d; font-style: italic; font-size: 0.9em; }
  
   /* Status Badge */
  .status-badge { padding: 0.3em 0.6em; font-size: 0.8rem; font-weight: 600; border-radius: var(--border-radius); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .status-badge.status-active { background-color: #d4edda; color: #155724; }
  .status-badge.status-pending { background-color: #fff3cd; color: #856404; }
  
  /* Button Styles */
  .btn { /* ... basic btn styles ... */ padding: 0.7rem 1.5rem; border: none; border-radius: var(--border-radius); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 38px; vertical-align: middle; }
  .btn i.fa-spinner { animation: fa-spin 1.5s linear infinite; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-primary { background: var(--gradient-main); color: var(--white-color); box-shadow: var(--shadow-light); }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-medium); filter: brightness(1.1); }
  .btn-info { background-color: #17a2b8; color: white; border-color: #17a2b8; }
  .btn-info:hover:not(:disabled) { background-color: #138496; border-color: #117a8b; }
   .btn-warning { background-color: #ffc107; color: #212529; border-color: #ffc107; }
   .btn-warning:hover:not(:disabled) { background-color: #e0a800; border-color: #d39e00; }
   .btn-success { background-color: #28a745; color: white; border-color: #28a745; }
   .btn-success:hover:not(:disabled) { background-color: #218838; border-color: #1e7e34; }
  .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; min-height: 30px; }
  .btn-cancel { background-color: #f8f9fa; color: #6c757d; border: 1px solid #ced4da; }
  .btn-cancel:hover:not(:disabled) { background-color: #e2e6ea; }
  
  
  /* Loading/Error/NoData Styles */
  .loading-indicator { text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
  .loading-indicator i { color: var(--primary-color-start); font-size: 1.5rem; animation: fa-spin 1.5s linear infinite; }
  .error-message { color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 0.8rem 1rem; border-radius: var(--border-radius); margin-bottom: 1rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; }
  .error-message.table-error { justify-content: center; margin-top: 1rem; }
  .error-message i { font-size: 1.1rem; }
  .no-data-message { text-align: center; padding: 2rem; color: #6c757d; font-style: italic; }
  
  
   /* Modal Styles */
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; }
  .modal-content { background-color: #fff; padding: 2rem 2.5rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark); min-width: 400px; max-width: 500px; position: relative; }
  .modal-close-button { position: absolute; top: 0.5rem; right: 0.8rem; font-size: 2rem; font-weight: bold; color: #aaa; background: none; border: none; cursor: pointer; line-height: 1; padding: 0.2rem 0.5rem; }
  .modal-close-button:hover { color: #777; }
  .modal-content h2 { color: var(--dark-color); margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem; text-align: center; }
  .modal-form .form-group { margin-bottom: 1.5rem; }
   /* Re-use form-control style for select */
  .form-control {
      display: block;
      width: 100%;
      padding: 0.7rem 1rem;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      color: var(--text-color);
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      appearance: none; /* Remove default arrow */
      border-radius: var(--border-radius);
      transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
       /* Add custom arrow */
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 16px 12px;
  }
  .form-control:focus {
      border-color: var(--primary-color-start);
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-start-rgb),.25);
  }
   .form-control:disabled {
      background-color: #e9ecef;
      opacity: 1;
      cursor: not-allowed;
  }
   .modal-error { margin-top: 1rem; margin-bottom: 0; text-align: left; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
  .small { font-size: 0.85em; }
  .mt-2 { margin-top: 0.5rem; }
  
  </style>