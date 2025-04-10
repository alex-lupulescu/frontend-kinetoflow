<template>
    <div class="page-container">
      <h1>Service Management</h1>
      <p>Define the individual therapy sessions and activities offered by your company.</p>
  
      <!-- Create/Edit Service Form (could be modal or separate section) -->
      <section class="card form-section">
        <h2>{{ isEditing ? 'Edit Service' : 'Create New Service' }}</h2>
        <form @submit.prevent="handleFormSubmit" class="service-form">
           <!-- Row 1 -->
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="serviceName">Service Name *</label>
              <input type="text" id="serviceName" v-model="editableService.name" required placeholder="e.g., 60-Minute Physiotherapy" :disabled="isSubmitting">
            </div>
            <div class="form-group flex-1">
               <label for="serviceDuration">Duration (Minutes) *</label>
              <input type="number" id="serviceDuration" v-model.number="editableService.durationMinutes" required min="1" placeholder="e.g., 60" :disabled="isSubmitting">
            </div>
          </div>
           <!-- Row 2 -->
           <div class="form-row">
             <div class="form-group flex-1">
                <label for="servicePrice">Price (Optional)</label>
                <input type="number" id="servicePrice" v-model.number="editableService.price" min="0" step="0.01" placeholder="e.g., 75.00" :disabled="isSubmitting">
              </div>
              <div class="form-group flex-1">
                <label for="serviceCategory">Category (Optional)</label>
                <input type="text" id="serviceCategory" v-model="editableService.category" placeholder="e.g., Treatment, Assessment" :disabled="isSubmitting">
              </div>
           </div>
           <!-- Row 3 -->
          <div class="form-group">
            <label for="serviceDescription">Description (Optional)</label>
            <textarea id="serviceDescription" v-model="editableService.description" rows="3" placeholder="Details about the service..." :disabled="isSubmitting"></textarea>
          </div>
          <!-- Row 4 - Status & Actions -->
          <div class="form-actions">
              <div class="form-group status-toggle">
                  <label for="serviceIsActive">Status:</label>
                  <label class="switch">
                    <input type="checkbox" id="serviceIsActive" v-model="editableService.isActive" :disabled="isSubmitting || (isEditing && !canDeactivateEditingService)">
                    <span class="slider round"></span>
                  </label>
                  <span class="status-text">{{ editableService.isActive ? 'Active' : 'Inactive' }}</span>
                   <!-- Add tooltip or message if trying to deactivate used service -->
                    <span v-if="isEditing && !editableService.isActive && !canDeactivateEditingService" class="tooltip-icon" title="Cannot deactivate service: It's used in active packages.">
                        <i class="fas fa-info-circle"></i>
                    </span>
              </div>
              <div class="button-group">
                  <button type="button" v-if="isEditing" @click="cancelEdit" class="btn btn-cancel" :disabled="isSubmitting">Cancel</button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting || (isEditing && !formChanged)">
                      <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> {{ isEditing ? 'Saving...' : 'Creating...' }}</span>
                      <span v-else>{{ isEditing ? 'Save Changes' : 'Create Service' }}</span>
                  </button>
              </div>
          </div>
          <div v-if="formError" class="error-message form-error">{{ formError }}</div>
        </form>
      </section>
  
      <!-- Service List -->
      <section class="card list-section">
        <h2>Existing Services</h2>
         <div v-if="isLoading" class="loading-indicator"> <i class="fas fa-spinner fa-spin"></i> Loading services... </div>
         <div v-if="loadError" class="error-message table-error"> <i class="fas fa-exclamation-triangle"></i> {{ loadError }} </div>
        <table v-if="!isLoading && services.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in services" :key="service.id">
              <td>{{ service.name }}</td>
              <td>{{ service.durationMinutes }} min</td>
              <td>{{ formatCurrency(service.price) }}</td>
              <td>{{ service.category || 'N/A' }}</td>
              <td>
                <span :class="['status-badge', service.isActive ? 'status-active' : 'status-inactive']">
                  {{ service.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button @click="startEdit(service)" class="btn btn-secondary btn-sm" title="Edit Service">
                  <i class="fas fa-edit"></i> Edit
                </button>
                 <!-- Add direct activate/deactivate later if needed, edit form handles it now -->
                 <!-- <button
                    @click="handleUpdateStatus(service, !service.isActive)"
                    :class="['btn', 'btn-sm', service.isActive ? 'btn-warning' : 'btn-success']" ... >
                    ...
                 </button> -->
              </td>
            </tr>
          </tbody>
        </table>
         <p v-if="!isLoading && services.length === 0 && !loadError" class="no-data-message">
           No services found. Create one above.
         </p>
      </section>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import CompanyAdminServiceManagementService from '@/services/CompanyAdminServiceManagementService';
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  
  // Form State
  const isEditing = ref(false);
  const editableService = reactive({
    id: null,
    name: '',
    description: '',
    durationMinutes: null,
    price: null,
    category: '',
    isActive: true
  });
  const originalService = ref(null); // To track changes
  const isSubmitting = ref(false);
  const formError = ref('');
  const canDeactivateEditingService = ref(true); // Assume can deactivate initially
  
  // List State
  const services = ref([]);
  const isLoading = ref(true);
  const loadError = ref('');
  
  // --- Computed Properties ---
  const formChanged = computed(() => {
    if (!isEditing.value || !originalService.value) return true; // Always allow submit for create
    return JSON.stringify(editableService) !== JSON.stringify(originalService.value);
  });
  
  
  // --- Methods ---
  const formatCurrency = (value) => {
      if (value === null || value === undefined) return 'N/A';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); // Adjust currency as needed
  };
  
  const resetForm = () => {
    isEditing.value = false;
    editableService.id = null;
    editableService.name = '';
    editableService.description = '';
    editableService.durationMinutes = null;
    editableService.price = null;
    editableService.category = '';
    editableService.isActive = true;
    originalService.value = null;
    formError.value = '';
    canDeactivateEditingService.value = true;
  };
  
  const startEdit = (service) => {
    isEditing.value = true;
    // Deep copy to avoid modifying original list item reactivity directly in form
    originalService.value = JSON.parse(JSON.stringify(service));
    Object.assign(editableService, originalService.value); // Copy values to reactive form object
    formError.value = '';
    canDeactivateEditingService.value = true; // Reset check
     // Scroll to form maybe?
     // document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const cancelEdit = () => {
    resetForm();
  };
  
  const fetchServices = async () => {
    isLoading.value = true;
    loadError.value = '';
    services.value = [];
    try {
      const response = await CompanyAdminServiceManagementService.getServices();
      services.value = response.data;
    } catch (error) {
      console.error("Error fetching services:", error);
      const message = error.response?.data?.message || 'Failed to load services.';
      loadError.value = message;
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleFormSubmit = async () => {
    isSubmitting.value = true;
    formError.value = '';
    try {
      const serviceData = { // Prepare data based on reactive form
        name: editableService.name,
        description: editableService.description,
        durationMinutes: editableService.durationMinutes,
        price: editableService.price,
        category: editableService.category,
        isActive: editableService.isActive,
      };
  
      if (isEditing.value) {
        // UPDATE
         if (!canDeactivateEditingService.value && !editableService.isActive) {
            throw new Error("Cannot deactivate service: It's used in active packages.");
         }
        const response = await CompanyAdminServiceManagementService.updateService(editableService.id, serviceData);
        const index = services.value.findIndex(s => s.id === editableService.id);
        if (index !== -1) {
          services.value[index] = response.data; // Update list
        }
        toast.success(`Service "${response.data.name}" updated successfully!`);
        resetForm(); // Go back to create mode
      } else {
        // CREATE
        const response = await CompanyAdminServiceManagementService.createService(serviceData);
        services.value.unshift(response.data); // Add to start of list
        toast.success(`Service "${response.data.name}" created successfully!`);
        resetForm(); // Clear form
      }
    } catch (error) {
      console.error(`Error ${isEditing.value ? 'updating' : 'creating'} service:`, error);
      const message = error.response?.data?.message || `Failed to ${isEditing.value ? 'update' : 'create'} service.`;
      formError.value = message;
       // Specific check for deactivation error during update
      if (isEditing.value && message.includes("Cannot deactivate service")) {
           canDeactivateEditingService.value = false;
           toast.warning(message); // Use warning for this specific case
      } else {
           toast.error(message); // General error toast
      }
  
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Fetch data on mount
  onMounted(fetchServices);
  </script>
  
  <style scoped>
  /* General Page & Card Styles (reuse if defined globally or in layout) */
  .page-container { display: flex; flex-direction: column; gap: 2rem; }
  h1 { color: var(--dark-color); margin-bottom: 0.5rem; }
  h1 + p { color: var(--text-color); margin-bottom: 1.5rem; font-size: 1.1rem; }
  .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
  .card h2 { color: var(--dark-color); margin-bottom: 1.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
  
  /* Form Styles */
  .service-form .form-row { display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .service-form .form-group { flex: 1; min-width: 200px; margin-bottom: 1rem; }
  .service-form .form-group.flex-2 { flex: 2; } /* Allow specific groups to take more space */
  .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; }
  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group textarea { width: 100%; padding: 0.7rem 1rem; border: 1px solid #ccc; border-radius: var(--border-radius); font-size: 1rem; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
  .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--primary-color-start); box-shadow: 0 0 0 2px rgba(var(--primary-color-start-rgb), 0.2); }
  .form-group input:disabled, .form-group textarea:disabled { background-color: #e9ecef; cursor: not-allowed; }
  .form-group textarea { resize: vertical; min-height: 60px; }
  
  .form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee; flex-wrap: wrap; gap: 1rem;}
  .button-group { display: flex; gap: 1rem; }
  
   /* Status Toggle Switch */
  .status-toggle { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0; /* Remove extra margin */ }
  .status-toggle label:first-child { margin-bottom: 0; } /* Adjust label margin */
  .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
  .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
  input:checked + .slider { background-color: var(--primary-color-start); }
  input:checked + .slider:before { transform: translateX(26px); }
  input:disabled + .slider { cursor: not-allowed; opacity: 0.6; }
  .status-text { font-weight: 500; }
  .tooltip-icon { color: #ffc107; cursor: help; margin-left: 0.5rem; }
  
   /* Table Styles */
   .list-section { overflow-x: auto; }
   .data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
   .data-table th, .data-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
   .data-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
   .data-table tbody tr:hover { background-color: #f1f3f5; }
   .data-table td:last-child { text-align: right; white-space: nowrap; }
   .data-table .btn { margin-left: 0.5rem; }
  
   /* Status Badge */
  .status-badge { padding: 0.3em 0.6em; font-size: 0.8rem; font-weight: 600; border-radius: var(--border-radius); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .status-badge.status-active { background-color: #d4edda; color: #155724; }
  .status-badge.status-inactive { background-color: #f8d7da; color: #721c24; } /* Different color for inactive */
  

  </style>