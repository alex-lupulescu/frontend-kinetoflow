<template>
    <div class="page-container">
      <h1>Company Profile</h1>
  
      <div v-if="isLoading" class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Loading company details...
      </div>
      <div v-if="loadError" class="error-message">
          <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
      </div>
  
      <section v-if="!isLoading && company" class="card profile-section">
        <h2>Edit Company Details</h2>
        <form @submit.prevent="handleUpdateCompany" class="profile-form">
           <div class="form-group">
              <label for="companyName">Company Name</label>
              <!-- Display name, usually not editable by Company Admin -->
              <input type="text" id="companyName" :value="company.name" disabled readonly>
              <small class="text-muted">Company name is managed by the platform administrator.</small>
           </div>
           <div class="form-group">
              <label for="companyAddress">Address</label>
              <input type="text" id="companyAddress" v-model="editableCompany.address" placeholder="Enter company address" :disabled="isUpdating">
           </div>
  
           <div v-if="updateError" class="error-message form-error">{{ updateError }}</div>
  
           <button type="submit" class="btn btn-primary" :disabled="isUpdating || !isChanged">
             <span v-if="isUpdating"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
             <span v-else>Save Changes</span>
           </button>
        </form>
      </section>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import CompanyService from '@/services/CompanyService';
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  
  const company = ref(null); // Original company data from API
  const editableCompany = reactive({ address: '' }); // Reactive object for form binding
  
  const isLoading = ref(true);
  const loadError = ref('');
  const isUpdating = ref(false);
  const updateError = ref('');
  
  // Check if form data has changed from original
  const isChanged = computed(() => {
      if (!company.value) return false;
      return editableCompany.address !== (company.value.address || ''); // Handle null address
  });
  
  
  const fetchCompanyDetails = async () => {
    isLoading.value = true;
    loadError.value = '';
    company.value = null;
    try {
      const response = await CompanyService.getMyCompany();
      company.value = response.data;
      // Initialize editable fields
      editableCompany.address = company.value.address || '';
    } catch (error) {
      console.error("Error fetching company details:", error);
      const message = error.response?.data?.message || 'Failed to load company details.';
      loadError.value = message;
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleUpdateCompany = async () => {
    if (!isChanged.value) {
         toast.info("No changes detected.");
         return;
    }
    isUpdating.value = true;
    updateError.value = '';
    try {
      // Only send fields that can be updated
      const updateData = {
          address: editableCompany.address
      };
      const response = await CompanyService.updateMyCompany(updateData);
      company.value = response.data; // Update local data with response
      editableCompany.address = company.value.address || ''; // Re-sync editable state
      toast.success("Company details updated successfully!");
    } catch (error) {
       console.error("Error updating company details:", error);
       const message = error.response?.data?.message || 'Failed to update company details.';
       updateError.value = message;
       toast.error(message);
    } finally {
       isUpdating.value = false;
    }
  };
  
  
  onMounted(fetchCompanyDetails);
  </script>
  
  <style scoped>
  /* Reuse styles or define specific ones */
  .page-container { display: flex; flex-direction: column; gap: 2rem; }
  h1 { color: var(--dark-color); margin-bottom: 1.5rem; }
  .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
  .card h2 { color: var(--dark-color); margin-bottom: 1.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
  
  .profile-form .form-group { margin-bottom: 1.5rem; }
  .form-group label { /* ... */ display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; }
  .form-group input { /* ... */ width: 100%; padding: 0.7rem 1rem; border: 1px solid #ccc; border-radius: var(--border-radius); font-size: 1rem; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
  .form-group input:focus { /* ... */ outline: none; border-color: var(--primary-color-start); box-shadow: 0 0 0 2px rgba(var(--primary-color-start-rgb), 0.2); }
  .form-group input:disabled { background-color: #e9ecef; cursor: not-allowed; opacity: 0.7; }
  .text-muted { color: #6c757d; font-size: 0.85em; margin-top: 0.25rem; display: block;}
  
  /* Buttons */
  .btn { /* ... */ padding: 0.7rem 1.5rem; border: none; border-radius: var(--border-radius); font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 38px; vertical-align: middle; }
  .btn i.fa-spinner { animation: fa-spin 1.5s linear infinite; }
  .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-primary { background: var(--gradient-main); color: var(--white-color); box-shadow: var(--shadow-light); }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-medium); filter: brightness(1.1); }
  
  /* Loading/Error */
  .loading-indicator { text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
  .loading-indicator i { color: var(--primary-color-start); font-size: 1.5rem; animation: fa-spin 1.5s linear infinite; }
  .error-message { color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 0.8rem 1rem; border-radius: var(--border-radius); margin-bottom: 1.5rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; }
   .error-message.form-error { margin-top: 0; } /* Align with button */
  .error-message i { font-size: 1.1rem; }
  </style>