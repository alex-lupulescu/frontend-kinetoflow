<template>
    <div class="page-container">
      <h1>Company Packages</h1>
      <p>List of active service packages offered by your company.</p>
  
      <section class="card list-section">
         <div v-if="isLoading" class="loading-indicator"> <i class="fas fa-spinner fa-spin"></i> Loading packages... </div>
         <div v-if="loadError" class="error-message table-error"> <i class="fas fa-exclamation-triangle"></i> {{ loadError }} </div>
  
        <table v-if="!isLoading && packages.length > 0" class="data-table package-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Total Price</th>
              <th>Description</th>
              <th>Included Items</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pkg in packages" :key="pkg.id">
              <td>{{ pkg.name }}</td>
              <td>{{ formatCurrency(pkg.totalPrice) }}</td>
              <td class="description-col">{{ pkg.description || 'N/A' }}</td>
              <td>
                <ul class="item-list-inline">
                    <li v-for="item in pkg.items" :key="item.itemId || item.serviceId">
                         {{ item.quantity }}x {{ item.serviceName }}
                    </li>
                </ul>
                <span v-if="!pkg.items || pkg.items.length === 0">N/A</span>
              </td>
            </tr>
          </tbody>
        </table>
          <p v-if="!isLoading && packages.length === 0 && !loadError" class="no-data-message">
           No active packages found for your company.
         </p>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import MedicService from '@/services/MedicService';
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  
  const packages = ref([]);
  const isLoading = ref(true);
  const loadError = ref('');
  
  const formatCurrency = (value) => { if (value === null || value === undefined) return 'N/A'; return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); };
  
  const fetchActivePackages = async () => {
    isLoading.value = true;
    loadError.value = '';
    packages.value = [];
    try {
      const response = await MedicService.getActiveCompanyPackages();
      packages.value = response.data; // Expects PackageDto list
    } catch (error) {
      console.error("Error fetching company packages:", error);
      const message = error.response?.data?.message || 'Failed to load company packages.';
      loadError.value = message;
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  };
  
  onMounted(fetchActivePackages);
  </script>
  
  <style scoped>
  /* Reuse common styles */
  .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
  h1 { color: var(--dark-color); margin-bottom: 0.5rem; }
  h1 + p { color: var(--text-color); margin-bottom: 1.5rem; font-size: 1.1rem; }
  .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
  
  .list-section { overflow-x: auto; }
  .data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .data-table th, .data-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: top; /* Align top for potentially long item lists */ }
  .data-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; vertical-align: middle;}
  .data-table tbody tr:hover { background-color: #f1f3f5; }
  .description-col { max-width: 350px; white-space: normal; font-size: 0.9em; color: #495057; }
  .item-list-inline { list-style: none; padding: 0; margin: 0; font-size: 0.9em; }
  .item-list-inline li { margin-bottom: 0.2rem; color: #555;}
  
  /* Rely on global styles for loading/error/no-data */
  .loading-indicator { /* ... */ }
  .error-message { /* ... */ }
  .no-data-message { /* ... */ }
  .fa-spinner { animation: fa-spin 1.5s linear infinite; }
  @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>