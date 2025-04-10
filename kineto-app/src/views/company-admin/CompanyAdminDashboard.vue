<template>
    <div class="dashboard-page">
      <h1>Company Dashboard</h1>
      <p v-if="companyName">Stats for: <strong>{{ companyName }}</strong></p>
  
      <div v-if="isLoading" class="loading-indicator">
          <i class="fas fa-spinner fa-spin"></i> Loading dashboard data...
      </div>
      <div v-if="loadError" class="error-message">
          <i class="fas fa-exclamation-triangle"></i> {{ loadError }}
      </div>
  
      <div v-if="!isLoading && stats" class="stats-grid">
        <div class="stat-card medics-active">
          <div class="stat-icon"><i class="fas fa-user-md"></i></div>
          <div class="stat-value">{{ stats.activeMedicCount ?? '0' }}</div>
          <div class="stat-label">Active Medics</div>
        </div>
        <div class="stat-card medics-pending">
           <div class="stat-icon"><i class="fas fa-user-clock"></i></div>
          <div class="stat-value">{{ stats.pendingMedicCount ?? '0' }}</div>
          <div class="stat-label">Pending Medic Invites</div>
        </div>
        <div class="stat-card patients-active">
          <div class="stat-icon"><i class="fas fa-user-injured"></i></div>
          <div class="stat-value">{{ stats.activePatientCount ?? '0' }}</div>
          <div class="stat-label">Active Patients</div>
        </div>
         <div class="stat-card patients-pending">
           <div class="stat-icon"><i class="fas fa-user-plus"></i></div>
           <div class="stat-value">{{ stats.pendingPatientCount ?? '0' }}</div>
           <div class="stat-label">Pending Patients</div>
         </div>
        <div class="stat-card patients-unassigned">
           <div class="stat-icon"><i class="fas fa-user-tag"></i></div>
          <div class="stat-value">{{ stats.unassignedPatientCount ?? '0' }}</div>
          <div class="stat-label">Unassigned Patients</div>
        </div>
      </div>
      <!-- Add more dashboard widgets later (e.g., recent activity) -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import DashboardService from '@/services/DashboardService';
  import { useAuthStore } from '@/stores/auth'; // To get company info maybe
  import { useToast } from 'vue-toastification';
  
  const toast = useToast();
  const authStore = useAuthStore(); // Use if company name needed from user state
  
  const stats = ref(null);
  const isLoading = ref(true);
  const loadError = ref('');
  const companyName = ref(''); // Placeholder for company name
  
  const fetchStats = async () => {
    isLoading.value = true;
    loadError.value = '';
    stats.value = null; // Clear previous stats
    try {
      const response = await DashboardService.getCompanyStats();
      stats.value = response.data;
      // You might need another call to get company name if not in stats DTO
      // or potentially get it from the authStore if added there on login
      // Example: companyName.value = authStore.user?.companyName || 'Your Company';
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      const message = error.response?.data?.message || 'Failed to load dashboard data.';
      loadError.value = message;
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Fetch stats when the component is mounted
  onMounted(() => {
    fetchStats();
    // Fetch company name separately if needed
    // fetchCompanyName();
  });
  
  </script>
  
  <style scoped>
  .dashboard-page h1 {
    color: var(--dark-color);
    margin-bottom: 1.5rem;
  }
  .dashboard-page > p {
      margin-bottom: 2rem;
      font-size: 1.1rem;
      color: var(--text-color);
  }
  
  .loading-indicator { /* Copied/Adapted from AppAdminCompanies */
      text-align: center; padding: 3rem 1rem; color: var(--text-color); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.8rem;
  }
  .loading-indicator i { color: var(--primary-color-start); font-size: 1.5rem; animation: fa-spin 1.5s linear infinite; }
  .error-message { /* Copied/Adapted */
     color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 1rem 1.5rem; border-radius: var(--border-radius); margin-bottom: 1.5rem; font-size: 1rem; display: flex; align-items: center; gap: 0.8rem; justify-content: center;
  }
   .error-message i { font-size: 1.2rem; }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
  }
  
  .stat-card {
    background-color: #fff;
    padding: 1.5rem;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-light);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
   .stat-card:hover {
       transform: translateY(-5px);
       box-shadow: var(--shadow-medium);
   }
  
  .stat-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--primary-color-start); /* Default icon color */
  }
  /* Specific card colors */
  .stat-card.medics-pending .stat-icon { color: #ffc107; } /* Yellow */
  .stat-card.patients-active .stat-icon { color: #28a745; } /* Green */
  .stat-card.patients-pending .stat-icon { color: #fd7e14; } /* Orange */
  .stat-card.patients-unassigned .stat-icon { color: #6c757d; } /* Grey */
  
  
  .stat-value {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--dark-color);
    line-height: 1.2;
  }
  
  .stat-label {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: var(--text-color);
    font-weight: 500;
  }
  </style>