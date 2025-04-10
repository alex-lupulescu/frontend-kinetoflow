<template>
    <div class="page-container">
      <h1>Medic Management</h1>
  
      <!-- Invite Medic Form -->
      <section class="card invite-form-section">
        <h2>Invite New Medic</h2>
        <form @submit.prevent="handleSendInvitation" class="invite-form">
          <div class="form-group">
            <label for="inviteEmail">Medic Email</label>
            <input type="email" id="inviteEmail" v-model="inviteEmail" required placeholder="Enter email address" :disabled="isInviting">
          </div>
          <div v-if="inviteError" class="error-message form-error">{{ inviteError }}</div>
          <button type="submit" class="btn btn-primary" :disabled="isInviting">
            <span v-if="isInviting"><i class="fas fa-spinner fa-spin"></i> Sending Invite...</span>
            <span v-else><i class="fas fa-paper-plane"></i> Send Invitation</span>
          </button>
        </form>
      </section>
  
      <!-- Medic List -->
      <section class="card user-list-section">
        <h2>Medics List</h2>
        <div v-if="isLoading" class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Loading medics...
        </div>
        <div v-if="loadError" class="error-message table-error">
           <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
        </div>
        <table v-if="!isLoading && medics.length > 0" class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="medic in medics" :key="medic.id">
              <td>{{ medic.id }}</td>
              <td>{{ medic.name }}</td>
              <td>{{ medic.email }}</td>
              <td>
                <span :class="['status-badge', medic.isActive ? 'status-active' : 'status-pending']">
                  {{ medic.isActive ? 'Active' : 'Pending Invite' }}
                </span>
              </td>
              <td>
                <button
                  @click="handleUpdateStatus(medic, !medic.isActive)"
                  :class="['btn', 'btn-sm', medic.isActive ? 'btn-warning' : 'btn-success']"
                  :disabled="isUpdatingStatus[medic.id]"
                  :title="medic.isActive ? 'Deactivate Medic' : 'Activate Medic (if invite accepted)'"
                >
                  <span v-if="isUpdatingStatus[medic.id]"><i class="fas fa-spinner fa-spin"></i></span>
                  <span v-else>
                    <i :class="['fas', medic.isActive ? 'fa-user-slash' : 'fa-user-check']"></i>
                     {{ medic.isActive ? 'Deactivate' : 'Activate' }}
                  </span>
                </button>
                <!-- Add Resend Invite button later -->
              </td>
            </tr>
          </tbody>
        </table>
         <p v-if="!isLoading && medics.length === 0 && !loadError" class="no-data-message">
           No medics found for your company. Invite one above.
         </p>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import UserService from '@/services/UserService';
  import InvitationService from '@/services/InvitationService';
  import { useToast } from 'vue-toastification';
  import { useAuthStore } from '@/stores/auth'; // Needed? Maybe for inviter name
  
  
  const toast = useToast();
  const authStore = useAuthStore();
  
  // Invite State
  const inviteEmail = ref('');
  const isInviting = ref(false);
  const inviteError = ref('');
  
  // List State
  const medics = ref([]);
  const isLoading = ref(true);
  const loadError = ref('');
  
  // Update Status State (using reactive object for individual loading)
  const isUpdatingStatus = reactive({});
  
  // --- Methods ---
  
  const fetchMedics = async () => {
    isLoading.value = true;
    loadError.value = '';
    medics.value = [];
    isUpdatingStatus.clear?.(); // Clear previous status loading states if object allows
    try {
      const response = await UserService.getCompanyMedics();
      medics.value = response.data;
    } catch (error) {
      console.error("Error fetching medics:", error);
      const message = error.response?.data?.message || 'Failed to load medics.';
      loadError.value = message;
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleSendInvitation = async () => {
    isInviting.value = true;
    inviteError.value = '';
    try {
      const invitationData = {
        email: inviteEmail.value,
        role: 'MEDIC', // Company admin invites medic
        // companyId is usually implicit from the logged-in admin on backend
      };
      await InvitationService.sendInvitation(invitationData);
      toast.success(`Invitation sent successfully to ${inviteEmail.value}!`);
      inviteEmail.value = ''; // Clear input
      // Optionally refresh list or wait for backend push/poll
      await fetchMedics(); // Refresh the list to show pending user
    } catch (error) {
      console.error("Error sending medic invitation:", error);
      const message = error.response?.data?.message || 'Failed to send invitation.';
      inviteError.value = message;
      toast.error(message);
    } finally {
      isInviting.value = false;
    }
  };
  
  const handleUpdateStatus = async (medic, newStatus) => {
    isUpdatingStatus[medic.id] = true; // Set loading state for this specific user
    try {
      const updatedUser = await UserService.updateUserStatus(medic.id, newStatus);
      // Find and update the user in the local list
      const index = medics.value.findIndex(m => m.id === medic.id);
      if (index !== -1) {
        medics.value[index] = updatedUser.data; // Assuming API returns updated user
      }
      toast.success(`Medic ${medic.name} status updated to ${newStatus ? 'Active' : 'Inactive'}.`);
    } catch (error) {
       console.error(`Error updating status for medic ${medic.id}:`, error);
       const message = error.response?.data?.message || 'Failed to update medic status.';
       toast.error(message);
    } finally {
       isUpdatingStatus[medic.id] = false; // Clear loading state for this user
    }
  };
  
  // Fetch data on mount
  onMounted(fetchMedics);
  </script>
  
  <style scoped>
  /* Reuse styles from AppAdminCompanies or define globally */
  .page-container { display: flex; flex-direction: column; gap: 2rem; }
  h1 { color: var(--dark-color); margin-bottom: 0.5rem; }
  .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
  .card h2 { color: var(--dark-color); margin-bottom: 1.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
  
  /* Form Styles */
  .invite-form { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
  .invite-form .form-group { flex-grow: 1; margin-bottom: 0; min-width: 250px; }
  .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; }
  .form-group input { width: 100%; padding: 0.7rem 1rem; border: 1px solid #ccc; border-radius: var(--border-radius); font-size: 1rem; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
  .form-group input:focus { outline: none; border-color: var(--primary-color-start); box-shadow: 0 0 0 2px rgba(var(--primary-color-start-rgb), 0.2); }
  .form-group input:disabled { background-color: #e9ecef; cursor: not-allowed; }
  .invite-form .btn { flex-shrink: 0; } /* Prevent button shrinking */
  
  /* Button Styles */
  .btn { padding: 0.7rem 1.5rem; border: none; border-radius: var(--border-radius); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 38px; vertical-align: middle; }
  .btn i.fa-spinner { animation: fa-spin 1.5s linear infinite; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-primary { background: var(--gradient-main); color: var(--white-color); box-shadow: var(--shadow-light); }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-medium); filter: brightness(1.1); }
  .btn-secondary { background-color: var(--light-color); color: var(--dark-color); border: 1px solid #dee2e6; }
  .btn-secondary:hover:not(:disabled) { background-color: #e9ecef; }
  .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; min-height: 30px; }
   /* Specific button colors for status */
   .btn-warning { background-color: #ffc107; color: #212529; border-color: #ffc107; }
   .btn-warning:hover:not(:disabled) { background-color: #e0a800; border-color: #d39e00; }
   .btn-success { background-color: #28a745; color: white; border-color: #28a745; }
   .btn-success:hover:not(:disabled) { background-color: #218838; border-color: #1e7e34; }
  
  
  /* Table Styles */
  .user-list-section { overflow-x: auto; }
  .user-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .user-table th, .user-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
  .user-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .user-table tbody tr:hover { background-color: #f1f3f5; }
  .user-table td:last-child { text-align: right; white-space: nowrap; }
  
   /* Status Badge */
  .status-badge {
      padding: 0.3em 0.6em;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: var(--border-radius);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
  }
  .status-badge.status-active {
      background-color: #d4edda; /* Light green */
      color: #155724; /* Dark green */
  }
  .status-badge.status-pending {
      background-color: #fff3cd; /* Light yellow */
      color: #856404; /* Dark yellow */
  }
  
  /* Loading/Error/NoData Styles */
  .loading-indicator { text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
  .loading-indicator i { color: var(--primary-color-start); font-size: 1.5rem; animation: fa-spin 1.5s linear infinite; }
  .error-message { color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 0.8rem 1rem; border-radius: var(--border-radius); margin-bottom: 1rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; }
  .error-message.form-error { margin-top: 0.5rem; }
  .error-message.table-error { justify-content: center; margin-top: 1rem; }
  .error-message i { font-size: 1.1rem; }
  .no-data-message { text-align: center; padding: 2rem; color: #6c757d; font-style: italic; }
  </style>