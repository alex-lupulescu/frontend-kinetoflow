<template>
    <div class="medic-dashboard">
      <h1>Medic Dashboard</h1>
      <p>Welcome back, {{ authStore.userName }}!</p>
      <p>This is your main dashboard. You can manage your assigned patients, view available services and packages, and access your schedule.</p>
      <!-- Add quick stats or upcoming appointments here later -->
      <div class="quick-links">
           <h3>Quick Access</h3>
          <ul>
              <li><router-link to="/app/medic/my-patients">My Patients</router-link></li>
              <li><router-link to="/app/medic/services">View Services</router-link></li>
              <li><router-link to="/app/medic/packages">View Packages</router-link></li>
              <!-- Add link to calendar later -->
              <!-- <li><router-link to="/app/medic/calendar">My Schedule</router-link></li> -->
          </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  const authStore = useAuthStore();
  </script>
  
  <style scoped>
  /* Reuse styles from GenericDashboard or add specific ones */
  .medic-dashboard {
    padding: 1.5rem;
    background-color: #fff;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-light);
  }
  h1 { margin-bottom: 1rem; color: var(--dark-color); }
  p { color: var(--text-color); line-height: 1.7; margin-bottom: 1rem; font-size: 1.1rem; }
  strong { font-weight: 600; color: var(--primary-color-start); }
  
  .quick-links { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
  .quick-links h3 { margin-bottom: 1rem; font-size: 1.2rem; color: var(--dark-color); }
  .quick-links ul { list-style: none; padding: 0; }
  .quick-links li { margin-bottom: 0.5rem; }
  .quick-links a { color: var(--primary-color-start); text-decoration: none; font-weight: 500; transition: color 0.2s ease; }
  .quick-links a:hover { color: var(--primary-color-end); text-decoration: underline; }
  </style>