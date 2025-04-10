<template>
    <div class="page-container">
      <h1>Company Management</h1>
  
      <!-- Create Company Form -->
      <section class="card create-form-section">
        <h2>Create New Company</h2>
        <form @submit.prevent="handleCreateCompany" class="create-form">
          <div class="form-row">
               <div class="form-group">
                   <label for="newCompanyName">Company Name</label>
                   <input type="text" id="newCompanyName" v-model="newCompany.name" required placeholder="Enter company name" :disabled="isCreating">
               </div>
               <div class="form-group">
                   <label for="newCompanyAddress">Address (Optional)</label>
                   <input type="text" id="newCompanyAddress" v-model="newCompany.address" placeholder="Enter company address" :disabled="isCreating">
               </div>
          </div>
           <!-- Display creation error directly under the form -->
           <div v-if="createError" class="error-message form-error">{{ createError }}</div>
          <button type="submit" class="btn btn-primary" :disabled="isCreating">
            <!-- Show spinner when creating -->
            <span v-if="isCreating"><i class="fas fa-spinner fa-spin"></i> Creating...</span>
            <span v-else>Create Company</span>
          </button>
        </form>
      </section>
  
      <!-- Company List -->
      <section class="card company-list-section">
        <h2>Existing Companies</h2>
         <!-- Loading indicator for the table -->
         <div v-if="isLoading" class="loading-indicator">
              <i class="fas fa-spinner fa-spin"></i> Loading companies...
         </div>
         <!-- Error message for loading companies -->
         <div v-if="loadError && !isLoading" class="error-message table-error">
             <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
         </div>
        <table v-if="!isLoading && companies.length > 0" class="company-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in companies" :key="company.id">
              <td>{{ company.id }}</td>
              <td>{{ company.name }}</td>
              <td>{{ company.address || 'N/A' }}</td>
              <td>{{ formatDate(company.createdAt) }}</td>
              <td>
                <button @click="openInviteModal(company)" class="btn btn-secondary btn-sm" title="Invite Company Admin">
                    <i class="fas fa-user-plus"></i> Invite Admin
                </button>
                <!-- Add Edit/Delete buttons later -->
                <!-- <button class="btn btn-info btn-sm" title="Edit"><i class="fas fa-edit"></i></button> -->
                <!-- <button class="btn btn-danger btn-sm" title="Delete"><i class="fas fa-trash"></i></button> -->
              </td>
            </tr>
          </tbody>
        </table>
         <!-- Message when no companies are found (and not loading/error) -->
         <p v-if="!isLoading && companies.length === 0 && !loadError" class="no-data-message">
             No companies found. Create one above.
          </p>
      </section>
  
      <!-- Invite Admin Modal -->
      <div v-if="showInviteModal" class="modal-overlay" @click.self="closeInviteModal">
           <div class="modal-content">
               <button @click="closeInviteModal" class="modal-close-button" title="Close">×</button>
               <h2>Invite Admin for {{ companyToInvite?.name }}</h2>
               <form @submit.prevent="handleSendInvitation" class="modal-form">
                    <div class="form-group">
                       <label for="inviteEmail">Admin Email</label>
                       <input type="email" id="inviteEmail" v-model="inviteEmail" required placeholder="Enter email address" :disabled="isInviting">
                   </div>
                    <!-- Display invite error inside modal -->
                    <div v-if="inviteError" class="error-message modal-error">{{ inviteError }}</div>
                    <div class="modal-actions">
                        <button type="button" @click="closeInviteModal" class="btn btn-cancel" :disabled="isInviting">Cancel</button>
                        <button type="submit" class="btn btn-primary" :disabled="isInviting">
                           <!-- Show spinner when inviting -->
                            <span v-if="isInviting"><i class="fas fa-spinner fa-spin"></i> Sending...</span>
                            <span v-else>Send Invitation</span>
                        </button>
                    </div>
               </form>
           </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import CompanyService from '@/services/CompanyService';
  import InvitationService from '@/services/InvitationService';
  import { useToast } from 'vue-toastification'; // Import useToast
  
  // Initialize toast function
  const toast = useToast();
  
  // State for creating companies
  const newCompany = ref({ name: '', address: '' });
  const isCreating = ref(false);
  const createError = ref('');
  
  // State for listing companies
  const companies = ref([]);
  const isLoading = ref(true);
  const loadError = ref('');
  
  // State for invitation modal
  const showInviteModal = ref(false);
  const companyToInvite = ref(null);
  const inviteEmail = ref('');
  const isInviting = ref(false);
  const inviteError = ref('');
  
  // --- Methods ---
  
  const formatDate = (dateString) => {
       if (!dateString) return 'N/A';
       try {
           // Example format: Jan 5, 2024, 10:30 AM
           const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
           return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
       } catch (e) {
           console.error("Error formatting date:", e);
           return dateString; // Fallback to original string if format fails
       }
  };
  
  const fetchCompanies = async () => {
    isLoading.value = true;
    loadError.value = ''; // Clear previous errors
    companies.value = [];
    try {
      const response = await CompanyService.getAllCompanies();
      // Add slight delay for testing loading indicator visually
      // await new Promise(resolve => setTimeout(resolve, 500));
      companies.value = response.data;
    } catch (error) {
      console.error("Error fetching companies:", error);
      const message = error.response?.data?.message || 'Failed to load companies. Please try again.';
      loadError.value = message;
      toast.error(message); // Show error toast
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleCreateCompany = async () => {
    isCreating.value = true;
    createError.value = ''; // Clear previous form errors
    try {
      const response = await CompanyService.createCompany(newCompany.value);
      companies.value.unshift(response.data); // Add to beginning of the list for immediate visibility
      toast.success(`Company "${response.data.name}" created successfully!`); // Success toast
      // Clear the form
      newCompany.value.name = '';
      newCompany.value.address = '';
    } catch (error) {
      console.error("Error creating company:", error);
      const message = error.response?.data?.message || 'Failed to create company.';
      createError.value = message; // Show error message in the form
       // Check for specific validation errors if backend provides them
       if (error.response?.data?.details) {
           // Enhance the error message or handle specific fields
           createError.value += ` Details: ${JSON.stringify(error.response.data.details)}`;
       }
      toast.error(message); // Also show error toast
    } finally {
      isCreating.value = false;
    }
  };
  
   const openInviteModal = (company) => {
       companyToInvite.value = company;
       inviteEmail.value = '';
       inviteError.value = ''; // Clear previous modal errors
       isInviting.value = false;
       showInviteModal.value = true;
   }
  
   const closeInviteModal = () => {
       showInviteModal.value = false;
       companyToInvite.value = null;
       inviteError.value = ''; // Clear errors on close
   }
  
   const handleSendInvitation = async () => {
       isInviting.value = true;
       inviteError.value = ''; // Clear previous modal errors
       try {
           const invitationData = {
               email: inviteEmail.value,
               role: 'COMPANY_ADMIN',
               companyId: companyToInvite.value.id,
           };
           await InvitationService.sendInvitation(invitationData);
           closeInviteModal();
           // Show success notification
           toast.success(`Invitation sent successfully to ${invitationData.email}!`);
  
       } catch(error) {
           console.error("Error sending invitation:", error);
           const message = error.response?.data?.message || 'Failed to send invitation.';
           inviteError.value = message; // Show error inside the modal
           toast.error(message); // Also show error toast
       } finally {
           isInviting.value = false;
       }
   }
  
  // Fetch companies when component is mounted
  onMounted(() => {
    fetchCompanies();
  });
  </script>
  
  <style scoped>
   /* General Page Styles */
  .page-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  h1 {
      color: var(--dark-color);
      margin-bottom: 0.5rem;
  }
  
  /* Card Styles */
  .card {
    background-color: #fff;
    padding: 1.5rem 2rem;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-light);
  }
  .card h2 {
      color: var(--dark-color);
      margin-bottom: 1.5rem;
      font-size: 1.4rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.8rem;
  }
  
  /* Form Styles */
  .create-form .form-row {
      display: flex;
      flex-wrap: wrap; /* Allow wrapping on smaller screens */
      gap: 1.5rem;
      margin-bottom: 1.5rem;
  }
  .create-form .form-group {
       flex: 1;
       min-width: 200px; /* Prevent groups from becoming too narrow */
       margin-bottom: 0;
  }
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--dark-color);
    font-size: 0.9rem;
  }
  .form-group input {
    width: 100%;
    padding: 0.7rem 1rem;
    border: 1px solid #ccc;
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
   .form-group input:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
  }
  .form-group input:focus {
    outline: none;
    border-color: var(--primary-color-start);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-start-rgb), 0.2);
  }
  
   /* Button Styles (Reusing from previous steps, ensure consistency) */
   .btn {
       padding: 0.7rem 1.5rem;
       border: none;
       border-radius: var(--border-radius);
       font-size: 1rem;
       font-weight: 600;
       cursor: pointer;
       transition: all 0.3s ease;
       display: inline-flex;
       align-items: center;
       justify-content: center; /* Center content (icon/text) */
       gap: 0.5rem;
       min-height: 38px; /* Ensure consistent button height */
       vertical-align: middle; /* Align button properly inline */
   }
   .btn i.fa-spinner {
       animation: fa-spin 1.5s linear infinite; /* Add spin animation */
   }
   .btn:disabled {
       opacity: 0.6;
       cursor: not-allowed;
   }
   .btn-primary { /* ... */ background: var(--gradient-main); color: var(--white-color); box-shadow: var(--shadow-light); }
   .btn-primary:hover:not(:disabled) { /* ... */ transform: translateY(-2px); box-shadow: var(--shadow-medium); filter: brightness(1.1); }
   .btn-secondary { /* ... */ background-color: var(--light-color); color: var(--dark-color); border: 1px solid #dee2e6; }
   .btn-secondary:hover:not(:disabled) { /* ... */ background-color: #e9ecef; }
   .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; min-height: 30px; }
   .btn-cancel { /* ... */ background-color: #f8f9fa; color: #6c757d; border: 1px solid #ced4da; }
   .btn-cancel:hover:not(:disabled) { /* ... */ background-color: #e2e6ea; }
  
  
  /* Table Styles */
  .company-list-section { overflow-x: auto; }
  .company-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .company-table th, .company-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
  .company-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .company-table tbody tr:hover { background-color: #f1f3f5; }
  .company-table td:last-child { text-align: right; white-space: nowrap; } /* Actions column */
  .company-table .btn { margin-left: 0.5rem; }
  
   /* Loading/Error/NoData Styles */
   .loading-indicator {
       text-align: center;
       padding: 3rem 1rem;
       color: var(--text-color);
       font-size: 1.2rem;
       display: flex;
       align-items: center;
       justify-content: center;
       gap: 0.8rem;
   }
   .loading-indicator i {
       color: var(--primary-color-start);
       font-size: 1.5rem; /* Make spinner larger */
   }
  .error-message {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 0.8rem 1rem;
    border-radius: var(--border-radius);
    margin-bottom: 1.5rem; /* Standard bottom margin */
    font-size: 0.95rem;
    display: flex; /* Align icon and text */
    align-items: center;
    gap: 0.5rem;
  }
   .error-message.form-error {
      margin-top: -0.5rem; /* Adjust position slightly below inputs */
      margin-bottom: 1rem;
  }
   .error-message.table-error {
      text-align: center;
      justify-content: center; /* Center content */
  }
   .error-message i {
      font-size: 1.1rem;
  }
  .no-data-message {
      text-align: center;
      padding: 2rem;
      color: #6c757d; /* Bootstrap secondary text color */
      font-style: italic;
  }
  
   /* Modal Styles */
   .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; }
   .modal-content { background-color: #fff; padding: 2rem 2.5rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-dark); min-width: 400px; max-width: 500px; position: relative; /* Needed for close button */ }
   .modal-close-button {
      position: absolute;
      top: 0.5rem;
      right: 0.8rem;
      font-size: 2rem;
      font-weight: bold;
      color: #aaa;
      background: none;
      border: none;
      cursor: pointer;
      line-height: 1;
      padding: 0.2rem 0.5rem;
   }
    .modal-close-button:hover {
        color: #777;
    }
   .modal-content h2 { color: var(--dark-color); margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem; text-align: center; }
   .modal-form .form-group { margin-bottom: 1.5rem; }
    .modal-error { /* Error message specific to modal */
       margin-top: 1rem;
       margin-bottom: 0; /* No extra margin below error in modal */
       text-align: left;
   }
   .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
  
  </style>