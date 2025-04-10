<template>
    <div class="page-container">
      <h1>Company Services</h1>
      <p>List of active services offered by your company.</p>
  
      <section class="card list-section">
         <div v-if="isLoading" class="loading-indicator"> <i class="fas fa-spinner fa-spin"></i> Loading services... </div>
         <div v-if="loadError" class="error-message table-error"> <i class="fas fa-exclamation-triangle"></i> {{ loadError }} </div>
  
        <table v-if="!isLoading && services.length > 0" class="data-table service-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Category</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in services" :key="service.id">
              <td>{{ service.name }}</td>
              <td>{{ service.durationMinutes }} min</td>
              <td>{{ formatCurrency(service.price) }}</td>
              <td>{{ service.category || 'N/A' }}</td>
              <td class="description-col">{{ service.description || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
          <p v-if="!isLoading && services.length === 0 && !loadError" class="no-data-message">
           No active services found for your company.
         </p>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import MedicService from '@/services/MedicService'; // Use the new service
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  
  const services = ref([]);
  const isLoading = ref(true);
  const loadError = ref('');
  
  const formatCurrency = (value) => { if (value === null || value === undefined) return 'N/A'; return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); };
  
  const fetchActiveServices = async () => {
    isLoading.value = true;
    loadError.value = '';
    services.value = [];
    try {
      const response = await MedicService.getActiveCompanyServices();
      services.value = response.data; // Expects ServiceDto list
    } catch (error) {
      console.error("Error fetching company services:", error);
      const message = error.response?.data?.message || 'Failed to load company services.';
      loadError.value = message;
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  };
  
  onMounted(fetchActiveServices);
  </script>
  
  <style scoped>
  /* Reuse common styles */
  .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
  h1 { color: var(--dark-color); margin-bottom: 0.5rem; }
  h1 + p { color: var(--text-color); margin-bottom: 1.5rem; font-size: 1.1rem; }
  .card { background-color: #fff; padding: 1.5rem 2rem; border-radius: var(--border-radius-large); box-shadow: var(--shadow-light); }
  
  .list-section { overflow-x: auto; }
  .data-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  .data-table th, .data-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid #e9ecef; vertical-align: middle; }
  .data-table th { background-color: #f8f9fa; font-weight: 600; color: var(--dark-color); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
  .data-table tbody tr:hover { background-color: #f1f3f5; }
  .description-col {
      max-width: 300px; /* Limit description width */
      white-space: normal; /* Allow wrapping */
      font-size: 0.9em;
      color: #495057;
  }
  
  /* Rely on global styles for loading/error/no-data */
  .loading-indicator { /* ... */ }
  .error-message { /* ... */ }
  .no-data-message { /* ... */ }
  .fa-spinner { animation: fa-spin 1.5s linear infinite; }
  @keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>