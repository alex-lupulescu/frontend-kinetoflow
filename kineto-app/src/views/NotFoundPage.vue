<template>
    <div class="not-found-page">
      <div class="content">
        <router-link to="/" class="logo-link">
          <h1 class="logo">KinetoFlow</h1>
        </router-link>
        <h2>404 - Page Not Found</h2>
        <p>Oops! The page you are looking for does not exist or may have been moved.</p>
        <router-link to="/" class="btn-home">Go to Homepage</router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router';
  </script>
  
  <style scoped>
  /* Styles could be shared with auth pages or defined globally/scoped */
  .not-found-page {
    display: flex;
    flex-direction: column; /* Center content vertically */
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    text-align: center;
    background-color: var(--light-color, #f8f9fa);
    padding: 2rem;
    font-family: 'Poppins', sans-serif; /* Ensure font */
  }
  
  .content {
    max-width: 600px;
  }
  .logo-link {
      text-decoration: none;
      display: block; /* Or inline-block */
      margin-bottom: 1.5rem;
  }
  
   .logo {
       font-size: 2.5rem;
       font-weight: 700;
       background: var(--gradient-main, linear-gradient(135deg, #4a90e2, #50e3c2));
       -webkit-background-clip: text;
       background-clip: text;
       color: transparent;
       margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 3rem;
    color: var(--dark-color, #2c3e50);
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.2rem;
    color: var(--text-color, #34495e);
    margin-bottom: 2.5rem;
  }
  
  .btn-home {
    display: inline-block;
    background: var(--gradient-main, linear-gradient(135deg, #4a90e2, #50e3c2));
    color: var(--white-color, #fff);
    padding: 0.9rem 2rem;
    border: none;
    border-radius: var(--border-radius, 12px);
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-light, 0 5px 15px rgba(0, 0, 0, 0.08));
  }
  
  .btn-home:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-medium, 0 8px 25px rgba(74, 144, 226, 0.15));
    filter: brightness(1.1);
  }
  </style>