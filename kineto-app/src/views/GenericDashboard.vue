<template>
    <div class="generic-dashboard">
      <h1>Welcome to KinetoFlow!</h1>
      <p v-if="authStore.isAuthenticated">
        You are logged in as <strong>{{ authStore.userName }}</strong> (Role: {{ formattedRole }}).
      </p>
      <p>
        Please use the sidebar navigation to access the features available for your role.
      </p>
      <!-- You could add role-specific welcome messages or quick links here later -->
      <div v-if="authStore.userRole === 'COMPANY_ADMIN'" class="quick-links">
          <h3>Quick Actions:</h3>
          <ul>
              <li><router-link to="/app/company/medics">Manage Medics</router-link></li>
              <li><router-link to="/app/company/patients">Manage Patients</router-link></li>
              <li><router-link to="/app/company/profile">View Company Profile</router-link></li>
          </ul>
      </div>
       <div v-if="authStore.userRole === 'APP_ADMIN'" class="quick-links">
          <h3>Quick Actions:</h3>
          <ul>
              <li><router-link to="/app/admin/companies">Manage Companies</router-link></li>
              <!-- Add link to manage users later -->
          </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { RouterLink } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const authStore = useAuthStore();
  
  // Format role name for display
  const formattedRole = computed(() => {
    if (!authStore.userRole) return 'N/A';
    // Simple formatting: replace underscore with space, capitalize words
    return authStore.userRole
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });
  </script>
  
  <style scoped>
  .generic-dashboard {
    padding: 1.5rem;
    background-color: #fff;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-light);
  }
  
  h1 {
    margin-bottom: 1rem;
    color: var(--dark-color);
  }
  
  p {
      color: var(--text-color);
      line-height: 1.7;
      margin-bottom: 1rem;
      font-size: 1.1rem;
  }
  
  strong {
      font-weight: 600;
      color: var(--primary-color-start);
  }
  
  .quick-links {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
  }
  .quick-links h3 {
      margin-bottom: 1rem;
      font-size: 1.2rem;
      color: var(--dark-color);
  }
  .quick-links ul {
      list-style: none;
      padding: 0;
  }
  .quick-links li {
      margin-bottom: 0.5rem;
  }
  .quick-links a {
      color: var(--primary-color-start);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
  }
  .quick-links a:hover {
      color: var(--primary-color-end);
      text-decoration: underline;
  }
  </style>