<template>
    <div class="page-container">
      <h1>Package Management</h1>
      <p>Bundle services into convenient packages for your clients.</p>
  
      <!-- Create/Edit Package Form -->
      <section class="card form-section">
        <h2>{{ isEditing ? 'Edit Package' : 'Create New Package' }}</h2>
        <form @submit.prevent="handleFormSubmit" class="package-form">
          <!-- Row 1: Name & Price -->
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="packageName">Package Name *</label>
              <input type="text" id="packageName" v-model="editablePackage.name" required placeholder="e.g., Post-Op Knee Rehab" :disabled="isSubmitting">
            </div>
            <div class="form-group flex-1">
              <label for="packagePrice">Total Price (Optional)</label>
              <input type="number" id="packagePrice" v-model.number="editablePackage.totalPrice" min="0" step="0.01" placeholder="e.g., 650.00" :disabled="isSubmitting">
            </div>
          </div>
          <!-- Row 2: Description -->
          <div class="form-group">
            <label for="packageDescription">Description (Optional)</label>
            <textarea id="packageDescription" v-model="editablePackage.description" rows="3" placeholder="Details about the package..." :disabled="isSubmitting"></textarea>
          </div>
  
          <!-- Row 3: Service Items -->
          <div class="form-group service-items-group">
            <label>Included Services *</label>
            <div v-if="isLoadingServices" class="loading-inline">Loading available services...</div>
            <div v-if="loadServicesError" class="error-message form-error">{{ loadServicesError }}</div>
  
            <div v-if="!isLoadingServices && availableServices.length === 0" class="no-data-message small">
              No active services available to add. Please create services first.
            </div>
  
            <div v-if="!isLoadingServices && availableServices.length > 0">
               <!-- Existing Items List -->
               <div v-for="(item, index) in editablePackage.items" :key="item.serviceId || `new-${index}`" class="service-item-row">
                 <select v-model="item.serviceId" @change="updateItemServiceName(item)" required :disabled="isSubmitting">
                   <option disabled :value="null">-- Select Service --</option>
                   <option v-for="service in availableServices" :key="service.id" :value="service.id">
                     {{ service.name }} ({{ service.durationMinutes }} min)
                   </option>
                 </select>
                 <input type="number" v-model.number="item.quantity" min="1" required placeholder="Qty" class="item-quantity" :disabled="isSubmitting">
                 <button type="button" @click="removeItem(index)" class="btn btn-danger btn-sm btn-remove" title="Remove Item" :disabled="isSubmitting">
                   <i class="fas fa-trash"></i>
                 </button>
               </div>
  
               <!-- Add Item Button -->
               <button type="button" @click="addItem" class="btn btn-secondary btn-sm add-item-btn" :disabled="isSubmitting || availableServices.length === 0">
                   <i class="fas fa-plus"></i> Add Service Item
               </button>
               <div v-if="itemsError" class="error-message form-error small">{{ itemsError }}</div>
            </div>
  
          </div>
  
          <!-- Row 4: Status & Actions -->
          <div class="form-actions">
              <div class="form-group status-toggle">
                  <label for="packageIsActive">Status:</label>
                  <label class="switch">
                      <input type="checkbox" id="packageIsActive" v-model="editablePackage.isActive" :disabled="isSubmitting || (isEditing && !canDeactivateEditingPackage)">
                      <span class="slider round"></span>
                  </label>
                  <span class="status-text">{{ editablePackage.isActive ? 'Active' : 'Inactive' }}</span>
                   <!-- Add tooltip if needed for deactivation check -->
                   <span v-if="isEditing && !editablePackage.isActive && !canDeactivateEditingPackage" class="tooltip-icon" title="Cannot deactivate package: Check if assigned or if contains inactive services.">
                       <i class="fas fa-info-circle"></i>
                   </span>
              </div>
               <div class="button-group">
                  <button type="button" v-if="isEditing" @click="cancelEdit" class="btn btn-cancel" :disabled="isSubmitting">Cancel</button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isValidPackage || (isEditing && !formChanged)">
                      <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> {{ isEditing ? 'Saving...' : 'Creating...' }}</span>
                      <span v-else>{{ isEditing ? 'Save Changes' : 'Create Package' }}</span>
                  </button>
              </div>
          </div>
           <div v-if="formError" class="error-message form-error">{{ formError }}</div>
        </form>
      </section>
  
       <!-- Package List -->
      <section class="card list-section">
        <h2>Existing Packages</h2>
         <div v-if="isLoadingPackages" class="loading-indicator"> <i class="fas fa-spinner fa-spin"></i> Loading packages... </div>
         <div v-if="loadPackagesError" class="error-message table-error"> <i class="fas fa-exclamation-triangle"></i> {{ loadPackagesError }} </div>
  
        <table v-if="!isLoadingPackages && packages.length > 0" class="data-table">
           <thead>
             <tr>
               <th>Name</th>
               <th>Total Price</th>
               <th>Items</th>
               <th>Status</th>
               <th>Actions</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="pkg in packages" :key="pkg.id">
               <td>{{ pkg.name }}</td>
               <td>{{ formatCurrency(pkg.totalPrice) }}</td>
               <td>
                  <ul class="item-list-inline">
                      <li v-for="item in pkg.items" :key="item.itemId || item.serviceId">
                           {{ item.quantity }}x {{ item.serviceName }}
                      </li>
                  </ul>
                  <span v-if="!pkg.items || pkg.items.length === 0">N/A</span>
               </td>
               <td>
                  <span :class="['status-badge', pkg.isActive ? 'status-active' : 'status-inactive']">
                   {{ pkg.isActive ? 'Active' : 'Inactive' }}
                 </span>
               </td>
               <td>
                  <button @click="startEdit(pkg)" class="btn btn-secondary btn-sm" title="Edit Package">
                   <i class="fas fa-edit"></i> Edit
                 </button>
               </td>
             </tr>
           </tbody>
         </table>
          <p v-if="!isLoadingPackages && packages.length === 0 && !loadPackagesError" class="no-data-message">
           No packages found. Create one above.
         </p>
      </section>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed, watch } from 'vue';
  import CompanyAdminServiceManagementService from '@/services/CompanyAdminServiceManagementService';
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  
  // --- Form State ---
  const isEditing = ref(false);
  const editablePackage = reactive({
    id: null,
    name: '',
    description: '',
    totalPrice: null,
    isActive: true,
    items: [] // Array of { serviceId: null, quantity: 1, serviceName: '' }
  });
  const originalPackage = ref(null); // For tracking changes
  const isSubmitting = ref(false);
  const formError = ref('');
  const itemsError = ref(''); // Error related to items list specifically
  const canDeactivateEditingPackage = ref(true);
  
  // --- List State ---
  const packages = ref([]);
  const isLoadingPackages = ref(true);
  const loadPackagesError = ref('');
  
  // --- Available Services State (for dropdown) ---
  const availableServices = ref([]);
  const isLoadingServices = ref(false);
  const loadServicesError = ref('');
  
  
  // --- Computed ---
  const formChanged = computed(() => {
    if (!isEditing.value || !originalPackage.value) return true;
    // Simple JSON compare, might need deep compare for complex objects
    return JSON.stringify(editablePackage) !== JSON.stringify(originalPackage.value);
  });
  
   // Basic validation for package items
   const isValidPackage = computed(() => {
     if (editablePackage.items.length === 0) return false;
     // Check if all items have a service selected and valid quantity
     return editablePackage.items.every(item => item.serviceId && item.quantity >= 1);
   });
  
  
  // --- Methods ---
  const formatCurrency = (value) => { /* ... same as in Services view ... */
      if (value === null || value === undefined) return 'N/A';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  const resetForm = () => {
    isEditing.value = false;
    editablePackage.id = null;
    editablePackage.name = '';
    editablePackage.description = '';
    editablePackage.totalPrice = null;
    editablePackage.isActive = true;
    editablePackage.items = []; // Reset items
    originalPackage.value = null;
    formError.value = '';
    itemsError.value = '';
    canDeactivateEditingPackage.value = true;
  };
  
   const startEdit = (pkg) => {
     isEditing.value = true;
     // Deep copy
     originalPackage.value = JSON.parse(JSON.stringify(pkg));
     // Assign values to reactive form object
     editablePackage.id = originalPackage.value.id;
     editablePackage.name = originalPackage.value.name;
     editablePackage.description = originalPackage.value.description;
     editablePackage.totalPrice = originalPackage.value.totalPrice;
     editablePackage.isActive = originalPackage.value.isActive;
     // Map items for the form { serviceId, quantity, serviceName }
     editablePackage.items = originalPackage.value.items.map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          serviceName: item.serviceName // Keep name for display consistency if needed
     }));
     formError.value = '';
     itemsError.value = '';
     canDeactivateEditingPackage.value = true; // Reset check
   };
  
  const cancelEdit = () => {
    resetForm();
  };
  
  // Fetch available *active* services for the dropdown
  const fetchAvailableServices = async () => {
      isLoadingServices.value = true;
      loadServicesError.value = '';
      availableServices.value = [];
      try {
          const response = await CompanyAdminServiceManagementService.getServices();
           // Filter only active services
           availableServices.value = response.data.filter(s => s.isActive);
      } catch (error) {
           console.error("Error fetching available services:", error);
           loadServicesError.value = "Could not load available services.";
           toast.error(loadServicesError.value);
      } finally {
          isLoadingServices.value = false;
      }
  }
  
   // Fetch existing packages
   const fetchPackages = async () => {
     isLoadingPackages.value = true;
     loadPackagesError.value = '';
     packages.value = [];
     try {
       const response = await CompanyAdminServiceManagementService.getPackages();
       packages.value = response.data;
     } catch (error) {
       console.error("Error fetching packages:", error);
       const message = error.response?.data?.message || 'Failed to load packages.';
       loadPackagesError.value = message;
       toast.error(message);
     } finally {
       isLoadingPackages.value = false;
     }
   };
  
   // --- Item Management in Form ---
   const addItem = () => {
       editablePackage.items.push({ serviceId: null, quantity: 1, serviceName: '' });
       itemsError.value = ''; // Clear item error on add
   };
  
   const removeItem = (index) => {
        editablePackage.items.splice(index, 1);
        validateItems(); // Re-validate after removing
   };
  
   const updateItemServiceName = (item) => {
      const selectedService = availableServices.value.find(s => s.id === item.serviceId);
      item.serviceName = selectedService ? selectedService.name : '';
       validateItems(); // Re-validate after changing service
   };
  
   // Validate item uniqueness and clear errors
   const validateItems = () => {
       itemsError.value = '';
       const selectedIds = new Set();
       for (const item of editablePackage.items) {
           if (item.serviceId) {
               if (selectedIds.has(item.serviceId)) {
                   itemsError.value = "Each service can only be added once per package.";
                   break;
               }
               selectedIds.add(item.serviceId);
           }
       }
   };
  
   // Watch items array for changes to re-validate
   watch(() => editablePackage.items, validateItems, { deep: true });
  
  
   // --- Form Submission ---
    const handleFormSubmit = async () => {
      validateItems(); // Final validation before submit
      if (itemsError.value || !isValidPackage.value) {
          formError.value = "Please fix errors in the included services list.";
          toast.error("Please select a service and quantity for each item, and ensure no duplicate services.");
          return;
      }
  
     isSubmitting.value = true;
     formError.value = ''; // Clear general form error
     try {
       // Prepare data, mapping form items to {serviceId, quantity}
       const packageData = {
         name: editablePackage.name,
         description: editablePackage.description,
         totalPrice: editablePackage.totalPrice,
         isActive: editablePackage.isActive,
         items: editablePackage.items.map(item => ({
           serviceId: item.serviceId,
           quantity: item.quantity
         }))
       };
  
       if (isEditing.value) {
          // UPDATE
          if (!canDeactivateEditingPackage.value && !editablePackage.isActive) {
               throw new Error("Cannot deactivate package based on current checks."); // Add specific checks later
          }
         const response = await CompanyAdminServiceManagementService.updatePackage(editablePackage.id, packageData);
         // Update the list with the full response DTO
         const index = packages.value.findIndex(p => p.id === editablePackage.id);
         if (index !== -1) {
           packages.value[index] = response.data;
         }
         toast.success(`Package "${response.data.name}" updated successfully!`);
         resetForm();
       } else {
         // CREATE
         const response = await CompanyAdminServiceManagementService.createPackage(packageData);
         packages.value.unshift(response.data); // Add new package to list
         toast.success(`Package "${response.data.name}" created successfully!`);
         resetForm();
       }
     } catch (error) {
       console.error(`Error ${isEditing.value ? 'updating' : 'creating'} package:`, error);
       const message = error.response?.data?.message || `Failed to ${isEditing.value ? 'update' : 'create'} package.`;
       formError.value = message; // Show general error
       // Check for specific backend validation errors
       if (error.response?.data?.details) {
           formError.value += ` Details: ${JSON.stringify(error.response.data.details)}`;
       } else if (message.includes("Cannot deactivate package")) {
            canDeactivateEditingPackage.value = false;
            toast.warning(message);
       } else {
           toast.error(message);
       }
     } finally {
       isSubmitting.value = false;
     }
   };
  
   // Fetch initial data
   onMounted(async () => {
      await fetchAvailableServices(); // Load services first for the form
      await fetchPackages(); // Then load existing packages
   });
  
  </script>
  
  <style scoped>
  /* Reuse styles + add specific styles for package items */
   .page-container { display: flex; flex-direction: column; gap: 2rem; }
   h1 { color: var(--dark-color); margin-bottom: 0.5rem; }
   h1 + p { color: var(--text-color); margin-bottom: 1.5rem; font-size: 1.1rem; }
   .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
   .card h2 { color: var(--dark-color); margin-bottom: 1.5rem; font-size: 1.4rem; border-bottom: 1px solid #eee; padding-bottom: 0.8rem; }
  
    /* Form Styles */
   .package-form .form-row { display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
   .package-form .form-group { flex: 1; min-width: 200px; margin-bottom: 1rem; }
   .package-form .form-group.flex-2 { flex: 2; }
   .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; }
   .form-group input[type="text"],
   .form-group input[type="number"],
   .form-group textarea,
   .form-group select { width: 100%; padding: 0.7rem 1rem; border: 1px solid #ccc; border-radius: var(--border-radius); font-size: 1rem; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
   .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--primary-color-start); box-shadow: 0 0 0 2px rgba(var(--primary-color-start-rgb), 0.2); }
   .form-group input:disabled, .form-group textarea:disabled, .form-group select:disabled { background-color: #e9ecef; cursor: not-allowed; }
   .form-group textarea { resize: vertical; min-height: 60px; }
  
    /* Service Items Specific Styles */
   .service-items-group > label { margin-bottom: 1rem; } /* More space below main label */
   .service-item-row { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.8rem; }
   .service-item-row select { flex-grow: 1; }
   .item-quantity { width: 80px; /* Fixed width for quantity input */ text-align: center; }
   .btn-remove { padding: 0.4rem 0.6rem; line-height: 1; flex-shrink: 0;} /* Smaller remove button */
   .add-item-btn { margin-top: 0.5rem; }
   .loading-inline { font-style: italic; color: #6c757d; }
   .form-error.small { font-size: 0.85em; margin-top: 0.5rem; }
  
    /* Form Actions & Status Toggle */
   .form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee; flex-wrap: wrap; gap: 1rem;}
   .button-group { display: flex; gap: 1rem; }
   .status-toggle { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0; }
   .status-toggle label:first-child { margin-bottom: 0; }
   .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
   .switch input { opacity: 0; width: 0; height: 0; }
   .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
   .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
   input:checked + .slider { background-color: var(--primary-color-start); }
   input:checked + .slider:before { transform: translateX(26px); }
   input:disabled + .slider { cursor: not-allowed; opacity: 0.6; }
   .status-text { font-weight: 500; }
    .tooltip-icon { color: #ffc107; cursor: help; margin-left: 0.5rem; }
  
    /* List Styles */
    .list-section { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .data-table th, .data-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
    .data-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .data-table tbody tr:hover { background-color: #f1f3f5; }
    .data-table td:last-child { text-align: right; white-space: nowrap; }
    .data-table .btn { margin-left: 0.5rem; }
    .item-list-inline { list-style: none; padding: 0; margin: 0; font-size: 0.9em; }
    .item-list-inline li { margin-bottom: 0.2rem; color: #555;}
  
     /* Status Badge */
    .status-badge { padding: 0.3em 0.6em; font-size: 0.8rem; font-weight: 600; border-radius: var(--border-radius); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .status-badge.status-active { background-color: #d4edda; color: #155724; }
    .status-badge.status-inactive { background-color: #f8d7da; color: #721c24; }
  

  
  </style>