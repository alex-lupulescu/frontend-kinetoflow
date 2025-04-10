<template>
    <div class="unauthorized-page">
      <div class="content">
        <router-link to="/" class="logo-link">
          <h1 class="logo">KinetoFlow</h1>
        </router-link>
        <h2>403 - Unauthorized Access</h2>
        <p>Sorry, you do not have the necessary permissions to access the page you requested.</p>
        <router-link :to="homePath" class="btn-home">Go to My Dashboard</router-link>
        <p class="contact-support">If you believe this is an error, please contact your administrator.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { RouterLink } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const authStore = useAuthStore();
  
  // Determine the appropriate home/dashboard path based on role
  const homePath = computed(() => {
    if (authStore.isAuthenticated) {
      return authStore.getDefaultDashboardRoute(authStore.userRole);
    }
    return '/'; // Fallback to public home if somehow unauthenticated here
  });
  </script>
  
  <style scoped>
  /* Styles similar to NotFoundPage, adjust as needed */
  .unauthorized-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    text-align: center;
    background-color: var(--light-color, #f8f9fa);
    padding: 2rem;
    font-family: 'Poppins', sans-serif;
  }
  
  .content {
    max-width: 600px;
  }
  .logo-link { text-decoration: none; display: block; margin-bottom: 1.5rem; }
  .logo { /* Reuse logo style */ font-size: 2.5rem; font-weight: 700; background: var(--gradient-main); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 1.5rem; }
  
  h2 {
    font-size: 2.5rem; /* Slightly smaller than 404 */
    color: var(--dark-color, #2c3e50);
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    color: var(--text-color, #34495e);
    margin-bottom: 2.5rem;
  }
  
  .btn-home { /* Reuse button style */ display: inline-block; background: var(--gradient-main); color: var(--white-color, #fff); padding: 0.9rem 2rem; border: none; border-radius: var(--border-radius, 12px); text-decoration: none; font-size: 1.1rem; font-weight: 600; transition: all 0.3s ease; box-shadow: var(--shadow-light); }
  .btn-home:hover { transform: translateY(-3px); box-shadow: var(--shadow-medium); filter: brightness(1.1); }
  
  .contact-support {
      margin-top: 2rem;
      font-size: 0.9rem;
      color: #6c757d;
  }
  </style>